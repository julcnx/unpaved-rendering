// Run: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyDetailed } from '../js/classify.js';

for (const c of JSON.parse(readFileSync(new URL('./test-cases.json', import.meta.url), 'utf8'))) {
  test(JSON.stringify(c.tags), () => { const { tags, ...expected } = c; assert.deepEqual(classifyDetailed(tags), expected); });
}
