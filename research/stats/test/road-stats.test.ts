// Run: node --test stats/test/road-stats.test.ts
// Fixture ways lie on the equator: 0.01 degree of longitude = 1.112 km.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = new URL('../road-stats.ts', import.meta.url).pathname;
const input = readFileSync(new URL('./fixture.geojsonseq', import.meta.url));
const combosFile = join(mkdtempSync(join(tmpdir(), 'road-stats-')), 'combos.json');
const d = JSON.parse(execFileSync('node', [script, 'xx', '2026-01-01', 'Test'], { input, env: { ...process.env, COMBOS_OUT: combosFile } }).toString());

test('buckets per class', () => {
  assert.equal(d.km.tertiary.paved_tagged, 1.1);
  assert.equal(d.km.tertiary.untagged, 2.2);
  assert.equal(d.km.unclassified.unpaved, 1.1);
  assert.equal(d.km.unclassified.offroad, 1.1, 'dirt + very_bad gets the mark');
  assert.equal(d.km.residential.untagged, 1.1, 'unknown smoothness only counts as untagged');
  assert.equal(d.km.secondary.paved_tagged, 1.1, 'off-road evidence is ignored on paved roads');
  assert.equal(d.km.secondary.offroad, 1.1, 'gravel + 4wd_only=yes gets the mark');
});

test('all row sums the classes and ignores other highways', () => {
  // 7 road ways of 1.112 km (w2 is twice as long), footway excluded.
  assert.equal(d.km.all.untagged, 3.3);
  assert.equal(d.km.all.paved_tagged, 2.2);
  assert.equal(d.km.all.unpaved, 1.1);
  assert.equal(d.km.all.offroad, 2.2);
});

test('coverage, sources, deciding values and sanity lists', () => {
  assert.equal(d.coverage_km.tertiary.surface, 1.1);
  assert.equal(d.coverage_km.all.smoothness, 3.3);
  assert.equal(d.mark_source_km.all.smoothness, 1.1);
  assert.equal(d.mark_source_km.all['4wd_only'], 1.1);
  assert.equal(d.value_km.all.unpaved['surface=unpaved'], 1.1);
  assert.equal(d.value_km.all.offroad['4wd_only=yes'], 1.1);
  assert.equal(d.unknown_value_km['smoothness=rough'], 1.1);
  assert.equal(d.conflict_km['paved (surface=asphalt) + smoothness=very_bad'], 1.1);
  assert.deepEqual(d.odd.major_unpaved.map((n: any) => n.id), ['w8']);
  assert.deepEqual(d.odd.conflict.map((n: any) => n.id), ['w6']);
});

test('combos table gives the same km without the extract', () => {
  const again = JSON.parse(execFileSync('node', [script, 'xx', '2026-01-01', 'Test'], { env: { ...process.env, COMBOS_IN: combosFile } }).toString());
  assert.deepEqual(again.km, d.km);
  assert.deepEqual(again.odd.major_unpaved, []);
});

test('run metadata', () => {
  assert.equal(d.name, 'Test');
  assert.match(d.run.classifier_sha256, /^[0-9a-f]{12}$/);
  assert.notEqual(d.run.pipeline_sha256, d.run.classifier_sha256);
});
