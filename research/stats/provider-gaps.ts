// How far is each open provider's paved/unpaved rule from ours? Runs each rule, copied from its source,
// over the tag-combination tables (54 countries, no extract needed) and counts the km it draws differently.
// Usage: node stats/provider-gaps.ts > stats/provider-gaps.md

import { readdirSync, readFileSync } from 'node:fs';
import { classifyDetailed, type Tags } from '../classifier/classify.ts';

const set = (...v: string[]) => new Set(v);
const MAIN = set('motorway', 'trunk', 'primary', 'secondary', 'tertiary');

// Each rule: true = drawn as unpaved. Sources pinned to the commits checked on 2026-11-09.
type Rule = { name: string; source: string; unpaved: (t: Tags) => boolean };
const CARTO_UNPAVED = set('unpaved', 'compacted', 'dirt', 'earth', 'fine_gravel', 'grass', 'grass_paver', 'gravel', 'ground',
  'mud', 'pebblestone', 'salt', 'sand', 'woodchips', 'clay', 'ice', 'snow');
const OMT_UNPAVED = set('unpaved', 'compacted', 'dirt', 'earth', 'fine_gravel', 'grass', 'grass_paver', 'gravel', 'gravel_turf',
  'ground', 'ice', 'mud', 'pebblestone', 'salt', 'sand', 'snow', 'woodchips', 'rock', 'clay', 'laterite');
const OM_PAVED = set('asphalt', 'cobblestone', 'chipseal', 'concrete', 'grass_paver', 'stone', 'metal', 'paved',
  'paving_stones', 'sett', 'brick', 'bricks', 'unhewn_cobblestone', 'wood');
const OM_VERY_BAD_SMOOTHNESS = set('very_bad', 'horrible', 'very_horrible', 'impassable', 'robust_wheels', 'high_clearance', 'off_road_wheels', 'rough');
const HOT_PAVED = set('paved', 'paving_stones', 'asphalt', 'concrete');

function cyclosmType(t: Tags): string {
  const s = t.smoothness, tt = t.tracktype, su = t.surface;
  if (!s && !tt && !su) return 'unknown';
  if (s && ['horrible', 'very_horrible', 'impassable'].includes(s)) return 'mtb';
  if (s && ['bad', 'very_bad'].includes(s)) return 'cyclocross';
  if (s && ['excellent', 'good', 'intermediate'].includes(s)) return 'road';
  if (tt && ['grade4', 'grade5'].includes(tt)) return 'mtb';
  if (tt && ['grade2', 'grade3'].includes(tt)) return 'cyclocross';
  if (tt === 'grade1') return 'road';
  if (su && ['pebblestone', 'dirt', 'earth', 'grass', 'grass_paver', 'gravel_turf', 'ground', 'mud', 'sand', 'laterite'].includes(su)) return 'mtb';
  if (su && ['concrete:lanes', 'concrete:plates', 'gravel', 'sett', 'unhewn_cobblestone', 'cobblestone', 'wood', 'compacted', 'fine_gravel', 'woodchips'].includes(su)) return 'cyclocross';
  if (su && ['paved', 'asphalt', 'concrete', 'paving_stones'].includes(su)) return 'road';
  return 'unknown';
}

const RULES: Rule[] = [
  { name: 'OSM Carto', source: '[functions.sql `carto_highway_int_surface`](https://github.com/openstreetmap-carto/openstreetmap-carto/blob/003cefdd/functions.sql#L77): explicit unpaved list, everything else paved',
    unpaved: (t) => !!t.surface && CARTO_UNPAVED.has(t.surface) },
  { name: 'OpenMapTiles (Americana, MapTiler, Stadia)', source: '[Transportation.java L132-L139](https://github.com/openmaptiles/planetiler-openmaptiles/blob/5a837b161/src/main/java/org/openmaptiles/layers/Transportation.java#L132-L139): explicit unpaved list (`tracktype` only adds `grade1` as paved); from z12 only',
    unpaved: (t) => !!t.surface && OMT_UNPAVED.has(t.surface) },
  { name: 'CyclOSM', source: '[views.sql `surface_type`](https://github.com/cyclosm/cyclosm-cartocss-style/blob/7b446ca8/views.sql#L149-L172): `smoothness` > `tracktype` > `surface`, explicit lists; dashes on primary and below only, from z14',
    unpaved: (t) => !['motorway', 'trunk'].includes(t.highway!) && ['cyclocross', 'mtb'].includes(cyclosmType(t)) },
  { name: 'Organic Maps / CoMaps (data only, not drawn)', source: '[osm2type.cpp L579-L581, L700-L756](https://github.com/organicmaps/organicmaps/blob/3e4abc2c1b/generator/osm2type.cpp#L579-L581): paved whitelist; no surface but very bad `smoothness` = unpaved',
    unpaved: (t) => t.surface ? !OM_PAVED.has(t.surface) : !!t.smoothness && OM_VERY_BAD_SMOOTHNESS.has(t.smoothness) },
  { name: 'HOT Humanitarian', source: '[project.yml L343-L351](https://github.com/hotosm/HDM-CartoCSS/blob/ff2bb32dc96e5e450dab052be0df0dff40f1c139/project.yml#L343-L351): 4-value paved whitelist; no surface is paved on main roads, unpaved on unclassified and residential',
    unpaved: (t) => t.surface ? !HOT_PAVED.has(t.surface) : !MAIN.has(t.highway!) },
];

type Combos = { country: string; keys: string[]; combos: [(string | null)[], number][] };
const files = readdirSync(new URL('./combos/', import.meta.url)).filter((f) => f.endsWith('.json') && f !== 'aq.json');
type Acc = { ours: number; hit: number; missed: number; extra: number; missedBy: Map<string, number>; extraBy: Map<string, number> };
const acc = (scope: string, r: Rule) => (stats[scope][r.name] ??= { ours: 0, hit: 0, missed: 0, extra: 0, missedBy: new Map(), extraBy: new Map() });
const stats: Record<string, Record<string, Acc>> = { main: {}, all: {} };
let total = 0;
for (const f of files) {
  const c: Combos = JSON.parse(readFileSync(new URL(`./combos/${f}`, import.meta.url), 'utf8'));
  for (const [values, km] of c.combos) {
    const t: Tags = Object.fromEntries(c.keys.map((k, i) => [k, values[i] ?? undefined]));
    const ours = classifyDetailed(t).base === 'unpaved';
    total += km;
    for (const scope of MAIN.has(t.highway!) ? ['main', 'all'] : ['all']) {
      for (const r of RULES) {
        const a = acc(scope, r), theirs = r.unpaved(t);
        const label = t.surface ? `surface=${t.surface}` : t.tracktype ? `tracktype=${t.tracktype} (no surface)` : t.smoothness ? `smoothness=${t.smoothness} (no surface)` : `no surface (${t.highway})`;
        if (ours) a.ours += km;
        if (ours && theirs) a.hit += km;
        if (ours && !theirs) { a.missed += km; a.missedBy.set(label, (a.missedBy.get(label) ?? 0) + km); }
        if (!ours && theirs) { a.extra += km; a.extraBy.set(label, (a.extraBy.get(label) ?? 0) + km); }
      }
    }
  }
}

const km = (n: number) => Math.round(n).toLocaleString('en-US');
const pct = (a: number, b: number) => (b ? (100 * a / b).toFixed(1) : '0.0');
const top = (m: Map<string, number>, n = 4) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `\`${k}\` ${km(v)}`).join(', ') || 'none';

console.log(`# Provider rules against ours

Generated by \`stats/provider-gaps.ts\` from \`stats/combos/\` (${files.length} countries, Antarctica excluded, ${(total / 1e6).toFixed(1)} million km). Each provider's paved/unpaved rule, copied from its source, is run on the same roads as ours ([classifier](../classifier/classify.ts): paved whitelist, missing surface = paved on roads). It shows the data side only: zoom limits and road classes without any styling are noted in the rule column.

- **Covers**: share of our Unpaved km that the provider also draws as unpaved.
- **Missed**: our Unpaved km it draws as paved, with the biggest values.
- **Extra**: km it draws as unpaved that we call Paved (tagged or untagged), with the biggest values.
`);
for (const [scope, title] of [['main', 'Main roads (motorway, trunk, primary, secondary, tertiary)'], ['all', 'All road classes (motorway to residential)']] as const) {
  console.log(`## ${title}\n\n| Provider | Covers | Missed km | Biggest misses | Extra km | Biggest extras |\n|---|---:|---:|---|---:|---|`);
  for (const r of RULES) {
    const a = stats[scope][r.name];
    console.log(`| ${r.name} | ${pct(a.hit, a.ours)}% | ${km(a.missed)} | ${top(a.missedBy)} | ${km(a.extra)} | ${top(a.extraBy, 3)} |`);
  }
  console.log('');
}
console.log('## Rules\n');
for (const r of RULES) console.log(`- **${r.name}**: ${r.source}`);
