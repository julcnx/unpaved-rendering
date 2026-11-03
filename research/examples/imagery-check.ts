// Street-level imagery coverage of example roads (Mapillary and Google Street View).
// Same lookups as unpaved-app/app/js/street-view.js: nearest image within 50 m of a point.
// Usage: MAPILLARY_TOKEN=... GOOGLE_SV_KEY=... [AUTO_PER_COUNTRY=3] [SAMPLES=8] node examples/imagery-check.ts
// Roads already in examples/imagery.json are kept and not checked again.
// Writes examples/imagery.json and examples/imagery.md.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { classifyDetailed } from '../classifier/classify.ts';

const SAMPLES = Number(process.env.SAMPLES ?? 8);
const RADIUS_M = 50;
const AUTO_PER_COUNTRY = Number(process.env.AUTO_PER_COUNTRY ?? 3);
const { MAPILLARY_TOKEN, GOOGLE_SV_KEY } = process.env;
if (!MAPILLARY_TOKEN || !GOOGLE_SV_KEY) throw new Error('set MAPILLARY_TOKEN and GOOGLE_SV_KEY');

type Candidate = { id: string; country: string; label: string; origin: string };
type Point = { lat: number; lon: number };

const candidates: Candidate[] = readFileSync(new URL('./candidates.txt', import.meta.url), 'utf8')
  .split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => {
    const [id, country, ...label] = l.trim().split(/\s+/);
    return { id, country, label: label.join(' '), origin: 'list' };
  });

const resultsDir = new URL('../stats/results/', import.meta.url);
for (const f of readdirSync(resultsDir).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(new URL(f, resultsDir), 'utf8'));
  for (const n of (d.odd.major_unpaved ?? d.odd.major_offroad).slice(0, AUTO_PER_COUNTRY)) {
    if (candidates.some((c) => c.id === n.id)) continue;
    const name = n.tags.ref ?? n.tags['name:en'] ?? n.tags.name ?? '';
    candidates.push({ id: n.id, country: d.country, label: `${name} (${n.highway})`.trim(), origin: 'stats' });
  }
}

const UA = { 'User-Agent': 'drivability-stats/0.1 (osm user julcnx)' };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function distKm(a: Point, b: Point) {
  const t = Math.PI / 180;
  const x = Math.sin(((b.lat - a.lat) * t) / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(((b.lon - a.lon) * t) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(x));
}

// Evenly spaced points along the way, not at the very ends (often junctions in towns).
function samplePoints(line: Point[], n: number): Point[] {
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + distKm(line[i - 1], line[i]));
  const total = cum[cum.length - 1];
  return Array.from({ length: n }, (_, k) => {
    const target = (total * (k + 1)) / (n + 1);
    const i = Math.max(1, cum.findIndex((c) => c >= target));
    const f = cum[i] === cum[i - 1] ? 0 : (target - cum[i - 1]) / (cum[i] - cum[i - 1]);
    return { lat: line[i - 1].lat + f * (line[i].lat - line[i - 1].lat), lon: line[i - 1].lon + f * (line[i].lon - line[i - 1].lon) };
  });
}

async function mapillary(p: Point) {
  const q = new URLSearchParams({ fields: 'id,captured_at', lat: String(p.lat), lng: String(p.lon), radius: String(RADIUS_M), limit: '1', access_token: MAPILLARY_TOKEN! });
  const res = await fetch(`https://graph.mapillary.com/images?${q}`);
  if (!res.ok) return null;
  const img = (await res.json()).data?.[0];
  return img ? { url: `https://www.mapillary.com/app/?pKey=${img.id}`, date: new Date(img.captured_at).toISOString().slice(0, 10) } : null;
}

async function google(p: Point) {
  const q = new URLSearchParams({ location: `${p.lat},${p.lon}`, radius: String(RADIUS_M), source: 'outdoor', key: GOOGLE_SV_KEY! });
  const res = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?${q}`);
  const m = await res.json();
  if (m.status !== 'OK') return null;
  return { url: `https://www.google.com/maps/@?api=1&map_action=pano&pano=${m.pano_id}`, date: m.date ?? '', official: /google/i.test(m.copyright ?? '') };
}

const jsonFile = new URL('./imagery.json', import.meta.url);
const out: any[] = existsSync(jsonFile) ? JSON.parse(readFileSync(jsonFile, 'utf8')).roads : [];
const done = new Set(out.map((r) => r.id));
for (const c of candidates) {
  if (done.has(c.id)) continue;
  const res = await fetch(`https://api.openstreetmap.org/api/0.6/way/${c.id.slice(1)}/full.json`, { headers: UA });
  if (!res.ok) { console.error(`${c.id}: OSM API ${res.status}`); continue; }
  const els = (await res.json()).elements;
  const nodes = new Map(els.filter((e: any) => e.type === 'node').map((e: any) => [e.id, { lat: e.lat, lon: e.lon }]));
  const way = els.find((e: any) => e.type === 'way');
  const line: Point[] = way.nodes.map((id: number) => nodes.get(id));
  const km = line.slice(1).reduce((s, p, i) => s + distKm(line[i], p), 0);
  const points = samplePoints(line, SAMPLES);
  const mly = [], gsv = [];
  for (const p of points) {
    mly.push(await mapillary(p));
    gsv.push(await google(p));
  }
  const { level, source } = classifyDetailed(way.tags);
  const latest = (xs: any[]) => xs.filter(Boolean).map((x) => x.date).sort().pop() ?? '';
  const row = {
    ...c, km: Math.round(km * 10) / 10, level, source, checked_at: new Date().toISOString().slice(0, 10), samples_checked: SAMPLES,
    tags: Object.fromEntries(['highway', 'ref', 'surface', 'smoothness', 'tracktype', '4wd_only'].filter((k) => way.tags[k]).map((k) => [k, way.tags[k]])),
    mapillary: { covered: mly.filter(Boolean).length, latest: latest(mly), first: mly.find(Boolean)?.url ?? '' },
    google: { covered: gsv.filter(Boolean).length, official: gsv.filter((g) => g?.official).length, latest: latest(gsv), first: gsv.find(Boolean)?.url ?? '' },
    samples: points.map((p, i) => ({ ...p, mapillary: mly[i]?.url ?? '', google: gsv[i]?.url ?? '' })),
  };
  out.push(row);
  console.error(`${c.id} ${c.country} ${c.label}: Mapillary ${row.mapillary.covered}/${SAMPLES}, Google ${row.google.covered}/${SAMPLES}`);
  await sleep(500);
}

writeFileSync(jsonFile, JSON.stringify({ radius_m: RADIUS_M, roads: out }, null, 1));

const cell = (s: { covered: number; latest: string; first: string }, n: number) =>
  s.covered ? `${s.covered}/${n} ([${s.latest || 'view'}](${s.first}))` : `0/${n}`;
const share = (r: any) => (r.mapillary.covered + r.google.covered) / (r.samples_checked ?? 8);
const rows = out.filter((r) => share(r) > 0).sort((a, b) => share(b) - share(a))
  .map((r) => `| ${r.country.toUpperCase()} | [${r.label}](https://www.openstreetmap.org/way/${r.id.slice(1)}) | ${r.km} | ${r.level} (${r.source}) | ${Object.entries(r.tags).map(([k, v]) => `\`${k}=${v}\``).join(' ')} | ${cell(r.mapillary, r.samples_checked ?? 8)} | ${cell(r.google, r.samples_checked ?? 8)}${r.google.covered && r.google.official < r.google.covered ? `, ${r.google.official} official` : ''} | ${r.origin} |`);
writeFileSync(new URL('./imagery.md', import.meta.url), [
  '# Street-level imagery coverage of example roads', '',
  `Generated by \`examples/imagery-check.ts\`: points evenly spaced along each way (8 for the first list, 4 for the wider screening), nearest image within ${RADIUS_M} m. Links open the first covered point and show the newest capture date. "official" = Google car imagery (others are user photospheres). Only roads with some coverage are listed: ${out.filter((r) => share(r) > 0).length} of ${out.length} checked.`, '',
  '| Country | Road | km | Class | Tags | Mapillary | Google Street View | From |',
  '|---|---|--:|---|---|---|---|---|', ...rows, '',
].join('\n'));
