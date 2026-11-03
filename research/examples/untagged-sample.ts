// Ground-truth sample of untagged roads (no surface, no known tracktype), which the rule renders as Paved.
// Random ways weighted by km, kept only when Mapillary has an image near the way's midpoint.
// Input (stdin): osmium export -f geojsonseq -u type_id --geometry-types=linestring (already clipped to the country).
// Usage: ... | MAPILLARY_TOKEN=... node examples/untagged-sample.ts <country-code> [per-class]
// Writes examples/untagged/<code>.json and one image per way in examples/images/mapillary/untagged-<code>-*.jpg.

import { createInterface } from 'node:readline';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { classifyDetailed } from '../classifier/classify.ts';

const [code = '??', perClassArg = '25'] = process.argv.slice(2);
const PER_CLASS = Number(perClassArg);
const CLASSES = ['tertiary', 'unclassified', 'residential'];
const MIN_KM = 0.3; // very short ways are mostly junction stubs
const RADIUS_M = 25;
const MAX_TRIES = 300;
const SEED = 20261103;
const { MAPILLARY_TOKEN } = process.env;
if (!MAPILLARY_TOKEN) throw new Error('set MAPILLARY_TOKEN');

type Way = { id: string; highway: string; km: number; mid: { lat: number; lon: number } };

function distKm(a: number[], b: number[]) {
  const t = Math.PI / 180;
  const x = Math.sin(((b[1] - a[1]) * t) / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(((b[0] - a[0]) * t) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(x));
}

function midpoint(coords: number[][], km: number) {
  let done = 0;
  for (let i = 1; i < coords.length; i++) {
    const d = distKm(coords[i - 1], coords[i]);
    if (done + d >= km / 2) {
      const f = d ? (km / 2 - done) / d : 0;
      return { lon: coords[i - 1][0] + f * (coords[i][0] - coords[i - 1][0]), lat: coords[i - 1][1] + f * (coords[i][1] - coords[i - 1][1]) };
    }
    done += d;
  }
  return { lon: coords[0][0], lat: coords[0][1] };
}

// Small seeded PRNG (mulberry32), so the sample can be reproduced.
let state = SEED;
const random = () => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const pool: Record<string, Way[]> = Object.fromEntries(CLASSES.map((c) => [c, []]));
const totalKm: Record<string, number> = Object.fromEntries(CLASSES.map((c) => [c, 0]));
for await (const raw of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  const line = raw.replace(/^\x1e/, '').trim();
  if (!line) continue;
  const f = JSON.parse(line);
  const tags = f.properties;
  if (!CLASSES.includes(tags.highway) || classifyDetailed(tags).baseSource !== 'default') continue;
  let km = 0;
  for (let i = 1; i < f.geometry.coordinates.length; i++) km += distKm(f.geometry.coordinates[i - 1], f.geometry.coordinates[i]);
  totalKm[tags.highway] += km;
  if (km >= MIN_KM) pool[tags.highway].push({ id: f.id, highway: tags.highway, km, mid: midpoint(f.geometry.coordinates, km) });
}

async function nearestImage(p: { lat: number; lon: number }) {
  const q = new URLSearchParams({ fields: 'id,captured_at,thumb_1024_url,creator', lat: String(p.lat), lng: String(p.lon), radius: String(RADIUS_M), limit: '1', access_token: MAPILLARY_TOKEN! });
  const res = await fetch(`https://graph.mapillary.com/images?${q}`);
  return res.ok ? (await res.json()).data?.[0] ?? null : null;
}

const imgDir = new URL('./images/mapillary/', import.meta.url);
mkdirSync(imgDir, { recursive: true });
mkdirSync(new URL('./untagged/', import.meta.url), { recursive: true });
const creditsFile = new URL('./images/credits.json', import.meta.url);
const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {};

const sample: Record<string, any[]> = {};
for (const cls of CLASSES) {
  const ways = pool[cls];
  const cum: number[] = [];
  ways.reduce((s, w, i) => (cum[i] = s + w.km), 0);
  const tried = new Set<number>();
  sample[cls] = [];
  for (let n = 0; n < MAX_TRIES && sample[cls].length < PER_CLASS && tried.size < ways.length; n++) {
    // Weighted by km: pick a random km position along all ways of the class.
    const target = random() * cum[cum.length - 1];
    const i = cum.findIndex((c) => c >= target);
    if (tried.has(i)) continue;
    tried.add(i);
    const img = await nearestImage(ways[i].mid);
    if (!img) continue;
    const n2 = String(sample[cls].length + 1).padStart(2, '0');
    const name = `untagged-${code}-${cls}-${n2}-${ways[i].id}.jpg`;
    writeFileSync(new URL(name, imgDir), Buffer.from(await (await fetch(img.thumb_1024_url)).arrayBuffer()));
    credits[`mapillary/${name}`] = { road: `untagged ${cls}`, way: ways[i].id, source: 'Mapillary', image: `https://www.mapillary.com/app/?pKey=${img.id}`, author: img.creator?.username ?? '', captured: new Date(img.captured_at).toISOString().slice(0, 10), licence: 'CC BY-SA 4.0' };
    sample[cls].push({ n: n2, ...ways[i], km: Math.round(ways[i].km * 100) / 100, image: `https://www.mapillary.com/app/?pKey=${img.id}`, file: `mapillary/${name}`, captured: credits[`mapillary/${name}`].captured, verdict: '' });
  }
  console.error(`${cls}: ${sample[cls].length} with imagery out of ${tried.size} tried (${ways.length} untagged ways of ${MIN_KM}+ km, ${Math.round(totalKm[cls])} untagged km)`);
}

writeFileSync(creditsFile, JSON.stringify(credits, null, 1));
writeFileSync(new URL(`./untagged/${code}.json`, import.meta.url), JSON.stringify({
  country: code, created: new Date().toISOString().slice(0, 10), seed: SEED, radius_m: RADIUS_M, min_km: MIN_KM,
  untagged_km: Object.fromEntries(CLASSES.map((c) => [c, Math.round(totalKm[c])])), sample,
}, null, 1));
