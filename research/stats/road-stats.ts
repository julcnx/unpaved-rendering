// Kilometre statistics of paved and unpaved roads per road class.
// Input (stdin): osmium export -f geojsonseq -u type_id --geometry-types=linestring
// Usage: osmium export ... | node road-stats.ts <country-code> <data-date> [country-name] > <out.json>
// Optional env for run metadata: OSMIUM_VERSION, SOURCE_PBF, BOUNDARY, DATA_DATE_SOURCE.
// COMBOS_OUT=<file>: also write km per tag combination, so new rules can be applied without the extract.
// COMBOS_IN=<file>: read that table instead of stdin (no way ids, so the odd-way lists stay empty).

import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  classifyDetailed, surfaceBase, SMOOTHNESS, TRACKTYPE_MARK, FOUR_WD_ONLY,
  type Tags,
} from '../classifier/classify.ts';

const CLASSES = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'] as const;
type Bucket = 'paved_tagged' | 'untagged' | 'unpaved' | 'offroad' | 'specialized';
const BUCKETS: Bucket[] = ['paved_tagged', 'untagged', 'unpaved', 'offroad', 'specialized'];
const MAJOR = new Set(['motorway', 'trunk', 'primary', 'secondary']);
const COMBO_KEYS = ['highway', 'surface', 'smoothness', 'tracktype', '4wd_only'];
const TOP_WAYS = 15;
const MIN_ODD_KM = 0.5;
const COVERAGE_KEYS = ['surface', 'smoothness', 'tracktype', '4wd_only'];
// Documented Key:surface values that are unpaved by design. Any other unpaved value is a typo or local value.
const KNOWN_UNPAVED = new Set([
  'unpaved', 'compacted', 'fine_gravel', 'gravel', 'unhewn_cobblestone', 'dirt', 'earth', 'ground', 'grass',
  'grass_paver', 'mud', 'sand', 'rock', 'pebblestone', 'clay', 'laterite', 'woodchips', 'snow', 'ice', 'salt',
  'concrete:lanes', 'stepping_stones', 'shells',
]);
// Files whose changes can change the numbers.
const PIPELINE_FILES = ['../classifier/classify.ts', './road-stats.ts', './run-country.sh'];

const [country = '??', dataDate = '', name = ''] = process.argv.slice(2);

function lengthKm(coords: number[][]): number {
  const R = 6371.0088;
  let km = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1].map((d) => (d * Math.PI) / 180);
    const [lon2, lat2] = coords[i].map((d) => (d * Math.PI) / 180);
    const a = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
    km += 2 * R * Math.asin(Math.sqrt(a));
  }
  return km;
}

const sha = (files: string[]) => {
  const h = createHash('sha256');
  for (const f of files) h.update(readFileSync(new URL(f, import.meta.url)));
  return h.digest('hex').slice(0, 12);
};

const add = (m: Record<string, number>, k: string, v: number) => (m[k] = (m[k] ?? 0) + v);
const perClass = <T>(make: () => T): Record<string, T> =>
  Object.fromEntries([...CLASSES, 'all'].map((c) => [c, make()]));

const km = perClass(() => Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Record<Bucket, number>);
// Km with each tag present (any value).
const coverageKm = perClass((): Record<string, number> => ({}));
// Which tag decided the base level, and which tag set the mark.
const baseSourceKm = perClass((): Record<string, number> => ({}));
const markSourceKm = perClass((): Record<string, number> => ({}));
// Deciding values: unpaved -> surface or tracktype value, offroad/specialized -> mark value.
const valueKm = perClass(() => ({ unpaved: {}, offroad: {}, specialized: {} }) as Record<string, Record<string, number>>);
// Values ignored by the classifier, or unpaved only because they are not in any known list (typos, local values).
const unknownValueKm: Record<string, number> = {};
// Sanity: off-road evidence ignored on paved roads, and smoothness excellent/good on unpaved surfaces.
const conflictKm: Record<string, number> = {};
const combos = new Map<string, number>();

type WayNote = { id: string; highway: string; km: number; level: string; tags: Tags };
const odd: Record<string, WayNote[]> = { major_unpaved: [], offroad_mark: [], conflict: [], unknown_value: [] };

function keepTop(list: WayNote[], note: WayNote) {
  if (!note.id || note.km < MIN_ODD_KM) return;
  list.push(note);
  list.sort((a, b) => b.km - a.km);
  if (list.length > TOP_WAYS) list.pop();
}

function offroadEvidence(tags: Tags): string | null {
  if (tags.smoothness && SMOOTHNESS[tags.smoothness]) return `smoothness=${tags.smoothness}`;
  if (tags.tracktype && TRACKTYPE_MARK[tags.tracktype]) return `tracktype=${tags.tracktype}`;
  if (tags['4wd_only'] && FOUR_WD_ONLY[tags['4wd_only']]) return `4wd_only=${tags['4wd_only']}`;
  return null;
}

function addWay(id: string, tags: Tags, len: number) {
  const highway = tags.highway ?? '';
  if (!(CLASSES as readonly string[]).includes(highway)) return;
  const r = classifyDetailed(tags);
  const comboKey = JSON.stringify(COMBO_KEYS.map((k) => tags[k] ?? null));
  combos.set(comboKey, (combos.get(comboKey) ?? 0) + len);

  // Untagged = paved by default: rendered as Paved, but nobody said so.
  const bucket: Bucket = r.level === 'paved' ? (r.baseSource === 'default' ? 'untagged' : 'paved_tagged') : r.level;
  for (const c of [highway, 'all']) {
    km[c][bucket] += len;
    add(baseSourceKm[c], r.baseSource, len);
    if (r.markSource) add(markSourceKm[c], r.markSource, len);
    for (const k of COVERAGE_KEYS) if (tags[k]) add(coverageKm[c], k, len);
    if (r.base === 'unpaved') add(valueKm[c].unpaved, `${r.baseSource}=${tags[r.baseSource] ?? ''}`, len);
    if (r.mark) add(valueKm[c][r.mark], `${r.markSource}=${tags[r.markSource!]}`, len);
  }

  const note: WayNote = { id, highway, km: len, level: r.level, tags };
  if (MAJOR.has(highway) && r.base === 'unpaved') keepTop(odd.major_unpaved, note);
  if (r.mark) keepTop(odd.offroad_mark, note);

  const evidence = r.base === 'paved' ? offroadEvidence(tags) : null;
  if (evidence) {
    add(conflictKm, `paved (${tags.surface ? `surface=${tags.surface}` : 'no surface'}) + ${evidence}`, len);
    keepTop(odd.conflict, note);
  }
  if (r.base === 'unpaved' && tags.surface && (tags.smoothness === 'excellent' || tags.smoothness === 'good')) {
    add(conflictKm, `smoothness=${tags.smoothness} + surface=${tags.surface}`, len);
    keepTop(odd.conflict, note);
  }

  const unknown: string[] = [];
  if (tags.smoothness && !(tags.smoothness in SMOOTHNESS)) unknown.push(`smoothness=${tags.smoothness}`);
  if (tags.tracktype && !(tags.tracktype in TRACKTYPE_MARK)) unknown.push(`tracktype=${tags.tracktype}`);
  if (tags['4wd_only'] && !FOUR_WD_ONLY[tags['4wd_only']] && tags['4wd_only'] !== 'no') unknown.push(`4wd_only=${tags['4wd_only']}`);
  if (tags.surface && r.base === 'unpaved') {
    const parts = tags.surface.split(';').map((s) => s.trim());
    if (parts.some((p) => surfaceBase(p) === 'unpaved' && !KNOWN_UNPAVED.has(p))) unknown.push(`surface=${tags.surface}`);
  }
  for (const u of unknown) add(unknownValueKm, u, len);
  if (unknown.length) keepTop(odd.unknown_value, note);
}

if (process.env.COMBOS_IN) {
  for (const [values, len] of JSON.parse(readFileSync(process.env.COMBOS_IN, 'utf8')).combos) {
    addWay('', Object.fromEntries(COMBO_KEYS.map((k, i) => [k, values[i] ?? undefined])), len);
  }
} else {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const raw of rl) {
    const line = raw.replace(/^\x1e/, '').trim();
    if (!line) continue;
    const f = JSON.parse(line);
    addWay(f.id, f.properties, lengthKm(f.geometry.coordinates));
  }
}

if (process.env.COMBOS_OUT) {
  writeFileSync(process.env.COMBOS_OUT, JSON.stringify({
    country, data_date: dataDate, keys: COMBO_KEYS,
    combos: [...combos].sort((a, b) => b[1] - a[1]).map(([k, v]) => [JSON.parse(k), Math.round(v * 1000) / 1000]),
  }));
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const round = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, r1(v)]));
const mapValues = <T, U>(o: Record<string, T>, fn: (v: T) => U) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fn(v)]));

console.log(JSON.stringify({
  country,
  name,
  data_date: dataDate,
  run: {
    generated_at: new Date().toISOString(),
    classifier_sha256: sha(PIPELINE_FILES.slice(0, 1)),
    pipeline_sha256: sha(PIPELINE_FILES),
    osmium: process.env.OSMIUM_VERSION ?? '',
    source_pbf: process.env.SOURCE_PBF ?? '',
    boundary: process.env.BOUNDARY ?? '',
    data_date_source: process.env.DATA_DATE_SOURCE ?? '',
    from_combos: Boolean(process.env.COMBOS_IN),
  },
  km: mapValues(km, round),
  coverage_km: mapValues(coverageKm, round),
  base_source_km: mapValues(baseSourceKm, round),
  mark_source_km: mapValues(markSourceKm, round),
  value_km: mapValues(valueKm, (byLevel) => mapValues(byLevel, round)),
  unknown_value_km: round(unknownValueKm),
  conflict_km: round(conflictKm),
  odd: mapValues(odd, (list) => list.map((n) => ({ ...n, km: r1(n.km) }))),
}, null, 1));
