// Which OSM roads does Gaia GPS (Gaia Topo) draw as tracks?
// Gaia's style draws `type=track` features of its `trail` tile layer as tracks, and those features carry `osm_id`,
// so the rule can be measured: for each z12 tile, every highway way in OSM is either in that track set or not.
// Ways: samples for given tag combinations (Overpass), plus every road in the centre tile of each article spot.
// Usage: node research/examples/gaia-tracks.ts   (caches in research/examples/gaia-tracks/, writes gaia-tracks.json)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const DIR = new URL('./gaia-tracks/', import.meta.url).pathname;
mkdirSync(DIR, { recursive: true });
const Z = 12;
const OVERPASS = 'https://overpass-api.de/api/interpreter';

const SPOTS: Record<string, [number, number]> = {
  namibia: [-18.81068, 16.9415], bolivia: [-14.87824, -64.99758], nepal: [28.80567, 83.76673],
  iceland: [64.99903, -22.7612], australia: [-17.15373, 144.51059], canada: [51.30019, -114.94517],
  pai: [19.540403, 98.548539],
};
const ROAD = 'trunk|primary|secondary|tertiary|unclassified|residential';
// Tag combinations to sample: a few ways each, each checked in its own tile.
const COMBOS: string[] = [];
for (const h of ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'])
  for (const s of ['bad', 'very_bad', 'horrible', 'very_horrible', 'impassable']) COMBOS.push(`[highway=${h}][smoothness=${s}]`);
for (const h of ['tertiary', 'unclassified'])
  for (const t of ['grade1', 'grade2', 'grade3', 'grade4', 'grade5']) COMBOS.push(`[highway=${h}][tracktype=${t}][!smoothness]`);
for (const h of ['tertiary', 'unclassified']) COMBOS.push(`[highway=${h}]["4wd_only"=yes][!smoothness]`);
for (const s of ['unpaved', 'dirt', 'mud', 'sand', 'ground', 'rock']) COMBOS.push(`[highway=unclassified][surface=${s}][!smoothness][!tracktype]`);
// Track controls in a smaller area (eastern France, Switzerland, SW Germany): the global sets are too large for Overpass.
for (const c of ['[smoothness=good]', '[tracktype=grade1]', '[surface=asphalt]']) COMBOS.push(`[highway=track]${c}(46,5,49,10)`);
const PER_COMBO = 10;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function overpass(q: string, file: string): Promise<any> {
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(OVERPASS, { method: 'POST', headers: { 'User-Agent': 'unpaved-rendering-research/1.0' }, body: new URLSearchParams({ data: q }) });
    if (res.ok) { const j = await res.json(); writeFileSync(file, JSON.stringify(j)); await sleep(1500); return j; }
    console.error(`overpass ${res.status}, retry`); await sleep(30000 * 2 ** attempt);
  }
  throw new Error('overpass failed');
}

const tileOf = (lat: number, lon: number): [number, number] => {
  const n = 2 ** Z, r = (lat * Math.PI) / 180;
  return [Math.floor(((lon + 180) / 360) * n), Math.floor(((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * n)];
};
const tileBbox = (x: number, y: number) => {
  const n = 2 ** Z, lon = (i: number) => (i / n) * 360 - 180;
  const lat = (j: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * j) / n))) * 180) / Math.PI;
  const [w, e, s, nn] = [lon(x), lon(x + 1), lat(y + 1), lat(y)];
  const dx = (e - w) * 0.1, dy = (nn - s) * 0.1; // inner 80%: skip ways that only touch the edge
  return `${s + dy},${w + dx},${nn - dy},${e - dx}`;
};

// Minimal Mapbox Vector Tile reader: layer name -> features' tags.
function varint(b: Uint8Array, p: { i: number }) { let r = 0, s = 0, c; do { c = b[p.i++]; r += (c & 0x7f) * 2 ** s; s += 7; } while (c >= 0x80); return r; }
function* fields(b: Uint8Array) {
  const p = { i: 0 };
  while (p.i < b.length) {
    const k = varint(b, p), f = Math.floor(k / 8), w = k & 7; let v: any;
    if (w === 0) v = varint(b, p);
    else if (w === 2) { const n = varint(b, p); v = b.subarray(p.i, p.i + n); p.i += n; }
    else if (w === 5) { v = b.subarray(p.i, p.i + 4); p.i += 4; } else { v = b.subarray(p.i, p.i + 8); p.i += 8; }
    yield [f, v] as [number, any];
  }
}
const td = new TextDecoder();
function value(b: Uint8Array): any {
  for (const [f, v] of fields(b)) {
    if (f === 1) return td.decode(v);
    if (f === 2) return new DataView(v.buffer, v.byteOffset).getFloat32(0, true);
    if (f === 3) return new DataView(v.buffer, v.byteOffset).getFloat64(0, true);
    if (f === 4 || f === 5) return v; if (f === 6) return (v % 2 ? -(v + 1) / 2 : v / 2); if (f === 7) return !!v;
  }
}
function decode(buf: Uint8Array) {
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  const out: Record<string, Record<string, any>[]> = {};
  for (const [f, lb] of fields(buf)) {
    if (f !== 3) continue;
    let name = ''; const keys: string[] = [], vals: any[] = [], feats: Uint8Array[] = [];
    for (const [g, v] of fields(lb)) { if (g === 1) name = td.decode(v); else if (g === 3) keys.push(td.decode(v)); else if (g === 4) vals.push(value(v)); else if (g === 2) feats.push(v); }
    out[name] = feats.map((fb) => {
      const tags: Record<string, any> = {};
      for (const [g, v] of fields(fb)) if (g === 2) { const p = { i: 0 }, t: number[] = []; while (p.i < v.length) t.push(varint(v, p)); for (let j = 0; j < t.length; j += 2) tags[keys[t[j]]] = vals[t[j + 1]]; }
      return tags;
    });
  }
  return out;
}
async function gaiaTile(x: number, y: number) {
  const file = `${DIR}tile-${Z}-${x}-${y}.pbf`;
  if (!existsSync(file)) {
    const res = await fetch(`https://vectortiles.gaiagps.com/osm4/${Z}/${x}/${y}.pbf`);
    if (!res.ok) throw new Error(`gaia tile ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer())); await sleep(300);
  }
  return decode(new Uint8Array(readFileSync(file)));
}

const row = (e: any, from: string, gaiaType: string) => {
  const g = e.tags;
  return { id: e.id, from, highway: g.highway, smoothness: g.smoothness ?? '', tracktype: g.tracktype ?? '', surface: g.surface ?? '', fwd: g['4wd_only'] ?? '', track: gaiaType === 'track', gaiaType };
};
// Gaia type of a way in a tile ('' when absent from the trail layer, so drawn as a road or not at all).
const typeIn = async (x: number, y: number, id: number) => String((await gaiaTile(x, y)).trail?.find((f) => Number(f.osm_id) === id)?.type ?? '');
const rows: any[] = [];

// 1. Sampled ways per tag combination: the tags come with the sample, only Gaia's tiles are needed.
// Overpass gives the centre of the way's bounding box, which can miss the way's tiles: when the way is not in
// the trail layer of that tile, the 8 neighbours are checked too before it counts as a road.
for (const [i, c] of COMBOS.entries()) {
  const j = await overpass(`[out:json][timeout:180];way${c};out center 120;`, `${DIR}combo-${i}.json`);
  const els = j.elements ?? [];
  // Spread the sample: every k-th way of the result, which Overpass returns in id order.
  const step = Math.max(1, Math.floor(els.length / PER_COMBO));
  for (let k = 0; k < els.length && k / step < PER_COMBO; k += step) {
    const [x0, y0] = tileOf(els[k].center.lat, els[k].center.lon);
    let type = await typeIn(x0, y0, els[k].id);
    for (let d = 0; !type && d < 9; d++) if (d !== 4) type = await typeIn(x0 + (d % 3) - 1, y0 + Math.floor(d / 3) - 1, els[k].id);
    rows.push(row(els[k], c, type));
  }
  console.error(`${c}: ${els.length} found`);
}

// 2. Every road in the centre tile of each article spot (one Overpass call per spot).
for (const [name, [la, lo]] of Object.entries(SPOTS)) {
  const [x, y] = tileOf(la, lo);
  const types = new Map(((await gaiaTile(x, y)).trail ?? []).map((f) => [Number(f.osm_id), String(f.type)]));
  const j = await overpass(`[out:json][timeout:120];way[highway~"^(${ROAD}|track|service)$"](${tileBbox(x, y)});out tags;`, `${DIR}ways-${Z}-${x}-${y}.json`);
  for (const e of j.elements) rows.push(row(e, name, types.get(e.id) ?? ''));
}
writeFileSync(new URL('./gaia-tracks.json', import.meta.url), JSON.stringify(rows));
console.error(`${rows.length} ways`);
