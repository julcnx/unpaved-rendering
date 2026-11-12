// Picks four or five numbered roads per spot for the reader test and writes labels.json (positions, levels, answer key).
// Usage: node research/reader-test/pick-roads.mjs
// Frame: each spot's centre at its own zoom (ZOOM), W x H CSS px (same projection as js/map.js): a phone screen, so the map is
// seen at its real size on a phone (a wider picture shrinks there and the patterns vanish), and at the same size on a desktop. At zoom 15 minor roads are
// 6 px, just enough for the patterns; at 14 they show the plain low-zoom tint, main roads keep the pattern. A road qualifies when its label
// point is well inside the frame and at least MIN_CLEAR px from any other way, so the number cannot point at two lines.
// The shots are drawn with reader=1: no tracks or paths, no road too thin for the pattern, off-road drawn as unpaved. So only drawn roads
// count for clearance, and a road is one road for the reader as long as it stays paved or stays unpaved.
import { readFileSync, writeFileSync } from 'node:fs';
import { classify } from '../../js/classify.js';
import { roadInfo, widthAt, LOW_BELOW } from '../../js/styles.js';
import { SPOTS } from '../../js/spots.js';

export const W = 400, H = 520;
const MARGIN = 40, MIN_CLEAR = 16, MIN_APART = 80, OFF = 28, MAX_ROADS = 5;
// Five places. Iceland dropped: no minor road near its main roads (farms are reached by service roads, too thin to draw),
// so its map showed main roads only. Zoom 15 or more everywhere: below it, tertiary and minor roads are under 6 px and get
// the plain low-zoom tint instead of the style's pattern, which mixes two signals in one picture.
export const ZOOM = { bolivia: 15, nepal: 16, alberta: 15, namibia: 16, australia: 15 };
// Frames found by find-frame.mjs for the phone frame: four or five clear roads, two of them paved, an unpaved main road and
// a minor road, near the spot centre. The number of unpaved roads varies (2 or 3), so nobody can guess it.
// Bolivia and Alberta: no frame has all that. Their spot centres instead, where the main road (F3, Hwy 40) changes from
// paved to unpaved, which the map must show; every other road there is unpaved, so the main road's paved part is the only
// paved road.
export const CENTER = {
  bolivia: [-14.87824, -64.99758], nepal: [28.78567, 83.73373], alberta: [51.30019, -114.94517],
  namibia: [-18.81368, 16.9415], australia: [-17.15373, 144.51059],
};
const ROADS = /^(trunk|primary|secondary|tertiary|unclassified|residential)$/;
const MIN_PAVED = 2, MAX_UNPAVED = 3; // two paved roads to rule out in every picture, and never all unpaved
const RANK = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'];

const lonX = (lon) => (lon + 180) / 360;
const latY = (lat) => { const s = Math.sin((lat * Math.PI) / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};

const cache = new Map();
const load = (spot) => cache.get(spot) ?? cache.set(spot, JSON.parse(readFileSync(new URL(`../../data/${spot}.json`, import.meta.url))).features).get(spot);

// Picks the numbered roads for one frame. Exported so find-frame.mjs can test other centres.
export function pickRoads(spot, [lat, lon], Z) {
  const S = 256 * 2 ** Z;
  const px = ([lo, la]) => [(lonX(lo) - lonX(lon)) * S + W / 2, (latY(la) - latY(lat)) * S + H / 2];
  const ways = load(spot)
    .filter((f) => { const info = roadInfo(f.properties.highway); return info && widthAt(info[1], Z) >= LOW_BELOW; }) // as drawn in the shots
    .map((f) => { const level = classify(f.properties);
      return { tags: f.properties, coords: f.geometry.coordinates, pts: f.geometry.coordinates.map(px), level, unpaved: level !== 'paved' }; });
  // One road for the reader: sections with the same ref or name and the same look (paved or unpaved), or unnamed
  // sections of the same class and look that meet end to end. Grouped with union-find; one label per group at most.
  const group = ways.map((_, i) => i);
  const find = (i) => (group[i] === i ? i : (group[i] = find(group[i])));
  const join = (i, j) => { group[find(i)] = find(j); };
  const byName = new Map(), byEnd = new Map();
  ways.forEach((w, i) => {
    const name = w.tags.ref ?? w.tags.name;
    if (name) { const k = `${name}|${w.unpaved}`; byName.has(k) ? join(i, byName.get(k)) : byName.set(k, i); }
    else for (const c of [w.coords[0], w.coords.at(-1)]) {
      const k = `${c}|${w.tags.highway}|${w.unpaved}`; byEnd.has(k) ? join(i, byEnd.get(k)) : byEnd.set(k, i);
    }
  });
  const sameRoad = (i, j) => find(i) === find(j);
  const cands = [];
  ways.forEach((w, i) => {
    if (!ROADS.test(w.tags.highway)) return;
    let best = null;
    // Candidate points: vertices and segment midpoints inside the frame; keep the one farthest from other ways.
    const pts = w.pts.flatMap((p, k) => (k ? [[(p[0] + w.pts[k - 1][0]) / 2, (p[1] + w.pts[k - 1][1]) / 2], p] : [p]));
    for (const p of pts) {
      if (p[0] < MARGIN || p[0] > W - MARGIN || p[1] < MARGIN || p[1] > H - MARGIN) continue;
      let clear = Infinity;
      ways.forEach((o, j) => { if (j !== i && !sameRoad(i, j)) for (let k = 1; k < o.pts.length; k++) clear = Math.min(clear, segDist(p, o.pts[k - 1], o.pts[k])); });
      if (!best || clear > best.clear) best = { p, clear };
    }
    if (best && best.clear >= MIN_CLEAR) {
      cands.push({ x: Math.round(best.p[0]), y: Math.round(best.p[1]), clear: Math.round(best.clear),
        highway: w.tags.highway, surface: w.tags.surface ?? null, ref: w.tags.ref ?? w.tags.name ?? null,
        level: w.level, unpaved: w.unpaved, road: find(i) });
    }
  });
  // Main roads first, then the clearest; greedy pick with distance between labels.
  cands.sort((a, b) => RANK.indexOf(a.highway) - RANK.indexOf(b.highway) || b.clear - a.clear);
  const pick = [];
  const take = (list, max) => { for (const c of list) { if (pick.length >= max) break;
    if (c.unpaved && pick.filter((p) => p.unpaved).length >= MAX_UNPAVED) continue;
    if (pick.every((p) => p.road !== c.road && Math.hypot(p.x - c.x, p.y - c.y) >= MIN_APART)) pick.push(c); } };
  take(cands.filter((c) => !c.unpaved), MIN_PAVED);       // the paved distractors first, they are the scarce ones
  take(cands.filter((c) => !pick.includes(c)), MAX_ROADS); // then the rest, main roads first
  // Where the number goes: of 8 directions at OFF px, the one farthest from any line (it must not cover another road).
  for (const p of pick) {
    let best = null;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, q = [p.x + OFF * Math.cos(a), p.y + OFF * Math.sin(a)];
      // Inside the frame, clear of the picture letter (top left) and of the attribution line (bottom).
      if (q[0] < 16 || q[0] > W - 16 || q[1] < 16 || q[1] > H - 34 || (q[0] < 56 && q[1] < 48)) continue;
      let clear = Infinity;
      for (const o of ways) for (let j = 1; j < o.pts.length; j++) clear = Math.min(clear, segDist(q, o.pts[j - 1], o.pts[j]));
      if (!best || clear > best.clear) best = { clear, dx: Math.round(q[0] - p.x), dy: Math.round(q[1] - p.y) };
    }
    p.dx = best.dx; p.dy = best.dy;
  }
  // Number them in reading order (top to bottom, left to right), so the order says nothing about the answer.
  pick.sort((a, b) => a.y - b.y || a.x - b.x).forEach((p, k) => { p.n = k + 1; delete p.road; });
  return pick;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const spot of Object.keys(ZOOM)) {
    const center = CENTER[spot] ?? SPOTS[spot].center, pick = pickRoads(spot, center, ZOOM[spot]);
    const unp = pick.filter((p) => p.unpaved).map((p) => p.n);
    console.log(spot.padEnd(10), `${pick.length} roads, unpaved: ${unp.join(', ')}`, pick.length < 4 || pick.length === unp.length ? '  (SHORT)' : '');
    out[spot] = { zoom: ZOOM[spot], center, roads: pick };
  }
  writeFileSync(new URL('labels.json', import.meta.url), JSON.stringify(out, null, 1));
}
