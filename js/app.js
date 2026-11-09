// Page wiring: controls, URL parameters, sample spots, live Overpass loading, legend.
import { MapView, BACKGROUNDS, prepare } from './map.js';
import { STYLES, palette, widthAt } from './styles.js';
import { SPOTS } from './spots.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const LIVE_ZOOM = 14; // live Overpass loads only from this zoom, to keep queries small
const CELL = 0.02; // live areas are cached per 0.02 degree cell

const options = (sel, entries, value) => {
  sel.innerHTML = entries.map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  if (value) sel.value = value;
};
options($('spot'), [['', '(none: search or pan)'], ...Object.entries(SPOTS).map(([k, v]) => [k, v.name])], params.get('spot') ?? 'namibia');
options($('style'), Object.entries(STYLES).map(([k, v]) => [k, v.name]), params.get('style'));
options($('bg'), Object.entries(BACKGROUNDS).map(([k, v]) => [k, v.name]), params.get('bg'));
$('compare').checked = params.get('compare') === '1';

const map = new MapView($('map'), () => { updateUrl(); loadLive(); updateNote(); });
map.opts = { style: $('style').value, bg: $('bg').value, compare: $('compare').checked };

function updateUrl() {
  const { lat, lon, z } = map.center();
  const p = new URLSearchParams({ spot: $('spot').value, style: map.opts.style, bg: map.opts.bg, z: z.toFixed(2), lat: lat.toFixed(5), lon: lon.toFixed(5) });
  if (map.opts.compare) p.set('compare', '1');
  history.replaceState(null, '', `?${p}`);
}

const msg = (text) => { $('msg').textContent = text; $('msg').style.display = text ? 'block' : 'none'; };

// ---- Data: cached sample spots, then live Overpass for anywhere else ----
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
async function overpass(bbox) {
  const q = `[out:json][timeout:60];way[highway](${bbox});out tags geom;`;
  for (const url of OVERPASS) {
    try {
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }) });
      if (res.ok) return (await res.json()).elements;
    } catch { /* try the next server */ }
  }
  throw new Error('Overpass is not answering, try again later');
}
const toFeatures = (els) => els.map((w) => ({ properties: w.tags, geometry: { coordinates: w.geometry.map((p) => [p.lon, p.lat]) } }));

async function loadSpot(id) {
  if (!id) return;
  const spot = SPOTS[id];
  if (!map.layers.has(`spot:${id}`)) {
    try {
      const res = await fetch(`data/${id}.json`);
      if (!res.ok) throw new Error();
      map.layers.set(`spot:${id}`, prepare((await res.json()).features));
    } catch { /* not cached yet: the live loader takes over */ }
  }
  if (!params.has('lat') || map.started) map.setCenter(spot.center[0], spot.center[1], 15);
  map.started = true;
  map.redraw();
  loadLive();
}

const loaded = new Set();
async function loadLive() {
  const { z } = map.center();
  const b = map.bounds();
  const cells = [];
  for (let la = Math.floor(b.south / CELL); la <= Math.floor(b.north / CELL); la++)
    for (let lo = Math.floor(b.west / CELL); lo <= Math.floor(b.east / CELL); lo++) cells.push([la, lo]);
  const spotCovered = [...map.layers.keys()].some((k) => k.startsWith('spot:') && k === `spot:${$('spot').value}`);
  const missing = cells.filter(([la, lo]) => !loaded.has(`${la},${lo}`));
  if (!missing.length || spotCovered) { msg(''); return; }
  if (z < LIVE_ZOOM) { msg(`Zoom in to load roads (zoom ${LIVE_ZOOM}+)`); return; }
  missing.forEach(([la, lo]) => loaded.add(`${la},${lo}`));
  const las = missing.map((c) => c[0]), los = missing.map((c) => c[1]);
  const bbox = [Math.min(...las) * CELL, Math.min(...los) * CELL, (Math.max(...las) + 1) * CELL, (Math.max(...los) + 1) * CELL].map((v) => v.toFixed(4)).join(',');
  msg('Loading roads from OpenStreetMap...');
  try {
    map.layers.set(`live:${bbox}`, prepare(toFeatures(await overpass(bbox))));
    msg('');
    map.redraw();
  } catch (e) {
    missing.forEach(([la, lo]) => loaded.delete(`${la},${lo}`));
    msg(e.message);
  }
}

$('search').addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter' || !e.target.value.trim()) return;
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(e.target.value)}`);
  const [hit] = await res.json();
  if (!hit) { msg('Place not found'); return; }
  $('spot').value = '';
  map.setCenter(+hit.lat, +hit.lon, 15);
  updateUrl(); loadLive(); updateNote();
});

// ---- Legend and zoom note ----
function sample(canvas, styleKey, level) {
  const dpr = window.devicePixelRatio || 1, W = 90, H = 22;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = BACKGROUNDS[map.opts.bg], pal = palette(bg.dark), c = pal.primary, w = 10;
  ctx.fillStyle = bg.land; ctx.fillRect(0, 0, W, H);
  const d = STYLES[styleKey].draw(level, c, w, pal.brown, ctx);
  const line = (color, width, dash, cap = 'round') => {
    ctx.beginPath(); ctx.moveTo(8, H / 2); ctx.lineTo(W - 8, H / 2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap; ctx.setLineDash(dash ?? []); ctx.stroke();
  };
  line(c.casing, w + 3, d.casing?.dash, d.casing?.cap);
  line(d.fill?.color ?? c.fill, w, d.fill?.dash, d.fill?.cap);
  for (const o of d.over ?? []) line(o.color, o.width, o.dash, o.cap);
}

function updateLegend() {
  const key = map.opts.compare ? Object.keys(STYLES)[0] : map.opts.style;
  $('legend').innerHTML = [['paved', 'Paved'], ['unpaved', 'Unpaved'], ['offroad', 'Off-road']]
    .map(([lv, text]) => `<div><canvas data-level="${lv}"></canvas>${text}</div>`).join('');
  $('legend').querySelectorAll('canvas').forEach((cv) => sample(cv, key, cv.dataset.level));
}

function updateNote() {
  const st = STYLES[map.opts.style];
  const { z } = map.center();
  // Zoom from which a primary road is wide enough for the style.
  const from = 15 + Math.log2(st.minWidth / 10) / 0.55;
  const w = widthAt(10, z);
  $('note').textContent = map.opts.compare ? 'Side by side: same view, every style.' :
    `${st.note} Readable from about zoom ${from.toFixed(1)} on primary roads (${st.minWidth} px).`;
  $('status').textContent = `Zoom ${z.toFixed(1)}: primary road ${w.toFixed(1)} px wide${w < st.minWidth && !map.opts.compare ? ', too thin for this style' : ''}.`;
}

for (const id of ['style', 'bg', 'compare']) {
  $(id).addEventListener('change', () => {
    map.opts = { style: $('style').value, bg: $('bg').value, compare: $('compare').checked };
    map.redraw(); updateLegend(); updateNote(); updateUrl();
  });
}
$('spot').addEventListener('change', () => { loadSpot($('spot').value); updateUrl(); });

if (params.has('lat')) map.setCenter(+params.get('lat'), +params.get('lon'), +(params.get('z') ?? 15));
else if (params.has('z')) map.view.z = +params.get('z');
await loadSpot($('spot').value);
if (params.has('z') && !params.has('lat')) { const c = map.center(); map.setCenter(c.lat, c.lon, +params.get('z')); }
updateLegend(); updateNote(); updateUrl();
window.mapReady = true; // for the screenshot loop
