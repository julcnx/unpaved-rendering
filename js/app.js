// Page wiring: controls, URL parameters, sample spots, live Overpass loading, legend.
import { MapView, BACKGROUNDS, prepare } from './map.js';
import { STYLES, palette, widthAt } from './styles.js';
import { SPOTS } from './spots.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
// Live Overpass, anywhere: main roads only from zoom 11 in big cells, every highway from zoom 14 in small cells.
const TIERS = [
  { minZoom: 14, cell: 0.02, query: 'way[highway]', label: 'roads' },
  { minZoom: 11, cell: 0.2, query: 'way[highway~"^(motorway|trunk|primary|secondary|tertiary)(_link)?$"]', label: 'main roads' },
];

const options = (sel, entries, value) => {
  sel.innerHTML = entries.map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  if (value) sel.value = value;
};
options($('spot'), [['', '(none: search or pan)'], ...Object.entries(SPOTS).map(([k, v]) => [k, v.name])], params.get('spot') ?? 'namibia');
options($('style'), Object.entries(STYLES).map(([k, v]) => [k, v.name]), params.get('style'));
$('compare').checked = params.get('compare') !== '0'; // all styles side by side by default
// Background: a key of BACKGROUNDS, or 'all' (every background side by side, one style only).
let bg = BACKGROUNDS[params.get('bg')] || params.get('bg') === 'all' ? params.get('bg') : 'white';
if ($('compare').checked && bg === 'all') bg = 'white';

const map = new MapView($('map'), () => { updateUrl(); loadLive(); updateNote(); });
map.opts = { style: $('style').value, bg, compare: $('compare').checked };

function updateUrl() {
  const { lat, lon, z } = map.center();
  const p = new URLSearchParams({ spot: $('spot').value, style: map.opts.style, bg: map.opts.bg, z: z.toFixed(2), lat: lat.toFixed(5), lon: lon.toFixed(5) });
  p.set('compare', map.opts.compare ? '1' : '0');
  history.replaceState(null, '', `?${p}`);
}

const msg = (text) => { $('msg').textContent = text; $('msg').style.display = text ? 'block' : 'none'; };

// ---- Data: cached sample spots, then live Overpass for anywhere else ----
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
async function overpass(bbox, query) {
  const q = `[out:json][timeout:60];${query}(${bbox});out tags geom;`;
  for (const url of OVERPASS) {
    try {
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }) });
      if (res.ok) return (await res.json()).elements;
    } catch { /* try the next server */ }
  }
  throw new Error('Overpass is not answering, try again later');
}
const toFeatures = (els) => els.map((w) => ({ properties: { ...w.tags, id: `w${w.id}` }, geometry: { coordinates: w.geometry.map((p) => [p.lon, p.lat]) } }));

async function loadSpot(id) {
  if (!id) return;
  const spot = SPOTS[id];
  if (!map.layers.has(`spot:${id}`)) {
    try {
      const res = await fetch(`data/${id}.json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      map.layers.set(`spot:${id}`, prepare(data.features));
      // The saved area counts as loaded, for every tier: live loading takes over outside it.
      const [s, w, n, e] = data.bbox.split(',').map(Number);
      for (const t of TIERS) cellsIn({ south: s, west: w, north: n, east: e }, t.cell, true).forEach((c) => loadedCells.add(`${t.cell}:${c}`));
    } catch { /* not cached yet: the live loader takes over */ }
  }
  if (!params.has('lat') || map.started) map.setCenter(spot.center[0], spot.center[1], 15);
  map.started = true;
  map.redraw();
  loadLive();
}

const loadedCells = new Set(); // `${cell size}:${lat index},${lon index}`
// Cells of size `cell` that touch the bounds; `inside` keeps only the cells fully inside (for saved areas).
function cellsIn(b, cell, inside = false) {
  const out = [], f = inside ? Math.ceil : Math.floor, g = inside ? (v) => Math.floor(v) - 1 : Math.floor;
  for (let la = f(b.south / cell); la <= g(b.north / cell); la++)
    for (let lo = f(b.west / cell); lo <= g(b.east / cell); lo++) out.push(`${la},${lo}`);
  return out;
}
async function loadLive() {
  const { z } = map.center();
  const tier = TIERS.find((t) => z >= t.minZoom);
  if (!tier) { msg(`Zoom in to load roads (main roads from zoom ${TIERS.at(-1).minZoom})`); return; }
  const missing = cellsIn(map.bounds(), tier.cell).filter((c) => !loadedCells.has(`${tier.cell}:${c}`));
  if (!missing.length) { msg(''); return; }
  if (missing.length > 12) { msg('Zoom in a little to load roads'); return; }
  missing.forEach((c) => loadedCells.add(`${tier.cell}:${c}`));
  const ij = missing.map((c) => c.split(',').map(Number));
  const las = ij.map((c) => c[0]), los = ij.map((c) => c[1]);
  const bbox = [Math.min(...las) * tier.cell, Math.min(...los) * tier.cell, (Math.max(...las) + 1) * tier.cell, (Math.max(...los) + 1) * tier.cell].map((v) => v.toFixed(4)).join(',');
  msg(`Loading ${tier.label} from OpenStreetMap...`);
  try {
    map.layers.set(`live:${tier.cell}:${bbox}`, prepare(toFeatures(await overpass(bbox, tier.query))));
    msg('');
    map.redraw();
  } catch (e) {
    missing.forEach((c) => loadedCells.delete(`${tier.cell}:${c}`));
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
function sample(canvas, styleKey, level, W = 90) {
  const dpr = window.devicePixelRatio || 1, H = 22;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = BACKGROUNDS[map.opts.bg] ?? BACKGROUNDS.white, pal = palette(bg.dark), c = pal.primary, w = 10;
  ctx.fillStyle = bg.land; ctx.fillRect(0, 0, W, H);
  const d = STYLES[styleKey].draw(level, c, w, pal.brown, ctx);
  const line = (color, width, dash, cap = 'round') => {
    ctx.beginPath(); ctx.moveTo(6, H / 2); ctx.lineTo(W - 6, H / 2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap; ctx.setLineDash(dash ?? []); ctx.stroke();
  };
  line(d.casing?.color ?? c.casing, w + 3, d.casing?.dash, d.casing?.cap);
  line(d.fill?.color ?? c.fill, w, d.fill?.dash, d.fill?.cap);
  for (const o of d.over ?? []) line(o.color, o.width, o.dash, o.cap);
}

const LEVELS = [['paved', 'Paved'], ['unpaved', 'Unpaved'], ['offroad', 'Off-road']];
function updateLegend() {
  if (map.opts.compare) {
    // All styles: one row per level, one small sample per style, numbered like the panels.
    const keys = Object.keys(STYLES);
    $('legend').innerHTML = `<table class="all"><tr><th></th>${keys.map((k) => `<th title="${STYLES[k].name}">${STYLES[k].name.split('.')[0]}</th>`).join('')}</tr>` +
      LEVELS.map(([lv, text]) => `<tr><td>${text}</td>${keys.map((k) => `<td><canvas data-level="${lv}" data-style="${k}"></canvas></td>`).join('')}</tr>`).join('') + '</table>';
    $('legend').querySelectorAll('canvas').forEach((cv) => sample(cv, cv.dataset.style, cv.dataset.level, 38));
    return;
  }
  $('legend').innerHTML = LEVELS.map(([lv, text]) => `<div><canvas data-level="${lv}"></canvas>${text}</div>`).join('');
  $('legend').querySelectorAll('canvas').forEach((cv) => sample(cv, map.opts.style, cv.dataset.level));
}

function updateNote() {
  const st = STYLES[map.opts.style];
  const { z } = map.center();
  // Zoom from which a primary road is wide enough for the style.
  const from = 15 + Math.log2(st.minWidth / 10) / 0.55;
  const w = widthAt(10, z);
  $('note').textContent = map.opts.compare ? 'Side by side: same view, every style, and the map without any unpaved style.' :
    map.opts.bg === 'all' ? `${st.note} Side by side: same view, every background.` :
    `${st.note} Readable from about zoom ${from.toFixed(1)} on primary roads (${st.minWidth} px).`;
  $('status').textContent = `Zoom ${z.toFixed(1)}: primary road ${w.toFixed(1)} px wide${w < st.minWidth && !map.opts.compare ? ', too thin for this style' : ''}.`;
}

// Style chips on the map, and keys 1-4 (A = all side by side): switch style in one click.
function renderChips() {
  const items = [...Object.entries(STYLES).map(([k, v], i) => [k, v.name.replace(/^\d+\.\s*/, ''), String(i + 1)]), ['all', 'All', 'A']];
  $('chips').innerHTML = items.map(([k, label, key]) => {
    const on = k === 'all' ? map.opts.compare : !map.opts.compare && map.opts.style === k;
    return `<button data-style="${k}" aria-pressed="${on}">${label}<kbd>${key}</kbd></button>`;
  }).join('');
}
function pickStyle(k) {
  if (k === 'all') $('compare').checked = true;
  else { $('style').value = k; $('compare').checked = false; }
  $('style').dispatchEvent(new Event('change'));
}
$('chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pickStyle(b.dataset.style); });

// Background chips, bottom right. "All" (every background side by side) only when one style is shown.
function renderBgChips() {
  const items = [...Object.entries(BACKGROUNDS).map(([k, v]) => [k, v.name]), ...(map.opts.compare ? [] : [['all', 'All']])];
  $('bgchips').innerHTML = items.map(([k, label]) => `<button data-bg="${k}" aria-pressed="${map.opts.bg === k}">${label}</button>`).join('');
}
$('bgchips').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) { bg = b.dataset.bg; $('compare').dispatchEvent(new Event('change')); }
});
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const keys = Object.keys(STYLES);
  if (e.key >= '1' && e.key <= String(keys.length)) pickStyle(keys[+e.key - 1]);
  else if (e.key.toLowerCase() === 'a') pickStyle('all');
});

function refresh() {
  if ($('compare').checked && bg === 'all') bg = 'white'; // all styles x all backgrounds would be too many panels
  map.opts = { style: $('style').value, bg, compare: $('compare').checked };
  $('style-box').hidden = map.opts.compare; // the style select means nothing when every style is shown
  map.redraw(); updateLegend(); updateNote(); updateUrl(); renderChips(); renderBgChips();
}
for (const id of ['style', 'compare']) $(id).addEventListener('change', refresh);
$('spot').addEventListener('change', () => { loadSpot($('spot').value); updateUrl(); });

if (params.has('lat')) map.setCenter(+params.get('lat'), +params.get('lon'), +(params.get('z') ?? 15));
else if (params.has('z')) map.view.z = +params.get('z');
await loadSpot($('spot').value);
if (params.has('z') && !params.has('lat')) { const c = map.center(); map.setCenter(c.lat, c.lon, +params.get('z')); }
refresh();
loadLive(); // also when the page opens on a place with no saved spot
window.mapReady = true; // for the screenshot loop
