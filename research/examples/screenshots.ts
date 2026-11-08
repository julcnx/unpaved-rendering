// Screenshots of the verified screenshot spots in every OSM-based web map, same size, zoom and centre.
// Usage: node examples/screenshots.ts [spot ...] [--show]   (spots: namibia, bolivia, nepal; --show opens a Chrome window)
// Writes examples/screenshots/<spot>/<app>.png. Uses the installed Google Chrome through puppeteer-core.

import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ZOOM = 15;
const VIEW = { width: 1200, height: 800 };

const SPOTS: Record<string, [number, number]> = {
  namibia: [-18.81068, 16.9415],
  bolivia: [-14.87824, -64.99758],
  nepal: [28.80567, 83.76673],
};

const osm = (layer: string) => (la: number, lo: number) => `https://www.openstreetmap.org/#map=${ZOOM}/${la}/${lo}&layers=${layer}`;
type App = { url: (la: number, lo: number) => string; css?: string; wait?: number; click?: string[]; zoomIn?: number };
const APPS: Record<string, App> = {
  'osm-carto': { url: osm('M') },
  cyclosm: { url: osm('Y') },
  humanitarian: { url: osm('H') },
  tracestrack: { url: osm('P') },
  shortbread: { url: osm('S') },
  'maptiler-omt': { url: osm('V') },
  opencyclemap: { url: osm('C') },
  transport: { url: osm('T') },
  opentopomap: { url: (la, lo) => `https://opentopomap.org/#map=${ZOOM}/${la}/${lo}` },
  americana: { url: (la, lo) => `https://americanamap.org/#map=${ZOOM}/${la}/${lo}`, wait: 20000 },
  komoot: { url: (la, lo) => `https://www.komoot.com/plan/@${la},${lo},${ZOOM}z` },
  'mapy-com': { url: (la, lo) => `https://mapy.com/en/zakladni?x=${lo}&y=${la}&z=${ZOOM}` },
  'gaia-gps': { url: (la, lo) => `https://www.gaiagps.com/map/?loc=${ZOOM}/${lo}/${la}`, click: ['Skip'] },
  'osmand-web': { url: (la, lo) => `https://osmand.net/map/?#${ZOOM}/${la}/${lo}` },
  locus: { url: (la, lo) => `https://web.locusmap.app/en/plan?lat=${la}&lng=${lo}&z=${ZOOM}&map=hikeBike` },
  strava: { url: (la, lo) => `https://www.strava.com/maps?sport=All&style=standard&terrain=false&labels=true&poi=true&cPhotos=true&3d=false#${ZOOM}/${la}/${lo}` },
  // The URL has no zoom: the map opens far out, so zoom in with the mouse wheel on the centre (the point).
  kurviger: { url: (la, lo) => `https://kurviger.com/en/plan?point=${la}%2C${lo}`, click: ['No, thanks'], zoomIn: 7 },
};

const args = process.argv.slice(2);
const show = args.includes('--show');
const spots = args.filter((a) => !a.startsWith('--'));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Cookie and welcome dialogs to close, most specific first.
const BANNER = ['Accept all cookies', 'Accept All', 'Accept all', 'Agree', 'I agree', 'Allow all', 'Got it', 'Close'];

// Click the smallest visible element with exactly this text, in the page and its iframes.
// Puppeteer's ::-p-text() also looks inside shadow DOMs, where some cookie dialogs live.
async function clickText(page: any, label: string) {
  for (const frame of page.frames()) {
    const handles = await frame.$$(`::-p-text(${label})`).catch(() => []);
    for (const h of handles) {
      const visible = await h.evaluate((el: Element, l: string) =>
        (el as HTMLElement).innerText?.trim() === l && el.getClientRects().length > 0, label).catch(() => false);
      if (!visible) continue;
      // Real mouse click on the button around the label (a click on an inner span is sometimes ignored).
      const target = (await h.evaluateHandle((el: Element) => el.closest('button, a, [role=button]') ?? el)).asElement() ?? h;
      const box = await target.boundingBox().catch(() => null);
      if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      else await target.evaluate((el: Element) => (el as HTMLElement).click()).catch(() => {});
      return true;
    }
  }
  return false;
}

// Hide the app's panels, toolbars and dialogs: the largest map element fills the window and everything else is hidden.
// visibility can be turned back on in a child, so the map stays visible while its ancestors are hidden.
// The map libraries keep the centre on the resize event sent after this.
async function isolateMap(page: any) {
  return page.evaluate(() => {
    const sel = '.maplibregl-map, .mapboxgl-map, .leaflet-container, .ol-viewport';
    const area = (e: Element) => { const r = e.getBoundingClientRect(); return r.width * r.height; };
    // Outermost map only: openstreetmap.org draws a MapLibre layer inside its Leaflet map.
    let map = [...document.querySelectorAll(sel)].filter((e) => !e.parentElement?.closest(sel)).sort((a, b) => area(b) - area(a))[0];
    let fallback = false;
    if (!map) {
      // No known map library class: take the largest canvas and climb to its first ancestor with a real size.
      // Controls drawn next to the canvas inside that element are hidden below.
      let e = [...document.querySelectorAll('canvas')].sort((a, b) => area(b) - area(a))[0]?.parentElement;
      while (e && area(e) === 0) e = e.parentElement;
      map = e!; fallback = true;
    }
    if (!map) return 'none';
    map.setAttribute('data-shot-map', fallback ? 'canvas' : '');
    const style = document.createElement('style');
    style.textContent = `body * { visibility: hidden !important }
      [data-shot-map], [data-shot-map] * { visibility: visible !important }
      [data-shot-map] { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; margin: 0 !important; transform: none !important }
      .leaflet-top, .maplibregl-ctrl-top-left, .maplibregl-ctrl-top-right, .mapboxgl-ctrl-top-left, .mapboxgl-ctrl-top-right,
      .maplibregl-ctrl-bottom-right .maplibregl-ctrl-group, .leaflet-bottom .leaflet-control-zoom,
      [data-shot-map=canvas] > :not(canvas):not(:has(canvas)) { display: none !important }`;
    document.head.append(style);
    return `${map.tagName.toLowerCase()}.${[...map.classList].slice(0, 2).join('.')}`;
  });
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: !show,
  defaultViewport: VIEW,
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', `--window-size=${VIEW.width},${VIEW.height + 120}`],
});
// APPS="komoot strava" limits the run to some apps.
const only = process.env.APPS?.split(/\s+/).filter(Boolean);
for (const spot of spots.length ? spots : ['namibia', 'bolivia']) {
  const [la, lo] = SPOTS[spot];
  const dir = new URL(`./screenshots/${spot}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  for (const [name, app] of Object.entries(APPS)) {
    if (only && !only.includes(name)) continue;
    const page = await browser.newPage();
    await page.setBypassCSP(true); // openstreetmap.org's content security policy blocks the injected CSS otherwise
    try {
      await page.goto(app.url(la, lo), { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(4000); // cookie dialogs slide in after the page is idle and ignore clicks until then
      for (let i = 0; i < 2; i++) {
        for (const label of BANNER) if (await clickText(page, label)) await sleep(800);
        await sleep(1000);
      }
      for (const label of app.click ?? []) { await clickText(page, label); await sleep(1000); }
      if (app.zoomIn) {
        // Zoom on the waypoint marker if there is one (a side panel can shift the map centre), else on the centre.
        const at = await page.evaluate(() => {
          const m = document.querySelector('.maplibregl-marker, .mapboxgl-marker, .leaflet-marker-icon');
          const r = m?.getBoundingClientRect();
          return r ? { x: r.x + r.width / 2, y: r.y + r.height } : null;
        });
        await page.mouse.move(at?.x ?? VIEW.width / 2, at?.y ?? VIEW.height / 2);
        for (let i = 0; i < app.zoomIn; i++) { await page.mouse.wheel({ deltaY: -400 }); await sleep(600); }
      }
      if (app.css) await page.addStyleTag({ content: app.css });
      console.error(`  map element: ${await isolateMap(page)}`);
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await sleep(app.wait ?? 6000); // let tiles and vector layers finish after the layout change
      await page.screenshot({ path: new URL(`${name}.png`, dir).pathname });
      console.error(`${spot} ${name}: ok`);
    } catch (e: any) {
      console.error(`${spot} ${name}: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
}
await browser.close();
