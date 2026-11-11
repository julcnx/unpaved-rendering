// Searches a spot's cached data for a frame centre with enough clear roads at a given zoom (both levels present).
// Usage: node research/reader-test/find-frame.mjs nepal 15
import { pickRoads } from './pick-roads.mjs';
import { SPOTS } from '../../js/spots.js';
const [spot, z] = [process.argv[2], +process.argv[3]];
const [la0, lo0] = SPOTS[spot].center, r = (SPOTS[spot].radius ?? 0.06) * 0.7, step = r / 6;
const found = [];
for (let la = la0 - r; la <= la0 + r; la += step) for (let lo = lo0 - r; lo <= lo0 + r; lo += step) {
  const pick = pickRoads(spot, [la, lo], z), u = pick.filter((p) => p.unpaved).length;
  if (u >= 2 && pick.length - u >= 2) found.push({ c: [+la.toFixed(5), +lo.toFixed(5)], n: pick.length, u, main: pick.filter((p) => /trunk|primary|secondary/.test(p.highway)).length });
}
found.sort((a, b) => b.n - a.n || b.main - a.main);
for (const f of found.slice(0, 8)) console.log(f.c.join(','), `${f.n} roads, ${f.u} unpaved, ${f.main} main`);
if (!found.length) console.log('no frame with two paved and two unpaved roads');
