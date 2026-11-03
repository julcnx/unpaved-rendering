// Download street-level images for chosen example roads, from the points found by imagery-check.ts.
// Usage: MAPILLARY_TOKEN=... [GOOGLE_SV_KEY=... GOOGLE_PER_ROAD=1] node examples/fetch-images.ts w123 w456 ...
// Google Street View Static images are billed: they are only downloaded when GOOGLE_PER_ROAD is set (default 0).
// Writes examples/images/mapillary/ (CC BY-SA 4.0, reusable with attribution),
// examples/images/google/ (copyrighted, for checking only, never upload), and examples/images/credits.json.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const PER_SOURCE = 4;
const GOOGLE_PER_ROAD = Number(process.env.GOOGLE_PER_ROAD ?? 0);
const { MAPILLARY_TOKEN, GOOGLE_SV_KEY } = process.env;
if (!MAPILLARY_TOKEN) throw new Error('set MAPILLARY_TOKEN');
if (GOOGLE_PER_ROAD && !GOOGLE_SV_KEY) throw new Error('set GOOGLE_SV_KEY or GOOGLE_PER_ROAD=0');

const base = new URL('./images/', import.meta.url);
for (const d of ['mapillary/', 'google/']) mkdirSync(new URL(d, base), { recursive: true });
const creditsFile = new URL('credits.json', base);
const credits: Record<string, any> = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {};

const roads = JSON.parse(readFileSync(new URL('./imagery.json', import.meta.url), 'utf8')).roads;

function bearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const t = Math.PI / 180;
  const y = Math.sin((b.lon - a.lon) * t) * Math.cos(b.lat * t);
  const x = Math.cos(a.lat * t) * Math.sin(b.lat * t) - Math.sin(a.lat * t) * Math.cos(b.lat * t) * Math.cos((b.lon - a.lon) * t);
  return Math.round(((Math.atan2(y, x) / t) + 360) % 360);
}

// Up to n items spread over the list.
const spread = <T>(xs: T[], n: number) => (xs.length <= n ? xs : Array.from({ length: n }, (_, i) => xs[Math.round((i * (xs.length - 1)) / (n - 1))]));

async function save(url: string, file: URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url.replace(/key=[^&]+/, 'key=…').replace(/access_token=[^&]+/, 'access_token=…')}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

for (const id of process.argv.slice(2)) {
  const road = roads.find((r: any) => r.id === id);
  if (!road) { console.error(`${id}: not in imagery.json`); continue; }
  const slug = `${road.country}-${id}`;
  const samples = road.samples.map((s: any, i: number) => ({ ...s, i, next: road.samples[i + 1] ?? null, prev: road.samples[i - 1] ?? null }));

  for (const s of spread(samples.filter((s: any) => s.mapillary), PER_SOURCE)) {
    const key = s.mapillary.split('pKey=')[1];
    const meta = await (await fetch(`https://graph.mapillary.com/${key}?fields=thumb_1024_url,captured_at,creator&access_token=${MAPILLARY_TOKEN}`)).json();
    const name = `mapillary/${slug}-${s.i}.jpg`;
    await save(meta.thumb_1024_url, new URL(name, base));
    credits[name] = { road: road.label, way: id, source: 'Mapillary', image: `https://www.mapillary.com/app/?pKey=${key}`, author: meta.creator?.username ?? '', captured: new Date(meta.captured_at).toISOString().slice(0, 10), licence: 'CC BY-SA 4.0' };
  }

  for (const s of GOOGLE_PER_ROAD ? spread(samples.filter((s: any) => s.google), GOOGLE_PER_ROAD) : []) {
    const toward = s.next ?? s.prev;
    const heading = toward ? (s.next ? bearing(s, toward) : (bearing(s, toward) + 180) % 360) : 0;
    const name = `google/${slug}-${s.i}.jpg`;
    await save(`https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${s.lat},${s.lon}&radius=50&source=outdoor&fov=90&heading=${heading}&key=${GOOGLE_SV_KEY}`, new URL(name, base));
    credits[name] = { road: road.label, way: id, source: 'Google Street View', image: s.google, captured: road.google.latest, licence: 'copyrighted: checking only, do not upload' };
  }
  console.error(`${id} ${road.label}: done`);
}
writeFileSync(creditsFile, JSON.stringify(credits, null, 1));
