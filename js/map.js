// Canvas map: Web Mercator, pan and zoom, roads drawn with the selected unpaved style.
import { classify } from './classify.js';
import { STYLES, palette, roadInfo, RANK, widthAt } from './styles.js';

// Backgrounds: land colour, and whether the map is dark. "terrain" adds hillshade, contours and labels.
export const BACKGROUNDS = {
  white: { name: 'White', land: '#ffffff' },
  forest: { name: 'Forest', land: '#add19e' },
  sand: { name: 'Sand / desert', land: '#e8d6ad' },
  dark: { name: 'Dark', land: '#202124', dark: true },
  terrain: { name: 'Hillshade, contours, labels', land: '#f2efe9', terrain: true },
};

// Tracks and paths: OSM Carto-like, to check that unpaved roads are not confused with them.
const TRACKS = {
  track: { color: '#996600', dark: '#c9a063', width: 1.6, dash: [6, 3] },
  path: { color: '#fa8072', dark: '#e88a7e', width: 1.2, dash: [2, 3] },
  footway: { color: '#fa8072', dark: '#e88a7e', width: 1.2, dash: [2, 3] },
  bridleway: { color: '#008000', dark: '#6fbf6f', width: 1.2, dash: [4, 3] },
  cycleway: { color: '#0000ff', dark: '#7f9fff', width: 1.2, dash: [4, 3] },
};

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
    const z = Math.min(18, Math.max(8, this.view.z + dz));
    const s0 = TILE * 2 ** this.view.z, s1 = TILE * 2 ** z;
    const dx = px - this.canvas.clientWidth / 2, dy = py - this.canvas.clientHeight / 2;
    this.view.x += dx / s0 - dx / s1;
    this.view.y += dy / s0 - dy / s1;
    this.view.z = z;
    this.redraw();
    clearTimeout(this.zoomTimer);
    this.zoomTimer = setTimeout(() => this.onChange?.(), 300);
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
    const styles = this.opts.compare ? Object.keys(STYLES) : [this.opts.style];
    const cols = styles.length > 1 ? 2 : 1, rows = Math.ceil(styles.length / cols);
    const cw = W / cols, ch = H / rows;
    styles.forEach((key, i) => {
      const rect = { x: (i % cols) * cw, y: Math.floor(i / cols) * ch, w: cw, h: ch };
      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
      this.drawPanel(ctx, rect, key);
      if (styles.length > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(rect.x + 8, rect.y + 8, 190, 24);
        ctx.fillStyle = '#222'; ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText(STYLES[key].name, rect.x + 16, rect.y + 25);
        ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
      }
      ctx.restore();
    });
  }

  drawPanel(ctx, rect, styleKey) {
    const bg = BACKGROUNDS[this.opts.bg];
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
    const zf = Math.max(0.6, 2 ** (0.35 * (z - 15)));
    for (const f of all) {
      const t = TRACKS[f.tags.highway];
      if (!t) continue;
      path(f);
      stroke(bg.dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)', (t.width + 2) * zf);
      stroke(bg.dark ? t.dark : t.color, t.width * zf, t.dash.map((d) => d * zf), 'butt');
    }

    // Roads: casings, then fills by rank, then overlays.
    const style = STYLES[styleKey];
    const roads = all.map((f) => {
      const info = roadInfo(f.tags.highway);
      if (!info) return null;
      const c = pal[info[0]], w = widthAt(info[1], z);
      return { f, c, w, rank: RANK.indexOf(f.tags.highway.replace(/_link$/, '')), d: style.draw(f.level, c, w, pal.brown, ctx) };
    }).filter(Boolean).sort((a, b) => a.rank - b.rank);
    for (const r of roads) { path(r.f); stroke(r.c.casing, r.w + Math.max(1, r.w * 0.3), r.d.casing?.dash, r.d.casing?.cap); }
    for (const r of roads) { path(r.f); stroke(r.d.fill?.color ?? r.c.fill, r.w, r.d.fill?.dash, r.d.fill?.cap); }
    for (const r of roads) for (const o of r.d.over ?? []) { path(r.f); stroke(o.color, o.width, o.dash, o.cap ?? 'round'); }
    ctx.setLineDash([]);

    if (bg.terrain) this.drawLabels(ctx, roads, s, ox, oy);
  }

  // Road names at the middle of each named road, with a halo. Simple, horizontal.
  drawLabels(ctx, roads, s, ox, oy) {
    ctx.font = '600 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const done = new Set();
    for (const r of [...roads].reverse()) {
      const label = r.f.tags.ref ?? r.f.tags.name;
      if (!label || done.has(label) || r.f.pts.length < 2) continue;
      done.add(label);
      const [x, y] = r.f.pts[Math.floor(r.f.pts.length / 2)];
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeText(label, x * s + ox, y * s + oy - r.w);
      ctx.fillStyle = '#333'; ctx.fillText(label, x * s + ox, y * s + oy - r.w);
    }
    ctx.textAlign = 'start';
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
    img.onload = () => {
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
        if (px < TILE - 1 && py < TILE - 1 && (Math.floor(h[i + 1] / interval) !== band || Math.floor(h[i + TILE] / interval) !== band)) rgb = [0xc6, 0xa7, 0x7f]; // contour brown
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
