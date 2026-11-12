// Open a web map in headless Chrome and save every vector tile it loads, to read which surface fields its tiles carry.
// Usage: node research/tiles/capture-tiles.mjs <name> <url> [outdir]
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const [name, url, out = 'research/work/tiles'] = process.argv.slice(2);
const dir = `${out}/${name}`;
mkdirSync(dir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--window-size=1200,800'] });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
await page.setViewport({ width: 1200, height: 800 });
let n = 0;
const seen = [];
page.on('response', async (r) => {
  const u = r.url();
  const ct = r.headers()['content-type'] || '';
  seen.push(`${r.status()} ${ct.slice(0, 40)} ${u.slice(0, 200)}`);
  if (!/protobuf|mvt|vnd\.mapbox|octet-stream/.test(ct) && !/\.(pbf|mvt)(\?|$)/.test(u)) return;
  try {
    const b = await r.buffer();
    if (b.length < 50) return;
    const f = `${dir}/${String(n++).padStart(3, '0')}.mvt`;
    writeFileSync(f, b);
    writeFileSync(`${f}.url`, u);
  } catch {}
});
try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }); } catch (e) { console.error('goto:', e.message); }
await new Promise((r) => setTimeout(r, 6000));
await page.screenshot({ path: `${dir}/page.png` });
writeFileSync(`${dir}/requests.txt`, seen.join('\n'));
console.log(`${name}: ${n} tiles, ${seen.length} requests`);
await browser.close();
