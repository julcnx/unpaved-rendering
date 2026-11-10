// Download street-level images for chosen example roads, from the points found by imagery-check.ts.
// Usage: MAPILLARY_TOKEN=... node examples/fetch-images.ts w123 w456 ...
// Writes examples/images/mapillary/ (CC BY-SA 4.0, reusable with attribution) and examples/images/credits.json.
// Google Street View is no longer used (2026-11-10).

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const PER_SOURCE = 4;
const { MAPILLARY_TOKEN } = process.env;
if (!MAPILLARY_TOKEN) throw new Error('set MAPILLARY_TOKEN');

const base = new URL('./images/', import.meta.url);
mkdirSync(new URL('mapillary/', base), { recursive: true });
const creditsFile = new URL('credits.json', base);
const credits: Record<string, any> = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {};

const roads = JSON.parse(readFileSync(new URL('./imagery.json', import.meta.url), 'utf8')).roads;

// Up to n items spread over the list.
const spread = <T>(xs: T[], n: number) => (xs.length <= n ? xs : Array.from({ length: n }, (_, i) => xs[Math.round((i * (xs.length - 1)) / (n - 1))]));

async function save(url: string, file: URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url.replace(/access_token=[^&]+/, 'access_token=…')}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

for (const id of process.argv.slice(2)) {
  const road = roads.find((r: any) => r.id === id);
  if (!road) { console.error(`${id}: not in imagery.json`); continue; }
  const slug = `${road.country}-${id}`;
  const samples = road.samples.map((s: any, i: number) => ({ ...s, i }));

  for (const s of spread(samples.filter((s: any) => s.mapillary), PER_SOURCE)) {
    const key = s.mapillary.split('pKey=')[1];
    const meta = await (await fetch(`https://graph.mapillary.com/${key}?fields=thumb_1024_url,captured_at,creator&access_token=${MAPILLARY_TOKEN}`)).json();
    const name = `mapillary/${slug}-${s.i}.jpg`;
    await save(meta.thumb_1024_url, new URL(name, base));
    credits[name] = { road: road.label, way: id, source: 'Mapillary', image: `https://www.mapillary.com/app/?pKey=${key}`, author: meta.creator?.username ?? '', captured: new Date(meta.captured_at).toISOString().slice(0, 10), licence: 'CC BY-SA 4.0' };
  }

  console.error(`${id} ${road.label}: done`);
}
writeFileSync(creditsFile, JSON.stringify(credits, null, 1));
