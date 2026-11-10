// Run: node --test classifier/classify.test.ts
// Cases are shared with the Lua and SQL ports.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyDetailed } from './classify.ts';

const cases = JSON.parse(readFileSync(new URL('./test-cases.json', import.meta.url), 'utf8'));

for (const c of cases) {
  test(JSON.stringify(c.tags), () => {
    const { tags, ...expected } = c;
    assert.deepEqual(classifyDetailed(tags), expected);
  });
}

// TypeScript only: tag values that are names of built-in object properties are unknown values, not matches.
test('values named like built-in properties are ignored', () => {
  for (const v of ['constructor', 'toString', 'valueOf', '__proto__']) {
    assert.equal(classifyDetailed({ highway: 'tertiary', surface: 'gravel', smoothness: v, tracktype: v, '4wd_only': v }).level, 'unpaved');
    assert.equal(classifyDetailed({ highway: 'tertiary', tracktype: v }).baseSource, 'default');
  }
});
