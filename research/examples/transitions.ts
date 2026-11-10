// Find points where a major road changes from paved to unpaved: two ways of the same road (same ref or name)
// sharing an end node, one Paved and one Unpaved under our classifier. Checks Mapillary on both sides.
// Usage: MAPILLARY_TOKEN=... [ONLY="np"] node examples/transitions.ts   (writes examples/transitions.json and .md)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { classifyDetailed } from '../classifier/classify.ts';

const { MAPILLARY_TOKEN } = process.env;
if (!MAPILLARY_TOKEN) throw new Error('set MAPILLARY_TOKEN');
const UA = { 'User-Agent': 'unpaved-rendering/0.1 (osm user julcnx)' };
const SIDE_M = 300; // how far into each side to look for street-level imagery
const RADIUS_M = 50;

// Area searches: [label, country, Overpass filter, bbox south,west,north,east].
const SEARCHES: [string, string, string, string][] = [
  ['Gibb River Road', 'au', '[name="Gibb River Road"]', '-18.5,123.5,-15.0,128.8'],
  ['Tanami Road', 'au', '[name="Tanami Road"]', '-24.0,128.0,-17.0,134.0'],
  ['Great Central Road', 'au', '[name="Great Central Road"]', '-27.0,118.0,-24.0,130.0'],
  ['Strzelecki Track', 'au', '[name="Strzelecki Track"]', '-30.5,138.0,-27.0,141.0'],
  ['Plenty Highway', 'au', '[name="Plenty Highway"]', '-24.0,133.0,-22.0,139.0'],
  ['Namibia C-roads', 'na', '[ref~"^C[0-9]"]', '-29.0,11.5,-17.0,25.5'],
  ['Iceland road 35', 'is', '[ref="35"]', '63.9,-21.0,65.5,-18.5'],
  ['Bolivia F-roads', 'bo', '[ref~"^F ?[0-9]"]', '-23.0,-69.7,-9.6,-57.4'],
  ['Nepal national and feeder roads', 'np', '[ref~"^(NH|F) ?[0-9]"]', '26.3,80.0,30.5,88.3'],
  ['Iceland numbered roads', 'is', '[ref~"^F?[0-9]+$"]', '63.2,-24.6,66.6,-13.4'],
  ['Australia: north-west numbered roads', 'au', '[ref~"^[A-Z]?[0-9]+$"]', '-26.0,113.0,-13.0,129.0'],
  ['Australia: Northern Territory numbered roads', 'au', '[ref~"^[A-Z]?[0-9]+$"]', '-26.0,129.0,-11.0,138.0'],
  ['Australia: outback Queensland numbered roads', 'au', '[ref~"^[A-Z]?[0-9]+$"]', '-29.0,138.0,-16.0,146.0'],
  ['Alaska state routes', 'us', '[ref~"^AK"]', '59.0,-165.0,71.5,-141.0'],
  ['Yukon and Northwest Territories highways', 'ca', '[ref~"^[0-9]+$"]', '60.0,-141.0,69.5,-123.0'],
  ['US West: Utah, Nevada, Idaho state routes', 'us', '[ref~"^(UT|SR|NV|ID) ?[0-9]+"]', '35.0,-120.0,49.0,-109.0'],
  ['US West: Montana and Wyoming state routes', 'us', '[ref~"^(MT|WY|S) ?[0-9]+"]', '41.0,-116.1,49.0,-104.0'],
  ['British Columbia and western Alberta highways', 'ca', '[ref~"^[0-9]+[A-Z]?$"]', '49.0,-135.0,60.0,-114.0'],
  ['Mexico: Baja California', 'mx', '[ref]', '22.8,-117.2,32.8,-109.3'],
  ['Mexico: Yucatan peninsula', 'mx', '[ref]', '17.8,-92.5,21.7,-86.7'],
];

type Way = { id: number; tags: Record<string, string>; nodes: number[]; geometry: { lat: number; lon: number }[] };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function overpass(filter: string, bbox: string): Promise<Way[]> {
  const q = `[out:json][timeout:180][bbox:${bbox}];way[highway~"^(trunk|primary|secondary)$"]${filter};out body geom;`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: UA, body: new URLSearchParams({ data: q }) });
    if (res.ok) return (await res.json()).elements;
    console.error(`  Overpass ${res.status}, retry ${attempt}`);
    await sleep(30000);
  }
  return [];
}

function distM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const t = Math.PI / 180;
  const x = Math.sin(((b.lat - a.lat) * t) / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(((b.lon - a.lon) * t) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(x));
}

// Point SIDE_M metres into the way, starting from the shared node.
function pointInto(way: Way, nodeId: number) {
  const g = way.nodes[0] === nodeId ? way.geometry : [...way.geometry].reverse();
  let done = 0;
  for (let i = 1; i < g.length; i++) {
    const d = distM(g[i - 1], g[i]);
    if (done + d >= SIDE_M) {
      const f = (SIDE_M - done) / d;
      return { lat: g[i - 1].lat + f * (g[i].lat - g[i - 1].lat), lon: g[i - 1].lon + f * (g[i].lon - g[i - 1].lon) };
    }
    done += d;
  }
  return g[g.length - 1];
}

async function mapillary(p: { lat: number; lon: number }) {
  const q = new URLSearchParams({ fields: 'id,captured_at', lat: String(p.lat), lng: String(p.lon), radius: String(RADIUS_M), limit: '1', access_token: MAPILLARY_TOKEN! });
  const res = await fetch(`https://graph.mapillary.com/images?${q}`);
  const img = res.ok ? (await res.json()).data?.[0] : null;
  return img ? { url: `https://www.mapillary.com/app/?pKey=${img.id}`, date: new Date(img.captured_at).toISOString().slice(0, 10) } : null;
}

// Mapillary results from an earlier run, keyed by the two way ids, so a rerun does not query them again.
const outFile = new URL('./transitions.json', import.meta.url);
const cache = new Map<string, any>(existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')).map((t: any) => [`${t.paved.way}-${t.unpaved.way}`, t]) : []);

function wayKm(w: Way) {
  let km = 0;
  for (let i = 1; i < w.geometry.length; i++) km += distM(w.geometry[i - 1], w.geometry[i]) / 1000;
  return km;
}

// Length of the run that starts at `node` along `first`, continuing over ways of the same road with the same base level.
function runKm(first: Way, node: number, ends: Map<number, Way[]>, key: (w: Way) => string) {
  const base = classifyDetailed(first.tags).base;
  let km = 0, way: Way | undefined = first, from = node;
  const seen = new Set<number>();
  while (way && km < 500) {
    seen.add(way.id);
    km += wayKm(way);
    const to: number = way.nodes[0] === from ? way.nodes[way.nodes.length - 1] : way.nodes[0];
    way = (ends.get(to) ?? []).find((w) => !seen.has(w.id) && key(w) === key(first) && classifyDetailed(w.tags).base === base);
    from = to;
  }
  return Math.round(km * 10) / 10;
}

const both = (t: any) => (t.paved.mapillary ? 1 : 0) + (t.unpaved.mapillary ? 1 : 0);
// Written after every search, so a stopped run keeps what it found (Overpass is slow on the wide searches).
function save() {
  found.sort((a, b) => both(b) - both(a));
  writeFileSync(outFile, JSON.stringify(found, null, 1));
  const img = (m: any) => (m ? `[${m.date}](${m.url})` : 'none');
  writeFileSync(new URL('./transitions.md', import.meta.url), [
    '# Paved to unpaved transitions on major roads', '',
    `Generated by \`examples/transitions.ts\`. Two ways of the same road (same \`ref\` or name) sharing an end node, one Paved (by a surface tag) and one Unpaved. Mapillary checked ${SIDE_M} m into each side, nearest image within ${RADIUS_M} m. Sorted by imagery on both sides.`, '',
    '| Road | Class | Point (z15) | Paved side | Run | Mapillary | Unpaved side | Run | Mapillary |',
    '|---|---|---|---|--:|---|---|--:|---|',
    ...found.map((t) => `| ${t.label}: ${t.ref} | ${t.highway} | [${t.lat}, ${t.lon}](https://www.openstreetmap.org/?mlat=${t.lat}&mlon=${t.lon}#map=15/${t.lat}/${t.lon}) | [w${t.paved.way}](https://www.openstreetmap.org/way/${t.paved.way}) \`${t.paved.surface}\` | ${t.paved.run_km} km | ${img(t.paved.mapillary)} | [w${t.unpaved.way}](https://www.openstreetmap.org/way/${t.unpaved.way}) \`${t.unpaved.surface}\` | ${t.unpaved.run_km} km | ${img(t.unpaved.mapillary)} |`),
    '',
  ].join('\n'));
}

// ONLY="np": run only the searches for these countries and keep the other results from the earlier run.
const ONLY = process.env.ONLY?.split(/\s+/).filter(Boolean);
const found: any[] = ONLY ? [...cache.values()].filter((t) => !ONLY.includes(t.country)) : [];
for (const [label, country, filter, bbox] of SEARCHES) {
  if (ONLY && !ONLY.includes(country)) continue;
  const ways = await overpass(filter, bbox);
  const key = (w: Way) => w.tags.ref ?? w.tags.name ?? '';
  const ends = new Map<number, Way[]>();
  for (const w of ways) for (const n of [w.nodes[0], w.nodes[w.nodes.length - 1]]) ends.set(n, [...(ends.get(n) ?? []), w]);
  let n = 0;
  for (const [node, ws] of ends) {
    for (const a of ws) for (const b of ws) {
      if (a.id >= b.id || key(a) !== key(b) || !key(a)) continue;
      const [pa, pb] = [classifyDetailed(a.tags).base, classifyDetailed(b.tags).base];
      if (pa === pb) continue;
      const [paved, unpaved] = pa === 'paved' ? [a, b] : [b, a];
      // Only tagged transitions: the paved side must have a surface tag, not just the default.
      if (classifyDetailed(paved.tags).baseSource === 'default') continue;
      const at = paved.nodes[0] === node ? paved.geometry[0] : paved.geometry[paved.geometry.length - 1];
      const cached = cache.get(`${paved.id}-${unpaved.id}`);
      const [mp, mu] = cached ? [cached.paved.mapillary, cached.unpaved.mapillary] : [await mapillary(pointInto(paved, node)), await mapillary(pointInto(unpaved, node))];
      found.push({ label, country, ref: key(a), name: paved.tags.name ?? unpaved.tags.name ?? '',
        highway: paved.tags.highway === unpaved.tags.highway ? paved.tags.highway : `${paved.tags.highway}/${unpaved.tags.highway}`,
        lat: Math.round(at.lat * 1e5) / 1e5, lon: Math.round(at.lon * 1e5) / 1e5,
        paved: { way: paved.id, surface: paved.tags.surface ?? `tracktype=${paved.tags.tracktype}`, run_km: runKm(paved, node, ends, key), mapillary: mp },
        unpaved: { way: unpaved.id, surface: unpaved.tags.surface ?? `tracktype=${unpaved.tags.tracktype}`, run_km: runKm(unpaved, node, ends, key), mapillary: mu } });
      n++;
    }
  }
  console.error(`${label}: ${ways.length} ways, ${n} transitions`);
  save();
  await sleep(5000);
}

console.error(`${found.length} transitions, ${found.filter((t) => both(t) === 2).length} with imagery on both sides`);
