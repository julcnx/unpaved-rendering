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
