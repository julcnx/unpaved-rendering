// Screenshots of the demo for review: every spot x style x background x zoom, or a subset.
// Usage: node scripts/shots.mjs [--spots a,b] [--styles a,b] [--bgs a,b] [--zooms 13,15,17] [--compare] [--portrait] [--center lat,lon] [--attribution] [--out dir]
// Map only: sidebar, chips and messages hidden. --attribution keeps the OSM credit (needed on any published shot).
// Needs the repo served on http://localhost:8765 (python3 -m http.server 8765); the demo is at /demo/.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1].split(',') : def; };
const spots = arg('spots', ['namibia', 'bolivia', 'nepal', 'iceland', 'australia', 'alberta']);
const styles = arg('styles', ['grain', 'centre-line', 'dashed-fill', 'dashed-casing', 'dashed-fill-full']);
const bgs = arg('bgs', ['white', 'forest', 'sand', 'dark', 'terrain']);
const zooms = arg('zooms', ['13', '15', '17']);
const compare = process.argv.includes('--compare');
const center = arg('center', null);
const hide = ['aside', '#chips', '#bgchips', '#msg', ...(process.argv.includes('--attribution') ? [] : ['#attr'])];
const out = arg('out', ['shots'])[0];
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
// --portrait: 1080 x 1350 (4:5, Facebook feed); the all-styles grid then stacks as 2 columns x 3 rows.
const portrait = process.argv.includes('--portrait');
const size = arg('size', null); // --size 1600x900: another viewport (article hero)
await page.setViewport({ width: size ? +size[0].split('x')[0] : portrait ? 1080 : 1200, height: size ? +size[0].split('x')[1] : portrait ? 1350 : 800, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
// Cached spot data only: Overpass breaks too easily to make the shots depend on it.
await page.setRequestInterception(true);
page.on('request', (r) => (/overpass/i.test(r.url()) ? r.abort() : r.continue()));
for (const spot of spots) for (const bg of bgs) for (const z of zooms) for (const style of compare ? ['all'] : styles) {
  const q = new URLSearchParams({ spot, bg, z, style: compare ? 'centre-line' : style });
  q.set('compare', compare ? '1' : '0'); // the demo shows all styles unless compare=0
  if (center) { q.set('lat', center[0]); q.set('lon', center[1]); } // --center lat,lon: other view than the spot centre
  await page.goto(`http://localhost:8765/demo/?${q}`, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: `body { grid-template-columns: 1fr !important; } ${hide.join(', ')} { display: none !important; }` });
  await page.waitForFunction('window.mapReady === true', { timeout: 20000 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize'))); // redraw at the full width
  await new Promise((r) => setTimeout(r, 1200));
  // Hillshade: wait until every elevation tile has loaded (a fixed 3 s once left a blank block), then let it redraw.
  if (bg === 'terrain') { await page.waitForFunction('!(window.terrainPending > 0)', { timeout: 30000 }); await new Promise((r) => setTimeout(r, 500)); }
  const file = `${out}/${spot}-${style}-${bg}-z${z}.png`;
  await page.screenshot({ path: file });
  console.error(file);
}
await browser.close();
