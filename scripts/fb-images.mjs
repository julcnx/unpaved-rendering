// Facebook post images, portrait for phones (1080 wide): three article figures as PNG, and the Today/Proposed slider as a GIF wipe.
// Output in social/facebook/. Run: node scripts/fb-images.mjs
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'social/facebook');
mkdirSync(out, { recursive: true });

// 1. Figures, cut from the built article. Captions dropped except the photo credits.
const figs = [
  ['1-photos.png', '.fig.photos', true],
  ['3-apps.png', '.fig.apps', false],
  ['4-table.png', '.fig.heat', false],
  ['5-styles.png', '.fig.junction', false],
];
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
await page.setViewport({ width: 540, height: 1200, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'networkidle0' });
// Mobile layout (under 760px), but the photos in 3 columns so 12 fit a 4:5 frame.
await page.addStyleTag({ content: '.photos .grid { grid-template-columns: repeat(3, 1fr) !important; }' });
await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'));
await new Promise(r => setTimeout(r, 1500));
for (const [file, sel, keepCaption] of figs) {
  const el = await page.$(sel);
  await el.evaluate((f, keep) => {
    f.style.cssText += 'margin:0;padding:18px;background:var(--paper);width:540px;max-width:none;box-sizing:border-box;';
    const cap = f.querySelector(':scope > figcaption');
    if (cap && !keep) cap.style.display = 'none';
  }, keepCaption);
  await el.screenshot({ path: path.join(out, file) });
  console.log('social/facebook/' + file);
}
await browser.close();

// 2. Slider wipe, portrait 4:5 cut around the junction: Today, wipe to Proposed, hold, wipe back.
// Divider x = p * W; left of it is Today.
const today = path.join(root, 'article/img/slider-today.jpg');
const proposed = path.join(root, 'article/img/slider-proposed.jpg');
const font = '/System/Library/Fonts/Helvetica.ttc';
const T = 7; // loop length, s
// Each label is drawn on its own map, so the wipe covers and reveals it with that map: only "Today" when the divider
// is fully right, only "Proposed" when fully left. Both top centre, so they swap halfway through each wipe.
const label = (text) => `drawtext=fontfile=${font}:text='${text}':fontsize=44:fontcolor=0x222222:box=1:boxcolor=white@0.92:boxborderw=14:x=(w-tw)/2:y=36`;
const crop = (text) => `crop=720:900:640:0,scale=864:1080:flags=lanczos,${label(text)},format=gbrp`;
// p(t): 1 for 0-1.2s, eases to 0 by 2.7s, holds to 5.2s, eases back to 1 by 6.7s, holds.
const ease = (a, b) => `(0.5-0.5*cos(PI*(T-${a})/${b - a}))`;
const p = `if(lt(T,1.2),1,if(lt(T,2.7),1-${ease(1.2, 2.7)},if(lt(T,5.2),0,if(lt(T,6.7),${ease(5.2, 6.7)},1))))`;
const filter = [
  `[0:v]${crop('Today')}[a];[1:v]${crop('Proposed')}[b];[a][b]blend=all_expr='if(lt(abs(X-W*${p}),3),255,if(lt(X,W*${p}),A,B))'`,
  'fps=15,split[x][y];[x]palettegen=max_colors=128[pal];[y][pal]paletteuse=dither=bayer:bayer_scale=4',
].join(',');
const inputs = ['-loop', '1', '-t', String(T), '-framerate', '15', '-i', today, '-loop', '1', '-t', String(T), '-framerate', '15', '-i', proposed];
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-loop', '0', path.join(out, '2-slider.gif')]);
console.log('social/facebook/2-slider.gif');
