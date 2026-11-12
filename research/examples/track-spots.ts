// Screenshot views for the track round (todo: track rendering per app): views where many track, path and
// unpaved-road tag combinations sit together, so every app is shown the same test.
// Input: Geofabrik extracts filtered and exported with osmium (no Overpass, decision 11):
//   osmium tags-filter -o pbf/<c>-ways.osm.pbf pbf/<c>-latest.osm.pbf w/highway=track,path,footway,bridleway,cycleway,trunk,primary,secondary,tertiary,unclassified,residential
//   osmium export -f geojsonseq --geometry-types=linestring -a type,id -o pbf/<c>-ways.geojsonseq pbf/<c>-ways.osm.pbf
// Usage: node examples/track-spots.ts thailand switzerland   (writes examples/track-spots.json and .md)

import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { classify, PAVED_SURFACES } from '../classifier/classify.ts';

const Z = 15;
const W = 4, H = 3; // a 1200 x 800 screenshot at z15 covers about 4.7 x 3.1 tiles
const VIEWS = 3; // picked views per country, after the hand-picked ones
// Hand-picked views, scored like the others and listed first; the picked views then cover what they miss.
const HAND: Record<string, { name: string; lat: number; lon: number }[]> = {
  // North of Chiang Rai: many path with motorcycle=yes, the rural riding case (Julien, from Gaia GPS, 2026-11-12).
  thailand: [{ name: 'chiangrai', lat: 20.0259, lon: 99.678 }],
};
const MIN_M = 200; // a combination counts in a view only with this much length inside it, so it shows on the shot

const BAD = new Set(['very_bad', 'horrible', 'very_horrible', 'impassable']);
const MAIN = new Set(['trunk', 'primary', 'secondary']);
const MINOR = new Set(['unclassified', 'residential']);

// Tag combinations a way stands for. Tracks: grades, no grade, paved, very bad smoothness.
// Roads: Unpaved and Off-road by class group (our classifier), the cases our styles must keep apart from tracks.
// Paths: what our dashed styles must not look like on thin roads; path with motorcycle access for riders.
function combos(t: Record<string, string>): string[] {
  const h = t.highway, out: string[] = [];
  if (h === 'track') {
    const g = t.tracktype;
    out.push(`track ${!g ? 'no tracktype' : /^grade[1-5]$/.test(g) ? g : 'other tracktype'}`);
    if (t.surface && PAVED_SURFACES.has(t.surface)) out.push('track paved surface');
    if (t.smoothness && BAD.has(t.smoothness)) out.push('track smoothness very_bad or worse');
  } else if (['path', 'footway', 'bridleway', 'cycleway'].includes(h)) {
    out.push(h);
    if (h === 'path' && t.surface && PAVED_SURFACES.has(t.surface)) out.push('path paved surface');
    if (h === 'path' && ['yes', 'designated', 'permissive'].some((v) => t.motorcycle === v || t.motor_vehicle === v)) out.push('path motorcycle=yes');
  } else {
    const level = classify(t);
    if (level === 'paved') return out;
    const group = MAIN.has(h) ? 'trunk-secondary' : h === 'tertiary' ? 'tertiary' : MINOR.has(h) ? 'unclassified-residential' : '';
    if (group) out.push(`${group} ${level === 'unpaved' ? 'Unpaved' : 'Off-road'}`);
  }
  return out;
}

const tileX = (lon: number) => Math.floor(((lon + 180) / 360) * 2 ** Z);
const tileY = (lat: number) => { const r = (lat * Math.PI) / 180; return Math.floor(((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * 2 ** Z); };
const lonOf = (x: number) => (x / 2 ** Z) * 360 - 180;
const latOf = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** Z))) * 180) / Math.PI;

type Tile = Map<string, { m: number; ids: number[] }>; // combo -> length in the tile, way ids (a few)
const metres = ([a, b]: number[], [c, d]: number[]) => {
  const k = Math.PI / 180, x = (c - a) * k * Math.cos(((b + d) / 2) * k), y = (d - b) * k;
  return Math.hypot(x, y) * 6371000;
};
async function load(country: string) {
  const tiles = new Map<string, Tile>();
  const all = new Map<string, number>();
  const rl = createInterface({ input: createReadStream(new URL(`../pbf/${country}-ways.geojsonseq`, import.meta.url)) });
  for await (const raw of rl) {
    const line = raw.replace(/^\x1e/, '');
    if (!line) continue;
    const f = JSON.parse(line), p = f.properties;
    const cs = combos(p);
    if (!cs.length) continue;
    for (const c of cs) all.set(c, (all.get(c) ?? 0) + 1);
    // Each segment's length goes to the tile of its first point (segments are short next to a z15 tile).
    const pts = f.geometry.coordinates, len = new Map<string, number>();
    for (let i = 1; i < pts.length; i++) {
      const k = `${tileX(pts[i - 1][0])}/${tileY(pts[i - 1][1])}`;
      len.set(k, (len.get(k) ?? 0) + metres(pts[i - 1], pts[i]));
    }
    for (const [k, m] of len) {
      let t = tiles.get(k); if (!t) tiles.set(k, (t = new Map()));
      for (const c of cs) {
        const e = t.get(c) ?? { m: 0, ids: [] };
        e.m += m; if (e.ids.length < 3 && !e.ids.includes(p['@id'])) e.ids.push(p['@id']); t.set(c, e);
      }
    }
  }
  return { tiles, all };
}

function view(tiles: Map<string, Tile>, x0: number, y0: number) {
  const v = new Map<string, { m: number; ids: number[] }>();
  for (let dx = 0; dx < W; dx++) for (let dy = 0; dy < H; dy++) {
    const t = tiles.get(`${x0 + dx}/${y0 + dy}`); if (!t) continue;
    for (const [c, e] of t) {
      const a = v.get(c) ?? { m: 0, ids: [] };
      a.m += e.m; for (const i of e.ids) if (a.ids.length < 3 && !a.ids.includes(i)) a.ids.push(i); v.set(c, a);
    }
  }
  for (const [c, e] of v) if (e.m < MIN_M) v.delete(c);
  return v;
}

const out: any[] = [];
for (const country of process.argv.slice(2)) {
  const { tiles, all } = await load(country);
  const covered = new Set<string>();
  for (const h of HAND[country] ?? []) {
    const v = view(tiles, Math.round(tileX(h.lon) - W / 2), Math.round(tileY(h.lat) - H / 2));
    for (const c of v.keys()) covered.add(c);
    out.push({ country, name: h.name, lat: h.lat, lon: h.lon, hand: true, combos: Object.fromEntries([...v].sort().map(([c, e]) => [c, { m: Math.round(e.m), ids: e.ids }])) });
    console.error(`${h.name} (by hand) ${h.lat},${h.lon}: ${v.size} combos`);
  }
  // Candidate top-left tiles: every tile that holds a track (views without a track are of no use here).
  const starts = new Set<string>();
  for (const [k, t] of tiles) if ([...t.keys()].some((c) => c.startsWith('track'))) {
    const [x, y] = k.split('/').map(Number);
    for (let dx = 0; dx < W; dx++) for (let dy = 0; dy < H; dy++) starts.add(`${x - dx}/${y - dy}`);
  }
  for (let n = 0; n < VIEWS; n++) {
    let best: { x: number; y: number; v: ReturnType<typeof view>; gain: number } | null = null;
    for (const k of starts) {
      const [x, y] = k.split('/').map(Number), v = view(tiles, x, y);
      // The round compares unpaved roads with tracks: a view needs both.
      if (![...v.keys()].some((c) => / (Unpaved|Off-road)$/.test(c))) continue;
      const gain = [...v.keys()].filter((c) => !covered.has(c)).length * 100 + v.size; // new combos first, then all
      if (!best || gain > best.gain) best = { x, y, v, gain };
    }
    if (!best) break;
    for (const c of best.v.keys()) covered.add(c);
    const lat = +latOf(best.y + H / 2).toFixed(5), lon = +lonOf(best.x + W / 2).toFixed(5);
    out.push({ country, name: `${country}-${n + 1}`, lat, lon, combos: Object.fromEntries([...best.v].sort().map(([c, e]) => [c, { m: Math.round(e.m), ids: e.ids }])) });
    console.error(`${country}-${n + 1} ${lat},${lon}: ${best.v.size} combos`);
  }
  const missing = [...all.keys()].filter((c) => !covered.has(c));
  out.push({ country, totals: Object.fromEntries([...all].sort()), missing });
  console.error(`${country}: missing ${missing.join(', ') || 'none'}`);
}
writeFileSync(new URL('./track-spots.json', import.meta.url), JSON.stringify(out, null, 1));

// Markdown: one table per view, with an osm.org link to check it.
const md = ['# Track round: screenshot views', '', 'Written by `track-spots.ts`. Each view is a 1200 x 800 shot at z15; a combination counts with 200 m or more inside the view; way ids are examples, up to three per combination.', ''];
for (const o of out) {
  if (o.totals) { md.push(`Not covered in ${o.country}: ${o.missing.join(', ') || 'none'}.`, ''); continue; }
  md.push(`## ${o.name}`, '', `[${o.lat}, ${o.lon}](https://www.openstreetmap.org/#map=15/${o.lat}/${o.lon})`, '', '| Combination | Length in view | Example ways |', '|---|---|---|');
  for (const [c, { m, ids }] of Object.entries(o.combos) as [string, { m: number; ids: number[] }][]) md.push(`| ${c} | ${m} m | ${ids.map((i) => `[w${i}](https://www.openstreetmap.org/way/${i})`).join(', ')} |`);
  md.push('');
}
writeFileSync(new URL('./track-spots.md', import.meta.url), md.join('\n'));
