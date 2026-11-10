// Screenshots of the demo for review: every spot x style x background x zoom, or a subset.
// Usage: node scripts/shots.mjs [--spots a,b] [--styles a,b] [--bgs a,b] [--zooms 13,15,17] [--compare] [--attribution] [--out dir]
// Map only: sidebar, chips and messages hidden. --attribution keeps the OSM credit (needed on any published shot).
// Needs the demo served on http://localhost:8765 (python3 -m http.server 8765).
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1].split(',') : def; };
const spots = arg('spots', ['namibia', 'bolivia', 'nepal', 'iceland', 'australia', 'alberta']);
const styles = arg('styles', ['grain', 'centre-line', 'dashed-fill', 'dashed-casing', 'dashed-fill-full']);
const bgs = arg('bgs', ['white', 'forest', 'sand', 'dark', 'terrain']);
const zooms = arg('zooms', ['13', '15', '17']);
const compare = process.argv.includes('--compare');
const hide = ['aside', '#chips', '#bgchips', '#msg', ...(process.argv.includes('--attribution') ? [] : ['#attr'])];
const out = arg('out', ['shots'])[0];
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
// Cached spot data only: Overpass breaks too easily to make the shots depend on it.
await page.setRequestInterception(true);
page.on('request', (r) => (/overpass/i.test(r.url()) ? r.abort() : r.continue()));
for (const spot of spots) for (const bg of bgs) for (const z of zooms) for (const style of compare ? ['all'] : styles) {
  const q = new URLSearchParams({ spot, bg, z, style: compare ? 'centre-line' : style });
  if (compare) q.set('compare', '1');
  await page.goto(`http://localhost:8765/?${q}`, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: `body { grid-template-columns: 1fr !important; } ${hide.join(', ')} { display: none !important; }` });
  await page.waitForFunction('window.mapReady === true', { timeout: 20000 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize'))); // redraw at the full width
  await new Promise((r) => setTimeout(r, bg === 'terrain' ? 3000 : 1200));
  const file = `${out}/${spot}-${style}-${bg}-z${z}.png`;
  await page.screenshot({ path: file });
  console.error(file);
}
await browser.close();
