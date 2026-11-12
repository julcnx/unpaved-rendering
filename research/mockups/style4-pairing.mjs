// Style 4 (Dashed casing) on white minor roads, checked 2026-11-12: on light land it looks like the tracks of AllTrails,
// OpenCycleMap and Thunderforest (a white line with a dashed outline), and on forest its dashes nearly vanish.
// This sheet compares plain style 4 with two pairings: style 4 on class-coloured roads, and on white roads
// style 3 (Dashed fill) or style 1 (Grain fill). The demo itself is not changed: the pairing is swapped into the
// page's STYLES for the shot only.
// Usage (repo root, repo served on :8765 with `npm start`): node research/mockups/style4-pairing.mjs
// Writes research/mockups/style4-pairing.png (needs ImageMagick).
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';

const OUT = 'research/mockups';
const TMP = `${OUT}/tmp-style4-pairing`;
mkdirSync(TMP, { recursive: true });
// Reader-test frames with white unpaved minor roads next to a coloured main road (Australia: unclassified, secondary 27).
const labels = JSON.parse(readFileSync('research/reader-test/labels.json', 'utf8'));
const SPOT = 'australia', [LAT, LON] = labels[SPOT].center, Z = 16;
const BGS = ['white', 'forest', 'terrain'];
const VARIANTS = { plain: 'Style 4 everywhere', 'fill': 'Style 4, white roads style 3', grain: 'Style 4, white roads style 1' };

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
await page.setViewport({ width: 700, height: 460 });
await page.setRequestInterception(true);
page.on('request', (r) => (/overpass/i.test(r.url()) ? r.abort() : r.continue()));
const files = [];
for (const bg of BGS) for (const [v, label] of Object.entries(VARIANTS)) {
  const q = new URLSearchParams({ spot: SPOT, bg, z: String(Z), style: 'dashed-casing', compare: '0', lat: LAT, lon: LON });
  await page.goto(`http://localhost:8765/demo/?${q}`, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: 'body { grid-template-columns: 1fr !important; grid-template-rows: 1fr !important; } aside, #chips, #bgchips, #msg { display: none !important; }' });
  await page.waitForFunction('window.mapReady === true', { timeout: 20000 });
  await page.evaluate(async (v) => {
    const { STYLES } = await import('/js/styles.js');
    const plain = STYLES['dashed-casing'].draw;
    // White roads are the only class with tintCasing (style-spec.js).
    const other = v === 'fill' ? STYLES['dashed-fill'].draw : v === 'grain' ? STYLES.grain.draw : null;
    if (other) STYLES['dashed-casing'].draw = (level, c, ...rest) => (c.tintCasing ? other : plain)(level, c, ...rest);
    window.dispatchEvent(new Event('resize'));
  }, v);
  await new Promise((r) => setTimeout(r, 1200));
  if (bg === 'terrain') { await page.waitForFunction('!(window.terrainPending > 0)', { timeout: 30000 }); await new Promise((r) => setTimeout(r, 500)); }
  const f = `${TMP}/${bg}-${v}.png`;
  await page.screenshot({ path: f });
  files.push([f, `${label}, ${bg}`]);
}
await browser.close();
// One sheet: rows = backgrounds, columns = variants.
execFileSync('montage', [...files.flatMap(([f, l]) => ['-label', l, f]), '-tile', '3x', '-geometry', '+4+4', '-pointsize', '16', `${OUT}/style4-pairing.png`]);
rmSync(TMP, { recursive: true });
console.error(`${OUT}/style4-pairing.png`);
