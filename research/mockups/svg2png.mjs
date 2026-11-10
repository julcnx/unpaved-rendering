// PNG copies of the mockup SVGs (2 x, headless Chrome through puppeteer-core).
// Usage (from research/): node mockups/svg2png.mjs [svg ...]   (default: every option*.svg and references*.svg here)
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = fileURLToPath(new URL('.', import.meta.url));
const files = process.argv.length > 2 ? process.argv.slice(2)
  : readdirSync(here).filter((f) => /^(option|references).*\.svg$/.test(f)).map((f) => here + f);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
for (const f of files) {
  const svg = readFileSync(f, 'utf8');
  const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/);
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.screenshot({ path: f.replace(/\.svg$/, '.png') });
}
await browser.close();
