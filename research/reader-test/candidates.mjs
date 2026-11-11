// Roads visible in the reader-test frame (Namutoni, the article's slider view), with level and pixel position.
// Same projection as js/map.js: Web Mercator, 256 px tiles.
import { readFileSync } from 'node:fs';
import { classify } from '../../js/classify.js';
const [LAT, LON, Z, W, H] = [-18.81068, 16.9329, 16, 1600, 900];
const lonX = (lon) => (lon + 180) / 360;
const latY = (lat) => { const s = Math.sin((lat * Math.PI) / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const S = 256 * 2 ** Z, px = ([lo, la]) => [(lonX(lo) - lonX(LON)) * S + W / 2, (latY(la) - latY(LAT)) * S + H / 2];
const ROADS = /^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street)$/;
const data = JSON.parse(readFileSync(new URL('../../data/namibia.json', import.meta.url)));
for (const f of data.features) {
  const t = f.properties; if (!ROADS.test(t.highway)) continue;
  const pts = f.geometry.coordinates.map(px).filter(([x, y]) => x > 60 && x < W - 60 && y > 60 && y < H - 60);
  if (pts.length < 2) continue;
  const [x, y] = pts[Math.floor(pts.length / 2)];
  console.log(t.id, t.highway, t.surface ?? '-', t.smoothness ?? '', classify(t), Math.round(x), Math.round(y), pts.length);
}
