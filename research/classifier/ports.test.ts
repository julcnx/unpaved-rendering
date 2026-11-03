// Runs the shared test cases against the Lua and SQL ports.
// Run: node --test classifier/ports.test.ts
// Lua needs luajit (or lua) on PATH. SQL runs only when PGHOST/PGPORT point to a test database
// where the current user can create functions (psql on PATH).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
const cases: { tags: Record<string, string>; level: string; baseSource: string; markSource: string | null }[] =
  JSON.parse(readFileSync(new URL('./test-cases.json', import.meta.url), 'utf8'));

test('Lua port matches all cases', () => {
  const luaCases = cases.map((c) =>
    '{' + Object.entries(c.tags).map(([k, v]) => `[${JSON.stringify(k)}]=${JSON.stringify(v)}`).join(',') + '}').join(',\n');
  const script = `package.path = ${JSON.stringify(dir + '?.lua')} .. ';' .. package.path
local d = require('classify')
for _, tags in ipairs({${luaCases}}) do
  local level, _, base_source, _, mark_source = d.classify(tags)
  print(level .. '\\t' .. base_source .. '\\t' .. (mark_source or ''))
end`;
  const lua = ['luajit', 'lua'].find((bin) => { try { execFileSync(bin, ['-v'], { stdio: 'ignore' }); return true; } catch { return false; } });
  assert.ok(lua, 'luajit or lua not found');
  const lines = execFileSync(lua!, ['-'], { input: script }).toString().replace(/\n$/, '').split('\n');
  cases.forEach((c, i) => assert.equal(lines[i], `${c.level}\t${c.baseSource}\t${c.markSource ?? ''}`, JSON.stringify(c.tags)));
});

test('SQL port matches all levels', { skip: !process.env.PGHOST && 'set PGHOST/PGPORT to run' }, () => {
  const q = (v?: string) => (v === undefined ? 'NULL' : `'${v.replace(/'/g, "''")}'`);
  const rows = cases.map((c, i) =>
    `(${i}, ${q(c.tags.highway)}, ${q(c.tags.surface)}, ${q(c.tags.smoothness)}, ${q(c.tags.tracktype)}, ${q(c.tags['4wd_only'])})`).join(',\n');
  const sql = readFileSync(new URL('./classify.sql', import.meta.url), 'utf8') +
    `\nSELECT drivability(h, s, sm, t, f) FROM (VALUES ${rows}) AS v(i, h, s, sm, t, f) ORDER BY i;`;
  const lines = execFileSync('psql', ['-X', '-q', '-tA', '-v', 'ON_ERROR_STOP=1', '-d', process.env.PGDATABASE ?? 'postgres'], { input: sql })
    .toString().trim().split('\n');
  cases.forEach((c, i) => assert.equal(lines[i], c.level, JSON.stringify(c.tags)));
});
