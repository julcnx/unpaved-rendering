// Spot-check: the 2 longest ways of each odd-way list in a few results, against live OSM tags and geometry.
// Usage: node stats/spot-check.ts na bo np dk   (OSM API, one request per way)
import { readFileSync } from 'node:fs';
import { classify } from '../classifier/classify.ts';
const R = 6371.0088;
const hav = (a: any, b: any) => {
  const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const UA = { 'User-Agent': 'unpaved-rendering-stats-spot-check' };
for (const code of process.argv.slice(2)) {
  const res = JSON.parse(readFileSync(new URL(`./results/${code}.json`, import.meta.url), 'utf8'));
  for (const [list, ways] of Object.entries(res.odd) as [string, any[]][]) {
    for (const w of ways.slice(0, 2)) {
      const id = w.id.slice(1);
      const r = await fetch(`https://api.openstreetmap.org/api/0.6/way/${id}/full.json`, { headers: UA });
      if (!r.ok) { console.log(`${code} ${list} ${w.id}: HTTP ${r.status}`); continue; }
      const els = (await r.json()).elements;
      const nodes = new Map(els.filter((e: any) => e.type === 'node').map((e: any) => [e.id, e]));
      const way = els.find((e: any) => e.type === 'way');
      let km = 0;
      for (let i = 1; i < way.nodes.length; i++) km += hav(nodes.get(way.nodes[i - 1]), nodes.get(way.nodes[i]));
      const keys = ['highway', 'surface', 'smoothness', 'tracktype', '4wd_only'];
      const changed = keys.filter((k) => (w.tags[k] ?? '') !== (way.tags[k] ?? ''));
      const level = classify(way.tags);
      console.log([code, list, w.id, w.tags.ref ?? '', `stats ${w.level} ${w.km} km`, `live ${level} ${km.toFixed(1)} km`,
        changed.length ? `tags changed: ${changed.map((k) => `${k} ${w.tags[k] ?? '-'} -> ${way.tags[k] ?? '-'}`).join(', ')}` : 'tags same'].join(' | '));
      await new Promise((s) => setTimeout(s, 400));
    }
  }
}
