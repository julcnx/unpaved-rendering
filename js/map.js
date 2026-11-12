// Canvas map: Web Mercator, pan and zoom, roads drawn with the selected unpaved style.
import { classify } from './classify.js';
import { STYLES, palette, roadInfo, RANK, widthAt, LOW_BELOW } from './styles.js';

// Backgrounds: land colour, and whether the map is dark. "terrain" adds hillshade and contours.
export const BACKGROUNDS = {
  white: { name: 'White', land: '#ffffff' },
  land: { name: 'Carto land', land: '#f2efe9' }, // OSM Carto's plain land colour, no hillshade
  forest: { name: 'Forest', land: '#add19e' },
  sand: { name: 'Sand / desert', land: '#e8d6ad' },
  terrain: { name: 'Hillshade, contours', land: '#f2efe9', terrain: true },
  dark: { name: 'Dark', land: '#202124', dark: true },
};

// Tracks and paths: OSM Carto-like, to check that unpaved roads are not confused with them.
const TRACKS = {
  track: { color: '#996600', dark: '#c9a063', width: 1.6, dash: [6, 3] },
  path: { color: '#fa8072', dark: '#e88a7e', width: 1.2, dash: [2, 3] },
  footway: { color: '#fa8072', dark: '#e88a7e', width: 1.2, dash: [2, 3] },
  bridleway: { color: '#008000', dark: '#6fbf6f', width: 1.2, dash: [4, 3] },
  cycleway: { color: '#0000ff', dark: '#7f9fff', width: 1.2, dash: [4, 3] },
};

// Extra panel in the all-styles grid: no unpaved signal at all.
export const NONE = 'none';

const TILE = 256;
const lonX = (lon) => (lon + 180) / 360;
const latY = (lat) => { const s = Math.sin((lat * Math.PI) / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const xLon = (x) => x * 360 - 180;
const yLat = (y) => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

// A feature keeps its tags, its level and its points in unit Mercator coordinates.
export function prepare(features) {
  return features.map((f) => ({
    tags: f.properties,
    level: classify(f.properties),
    pts: f.geometry.coordinates.map(([lo, la]) => [lonX(lo), latY(la)]),
  }));
}

export class MapView {
  constructor(canvas, onChange) {
    this.canvas = canvas;
    this.onChange = onChange;
    this.layers = new Map(); // key -> prepared features (spots and live areas)
    this.view = { x: 0.5, y: 0.5, z: 15 };
    this.opts = { style: 'centre-line', bg: 'white', compare: false };
    this.terrain = new Map();
    this.bindEvents();
  }

  setCenter(lat, lon, z) { this.view = { x: lonX(lon), y: latY(lat), z }; this.redraw(); }
  center() { return { lat: yLat(this.view.y), lon: xLon(this.view.x), z: this.view.z }; }
  bounds(w = this.canvas.clientWidth, h = this.canvas.clientHeight) {
    const s = TILE * 2 ** this.view.z;
    return { west: xLon(this.view.x - w / 2 / s), east: xLon(this.view.x + w / 2 / s), north: yLat(this.view.y - h / 2 / s), south: yLat(this.view.y + h / 2 / s) };
  }

  bindEvents() {
    let drag = null;
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const s = TILE * 2 ** this.view.z;
      this.view.x -= (e.clientX - drag.x) / s;
      this.view.y -= (e.clientY - drag.y) / s;
      drag = { x: e.clientX, y: e.clientY };
      this.redraw();
    });
    c.addEventListener('pointerup', () => { drag = null; this.onChange?.(); });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = c.getBoundingClientRect();
      this.zoomAt(e.clientX - r.left, e.clientY - r.top, -e.deltaY / 300);
    }, { passive: false });
    window.addEventListener('resize', () => this.redraw());
  }

  // Zoom keeping the point under the cursor fixed.
  zoomAt(px, py, dz) {
    // During a zoom gesture, dashes and grain scale with the map from the zoom where it started (zoomBase), so they do not
    // crawl along the roads; 300 ms after the last step they are redrawn at their normal size.
    this.zoomBase ??= this.view.z;
    const z = Math.min(18, Math.max(8, this.view.z + dz));
    const s0 = TILE * 2 ** this.view.z, s1 = TILE * 2 ** z;
    // Each grid cell centres the view on its own centre: measure from the centre of the cell under the cursor.
    const { w: cw, h: ch } = this.cell ?? { w: this.canvas.clientWidth, h: this.canvas.clientHeight };
    const dx = px - (Math.floor(px / cw) + 0.5) * cw, dy = py - (Math.floor(py / ch) + 0.5) * ch;
    this.view.x += dx / s0 - dx / s1;
    this.view.y += dy / s0 - dy / s1;
    this.view.z = z;
    this.redraw();
    clearTimeout(this.zoomTimer);
    this.zoomTimer = setTimeout(() => { this.zoomBase = null; this.redraw(); this.onChange?.(); }, 300);
  }

  redraw() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  }

  draw() {
    const c = this.canvas, dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; }
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Panels: all styles (plus "No style", everything drawn paved, as most maps today), all backgrounds for one style, or one map.
    const { style, bg, compare } = this.opts;
    const panels = compare ? [...Object.keys(STYLES), NONE].map((s) => ({ style: s, bg: bg === 'all' ? 'white' : bg, label: s === NONE ? '6. No style (all paved)' : STYLES[s].name }))
      : bg === 'all' ? Object.keys(BACKGROUNDS).map((b) => ({ style, bg: b, label: BACKGROUNDS[b].name }))
      : [{ style, bg }];
    // Portrait map (taller than wide): 2 columns, so 6 panels stack as 3 rows (for phone-shaped screenshots).
    const cols = panels.length > 4 && W >= H ? 3 : panels.length > 1 ? 2 : 1, rows = Math.ceil(panels.length / cols);
    const cw = W / cols, ch = H / rows;
    this.cell = { w: cw, h: ch };
    // Fill the whole canvas first, so an empty grid cell (5 backgrounds in 3 x 2) does not show old pixels.
    ctx.fillStyle = BACKGROUNDS[panels[0].bg].land; ctx.fillRect(0, 0, W, H);
    panels.forEach((p, i) => {
      const rect = { x: (i % cols) * cw, y: Math.floor(i / cols) * ch, w: cw, h: ch };
      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
      this.drawPanel(ctx, rect, p.style, p.bg);
      if (panels.length > 1) {
        const ly = rect.y + (rect.y === 0 ? 48 : 8); // top row: below the style chips
        ctx.font = '600 13px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(rect.x + 8, ly, ctx.measureText(p.label).width + 16, 24);
        ctx.fillStyle = '#222'; ctx.fillText(p.label, rect.x + 16, ly + 17);
        ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
      }
      ctx.restore();
    });
  }

  drawPanel(ctx, rect, styleKey, bgKey) {
    const bg = BACKGROUNDS[bgKey];
    const pal = palette(bg.dark);
    const z = this.view.z, s = TILE * 2 ** z;
    const ox = rect.x + rect.w / 2 - this.view.x * s, oy = rect.y + rect.h / 2 - this.view.y * s;
    ctx.fillStyle = bg.land;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (bg.terrain) this.drawTerrain(ctx, rect, s, ox, oy);

    const all = [...this.layers.values()].flat();
    const path = (f) => {
      ctx.beginPath();
      f.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s + ox, y * s + oy) : ctx.moveTo(x * s + ox, y * s + oy)));
    };
    const stroke = (color, width, dash, cap = 'round') => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap; ctx.lineJoin = 'round';
      ctx.setLineDash(dash ?? []); ctx.stroke();
    };

    // Tracks and paths under the roads, with a light halo like OSM Carto.
    // k: how much the map has grown since a zoom gesture started (1 when not zooming); patterns scale with it.
    const zb = this.zoomBase ?? z, k = 2 ** (z - zb);
    const zfAt = (zz) => Math.max(0.6, 2 ** (0.35 * (zz - 15)));
    const zf = zfAt(z), zfDash = zfAt(zb) * k;
    for (const f of all) {
      const t = TRACKS[f.tags.highway];
      if (!t || this.reader) continue;
      path(f);
      stroke(bg.dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', (t.width + 2) * zf);
      stroke(bg.dark ? t.dark : t.color, t.width * zf, t.dash.map((d) => d * zfDash), 'butt');
    }

    // Roads: casings, then fills by rank, then overlays.
    const style = styleKey === NONE ? { draw: () => ({}) } : STYLES[styleKey]; // No style: every road drawn as paved
    // Reader test view (reader=1): no tracks or paths, no road too thin for its style's pattern (it would show the plain
    // low-zoom tint, a second signal), and off-road drawn as unpaved, so only the two base levels show.
    const levelOf = (f) => (this.reader && f.level !== 'paved' ? 'unpaved' : f.level);
    const roads = all.map((f) => {
      const info = roadInfo(f.tags.highway);
      if (!info) return null;
      const c = pal[info[0]], w = widthAt(info[1], z);
      if (this.reader && w < LOW_BELOW) return null;
      const d = style.draw(levelOf(f), c, w, pal.brown, ctx);
      // While zooming: the dash lengths of the start zoom, scaled with the map (same layers only; at the low-zoom
      // threshold the layers differ and the current ones are kept).
      if (k !== 1) {
        const d0 = style.draw(levelOf(f), c, widthAt(info[1], zb), pal.brown, ctx);
        const fix = (a, b) => (a?.dash && b?.dash ? { ...a, dash: b.dash.map((x) => x * k) } : a);
        d.casing = fix(d.casing, d0.casing); d.fill = fix(d.fill, d0.fill);
        if (d.over && d0.over?.length === d.over.length) d.over = d.over.map((o, i) => fix(o, d0.over[i]));
      }
      return { f, c, w, rank: RANK.indexOf(f.tags.highway.replace(/_link$/, '')), d };
    }).filter(Boolean).sort((a, b) => a.rank - b.rank);
    // Grain: anchor the pattern to map coordinates (not to the canvas corner), so it moves with the roads when panning and zooming.
    for (const r of roads) for (const l of [r.d.fill, r.d.casing, ...(r.d.over ?? [])]) {
      const g = l?.color?.grain;
      if (!g) continue;
      const sc = g.scale * k, period = 64 * sc;
      const tx = ((ox % period) + period) % period, ty = ((oy % period) + period) % period;
      l.color.setTransform(new DOMMatrix().translate(tx + g.shift[0] * k, ty + g.shift[1] * k).scale(sc));
    }
    for (const r of roads) { path(r.f); stroke(r.d.casing?.color ?? r.c.casing, r.w + Math.max(1, r.w * 0.3), r.d.casing?.dash, r.d.casing?.cap); }
    for (const r of roads) { path(r.f); stroke(r.d.fill?.color ?? r.c.fill, r.w, r.d.fill?.dash, r.d.fill?.cap); }
    for (const r of roads) for (const o of r.d.over ?? []) { path(r.f); stroke(o.color, o.width, o.dash, o.cap ?? 'round'); }
    ctx.setLineDash([]);
  }

  // Hillshade and contours computed in the browser from Terrarium elevation tiles (AWS Terrain Tiles).
  drawTerrain(ctx, rect, s, ox, oy) {
    const tz = Math.min(14, Math.max(8, Math.round(this.view.z) - 1));
    const n = 2 ** tz, ts = s / n;
    const x0 = Math.floor((rect.x - ox) / ts), x1 = Math.floor((rect.x + rect.w - ox) / ts);
    const y0 = Math.floor((rect.y - oy) / ts), y1 = Math.floor((rect.y + rect.h - oy) / ts);
    for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) {
      if (ty < 0 || ty >= n) continue;
      const img = this.terrainTile(tz, ((tx % n) + n) % n, ty);
      if (img) ctx.drawImage(img, tx * ts + ox, ty * ts + oy, ts + 0.5, ts + 0.5);
    }
  }

  terrainTile(z, x, y) {
    const key = `${z}/${x}/${y}`;
    if (this.terrain.has(key)) return this.terrain.get(key);
    this.terrain.set(key, null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Tiles still loading, for the screenshot loop: it waits for 0 instead of a fixed delay (a slow tile left a blank block).
    window.terrainPending = (window.terrainPending ?? 0) + 1;
    img.onerror = () => { window.terrainPending--; };
    img.onload = () => {
      window.terrainPending--;
      const c = new OffscreenCanvas(TILE, TILE), g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const src = g.getImageData(0, 0, TILE, TILE).data;
      const h = new Float32Array(TILE * TILE);
      for (let i = 0; i < h.length; i++) h[i] = src[i * 4] * 256 + src[i * 4 + 1] + src[i * 4 + 2] / 256 - 32768;
      const out = g.createImageData(TILE, TILE), o = out.data;
      const lat = yLat((y + 0.5) / 2 ** z);
      const m = (40075016 * Math.cos((lat * Math.PI) / 180)) / 2 ** z / TILE; // metres per pixel
      const interval = z >= 13 ? 20 : z >= 11 ? 50 : 100;
      const land = [0xf2, 0xef, 0xe9];
      for (let py = 0; py < TILE; py++) for (let px = 0; px < TILE; px++) {
        const i = py * TILE + px;
        const l = h[py * TILE + Math.max(0, px - 1)], r = h[py * TILE + Math.min(TILE - 1, px + 1)];
        const u = h[Math.max(0, py - 1) * TILE + px], d = h[Math.min(TILE - 1, py + 1) * TILE + px];
        const dx = (r - l) / (2 * m), dy = (d - u) / (2 * m);
        // Light from the north-west, 45 degrees up.
        // Surface normal (-dx, -dy, 1); light vector (-0.5, -0.5, 0.7071) with screen y pointing down.
        const shade = Math.max(0, (0.5 * dx + 0.5 * dy + 0.7071) / Math.sqrt(1 + dx * dx + dy * dy));
        const k = 0.72 + 0.28 * shade;
        let rgb = land.map((v) => v * k);
        const band = Math.floor(h[i] / interval);
        if (px < TILE - 1 && py < TILE - 1 && (Math.floor(h[i + 1] / interval) !== band || Math.floor(h[i + TILE] / interval) !== band)) rgb = rgb.map((v, j) => v * 0.55 + [0xc6, 0xa7, 0x7f][j] * 0.45); // contour brown, half blended so contours stay in the background
        o[i * 4] = rgb[0]; o[i * 4 + 1] = rgb[1]; o[i * 4 + 2] = rgb[2]; o[i * 4 + 3] = 255;
      }
      g.putImageData(out, 0, 0);
      this.terrain.set(key, c);
      this.redraw();
    };
    img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`;
    return null;
  }
}
