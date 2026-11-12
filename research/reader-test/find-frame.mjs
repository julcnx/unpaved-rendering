// Searches a spot's cached data for a frame centre with enough clear roads at a given zoom: two paved, two unpaved,
// at least one unpaved main road (trunk, primary or secondary), the case the styles are made for, and at least one
// minor road, so the map is not main roads only.
// Usage: node research/reader-test/find-frame.mjs nepal 15
import { pickRoads } from './pick-roads.mjs';
import { SPOTS } from '../../js/spots.js';
const [spot, z] = [process.argv[2], +process.argv[3]];
// Phone-sized frames are small: a fine grid (about 300 m) over most of the cached area.
const [la0, lo0] = SPOTS[spot].center, r = (SPOTS[spot].radius ?? 0.06) * 0.8, step = 0.003;
const MAIN = /^(trunk|primary|secondary)$/;
const found = [];
const near = ([la, lo]) => Math.hypot(la - la0, lo - lo0);
for (let la = la0 - r; la <= la0 + r; la += step) for (let lo = lo0 - r; lo <= lo0 + r; lo += step) {
  const pick = pickRoads(spot, [la, lo], z), u = pick.filter((p) => p.unpaved).length;
  const main = pick.filter((p) => MAIN.test(p.highway)), mu = main.filter((p) => p.unpaved).length;
  if (u >= 2 && pick.length - u >= 2 && mu >= 1 && main.length < pick.length) found.push({ c: [+la.toFixed(5), +lo.toFixed(5)], n: pick.length, u, main: main.length, mu });
}
found.sort((a, b) => b.n - a.n || b.main - a.main || near(a.c) - near(b.c));
for (const f of found.slice(0, 8)) console.log(f.c.join(','), `${f.n} roads, ${f.u} unpaved, ${f.main} main (${f.mu} unpaved)`);
if (!found.length) console.log('no frame with two paved and two unpaved roads, an unpaved main road and a minor road');
