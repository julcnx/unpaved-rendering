// Picks six numbered roads per spot for the reader test and writes labels.json (positions, levels, answer key).
// Usage: node research/reader-test/pick-roads.mjs
// Frame: each spot's centre at its own zoom (ZOOM), 1600 x 900 (same projection as js/map.js). At zoom 15 minor roads are
// 6 px, just enough for the patterns; at 14 they show the plain low-zoom tint, main roads keep the pattern. A road qualifies when its label
// point is well inside the frame and at least MIN_CLEAR px from any other way, so the number cannot point at two lines.
import { readFileSync, writeFileSync } from 'node:fs';
import { classify } from '../../js/classify.js';
import { SPOTS } from '../../js/spots.js';

const W = 1600, H = 900, MARGIN = 140, MIN_CLEAR = 18, MIN_APART = 140;
// Five places, one style each. Alberta dropped: one main road in its frame. Zoom 15 or more everywhere: below it, tertiary
// and minor roads are under 6 px and get the plain low-zoom tint instead of the style's pattern, which mixes two signals
// in one picture (seen in the first Iceland picture at zoom 14).
export const ZOOM = { bolivia: 15, nepal: 15, iceland: 15, namibia: 16, australia: 15 };
// Namibia: the article's Namutoni view (moved west), which has three clear paved roads; the spot centre has one.
// Nepal: 3 km south of the spot centre (found by find-frame.mjs), enough clear roads at zoom 15.
export const CENTER = { namibia: [-18.81068, 16.9329], nepal: [28.77767, 83.72473] };
const ROADS = /^(trunk|primary|secondary|tertiary|unclassified|residential)$/;
const MIN_PAVED = 2; // every picture has paved roads to rule out; the number of unpaved ones follows each spot
const RANK = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'];

const lonX = (lon) => (lon + 180) / 360;
const latY = (lat) => { const s = Math.sin((lat * Math.PI) / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};

// Picks the numbered roads for one frame. Exported so find-frame.mjs can test other centres.
export function pickRoads(spot, [lat, lon], Z) {
  const S = 256 * 2 ** Z;
  const px = ([lo, la]) => [(lonX(lo) - lonX(lon)) * S + W / 2, (latY(la) - latY(lat)) * S + H / 2];
  const ways = JSON.parse(readFileSync(new URL(`../../data/${spot}.json`, import.meta.url))).features
    .map((f) => ({ tags: f.properties, pts: f.geometry.coordinates.map(px), level: classify(f.properties) }));
  // Sections of the same road with the same level are one line for the reader: they do not count against each other.
  const sameRoad = (a, b) => (a.tags.ref ?? a.tags.name) && (a.tags.ref ?? a.tags.name) === (b.tags.ref ?? b.tags.name) && a.level === b.level;
  const cands = [];
  ways.forEach((w, i) => {
    if (!ROADS.test(w.tags.highway)) return;
    let best = null;
    // Candidate points: vertices and segment midpoints inside the frame; keep the one farthest from other ways.
    const pts = w.pts.flatMap((p, k) => (k ? [[(p[0] + w.pts[k - 1][0]) / 2, (p[1] + w.pts[k - 1][1]) / 2], p] : [p]));
    for (const p of pts) {
      if (p[0] < MARGIN || p[0] > W - MARGIN || p[1] < MARGIN || p[1] > H - MARGIN) continue;
      let clear = Infinity;
      ways.forEach((o, j) => { if (j !== i && !sameRoad(w, o)) for (let k = 1; k < o.pts.length; k++) clear = Math.min(clear, segDist(p, o.pts[k - 1], o.pts[k])); });
      if (!best || clear > best.clear) best = { p, clear };
    }
    if (best && best.clear >= MIN_CLEAR) {
      const level = classify(w.tags);
      cands.push({ x: Math.round(best.p[0]), y: Math.round(best.p[1]), clear: Math.round(best.clear),
        highway: w.tags.highway, surface: w.tags.surface ?? null, ref: w.tags.ref ?? w.tags.name ?? null,
        level, unpaved: level !== 'paved' });
    }
  });
  // Main roads first, then the clearest; greedy pick with distance between labels.
  cands.sort((a, b) => RANK.indexOf(a.highway) - RANK.indexOf(b.highway) || b.clear - a.clear);
  const pick = [];
  const take = (list, max) => { for (const c of list) { if (pick.length >= max) break;
    if (pick.every((p) => Math.hypot(p.x - c.x, p.y - c.y) >= MIN_APART)) pick.push(c); } };
  take(cands.filter((c) => !c.unpaved), MIN_PAVED);       // the paved distractors first, they are the scarce ones
  take(cands.filter((c) => !pick.includes(c)), 6);         // then the rest, main roads first
  // Where the number goes: of 8 directions at 44 px, the one farthest from any line (it must not cover another road).
  for (const p of pick) {
    let best = null;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, q = [p.x + 44 * Math.cos(a), p.y + 44 * Math.sin(a)];
      if (q[0] < 30 || q[0] > W - 30 || q[1] < 70 || q[1] > H - 30) continue;
      let clear = Infinity;
      for (const o of ways) for (let j = 1; j < o.pts.length; j++) clear = Math.min(clear, segDist(q, o.pts[j - 1], o.pts[j]));
      if (!best || clear > best.clear) best = { clear, dx: Math.round(q[0] - p.x), dy: Math.round(q[1] - p.y) };
    }
    p.dx = best.dx; p.dy = best.dy;
  }
  // Number them in reading order (top to bottom, left to right), so the order says nothing about the answer.
  pick.sort((a, b) => a.y - b.y || a.x - b.x).forEach((p, k) => { p.n = k + 1; });
  return pick;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const spot of Object.keys(ZOOM)) {
    const center = CENTER[spot] ?? SPOTS[spot].center, pick = pickRoads(spot, center, ZOOM[spot]);
    const unp = pick.filter((p) => p.unpaved).map((p) => p.n);
    console.log(spot.padEnd(10), `${pick.length} roads, unpaved: ${unp.join(', ')}`, pick.length < 5 ? '  (SHORT)' : '');
    out[spot] = { zoom: ZOOM[spot], center, roads: pick };
  }
  writeFileSync(new URL('labels.json', import.meta.url), JSON.stringify(out, null, 1));
}
