// Fetches the roads, tracks and paths around each sample spot from Overpass once, and saves them in data/.
// These are the same spots as the screenshots of today's apps, so comparisons are like for like.
// Usage: node scripts/fetch-spots.mjs [spot ...]
import { writeFileSync } from 'node:fs';
import { SPOTS } from '../js/spots.js';

const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const KEYS = ['highway', 'surface', 'smoothness', 'tracktype', '4wd_only', 'name', 'ref', 'bridge', 'tunnel'];
const UA = { 'User-Agent': 'unpaved-rendering demo (osm user julcnx)' };

async function overpass(q) {
  for (let i = 0; i < 6; i++) {
    const url = SERVERS[i % SERVERS.length];
    try {
      const res = await fetch(url, { method: 'POST', headers: UA, body: new URLSearchParams({ data: q }) });
      if (res.ok) return await res.json();
      console.error(`  ${url}: ${res.status}`);
    } catch (e) { console.error(`  ${url}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error('Overpass failed');
}

const only = process.argv.slice(2);
for (const [id, spot] of Object.entries(SPOTS)) {
  if (only.length && !only.includes(id)) continue;
  const [la, lo] = spot.center;
  const dLa = 0.06, dLo = 0.06 / Math.cos((la * Math.PI) / 180);
  const bbox = [la - dLa, lo - dLo, la + dLa, lo + dLo].map((v) => v.toFixed(5)).join(',');
  const data = await overpass(`[out:json][timeout:120];way[highway](${bbox});out tags geom;`);
  const features = data.elements.map((w) => ({
    type: 'Feature',
    properties: Object.fromEntries(KEYS.filter((k) => w.tags[k]).map((k) => [k, w.tags[k]])),
    geometry: { type: 'LineString', coordinates: w.geometry.map((p) => [+p.lon.toFixed(6), +p.lat.toFixed(6)]) },
  }));
  writeFileSync(new URL(`../data/${id}.json`, import.meta.url), JSON.stringify({ type: 'FeatureCollection', bbox, features }));
  console.error(`${id}: ${features.length} ways`);
}
