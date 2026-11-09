// Road palettes and the unpaved styles. Each style is one small function that says how to draw
// one road: its casing, its fill, and optional overlays. The map draws all casings first, then
// all fills, then the overlays, so crossings look right.
import { GRAIN_D } from './grain.js';

// Per class: fill and casing (OSM Carto), grain colours (Carto symbols/unpaved), dash colour
// (Americana: light tint on trunk, grey on other classes). Dark mode: our own darker variants.
const LIGHT = {
  motorway: { fill: '#e892a2', casing: '#dc2a67', grainBg: '#f2a3b2', grainDot: '#561428', dash: '#f6c9d1' },
  trunk: { fill: '#f9b29c', casing: '#c84e2f', grainBg: '#ffbda6', grainDot: '#511d0f', dash: '#fdd9cd' },
  primary: { fill: '#fcd6a4', casing: '#a06b00', grainBg: '#ffe1af', grainDot: '#563d12', dash: '#cccccc' },
  secondary: { fill: '#f7fabf', casing: '#707d05', grainBg: '#ffffca', grainDot: '#555a28', dash: '#cccccc' },
  minor: { fill: '#ffffff', casing: '#bbbbbb', grainBg: '#ffffff', grainDot: '#5e5e5e', dash: '#cccccc' },
  brown: '#7d5328',
};
const DARK = {
  motorway: { fill: '#8f4456', casing: '#c86a82', grainBg: '#8f4456', grainDot: '#f2c4cf', dash: '#b56b7d' },
  trunk: { fill: '#8c4d3a', casing: '#c27358', grainBg: '#8c4d3a', grainDot: '#f6cdbd', dash: '#b37360' },
  primary: { fill: '#7c6236', casing: '#b08c4c', grainBg: '#7c6236', grainDot: '#f2dcb4', dash: '#a3895d' },
  secondary: { fill: '#5e6238', casing: '#93985a', grainBg: '#5e6238', grainDot: '#eef0c4', dash: '#868a5d' },
  minor: { fill: '#4b4b4f', casing: '#6d6d72', grainBg: '#4b4b4f', grainDot: '#e2e2e2', dash: '#78787c' },
  brown: '#d4a46c',
};
export const palette = (dark) => (dark ? DARK : LIGHT);

// highway=* to palette class, and fill width in px at z15 (close to OSM Carto).
const ROAD = {
  motorway: ['motorway', 10], trunk: ['trunk', 10], primary: ['primary', 10], secondary: ['secondary', 9],
  tertiary: ['minor', 8], unclassified: ['minor', 6], residential: ['minor', 6], living_street: ['minor', 5],
  road: ['minor', 5], service: ['minor', 3.5],
};
export const roadInfo = (highway) => ROAD[highway?.replace(/_link$/, '')] ?? null;
export const RANK = ['service', 'road', 'living_street', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk', 'motorway'];
export const widthAt = (base, z) => base * 2 ** (0.55 * (z - 15));

// Grain patterns are built once per colour pair: the same 64 px tile, two colours.
const grainCache = new Map();
function grain(ctx, bg, dot, shifted = false) {
  const key = `${bg}|${dot}|${shifted}`;
  if (!grainCache.has(key)) {
    const c = new OffscreenCanvas(64, 64);
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, 64, 64); }
    g.fillStyle = dot;
    g.fill(new Path2D(GRAIN_D));
    const p = ctx.createPattern(c, 'repeat');
    if (shifted) p.setTransform(new DOMMatrix().translate(21, 37)); // Off-road: a second copy of the dots, offset
    grainCache.set(key, p);
  }
  return grainCache.get(key);
}

const off = (level) => level === 'offroad' || level === 'specialized';

// Each style: (level, class colours, fill width w, brown, ctx) -> { casing, fill, over[] }.
// A layer is { color, width, dash?, cap? }. Paved roads are the same in every style.
export const STYLES = {
  'centre-line': {
    name: '1. Centre line',
    note: 'Thin brown line down the middle: solid = Unpaved, dashed = Off-road.',
    minWidth: 5,
    draw: (level, c, w, brown) => ({
      over: level === 'paved' ? [] : [{ color: brown, width: Math.max(1.2, w * 0.2), dash: off(level) ? [w * 0.55, w * 0.45] : null, cap: 'butt' }],
    }),
  },
  grain: {
    name: '3. Grain (OSM Carto)',
    note: 'OSM Carto grain: dark dots in the class hue. Off-road: twice as dense.',
    minWidth: 6,
    draw: (level, c, w, brown, ctx) => level === 'paved' ? {} : {
      fill: { color: grain(ctx, c.grainBg, c.grainDot) },
      over: off(level) ? [{ color: grain(ctx, null, c.grainDot, true), width: w }] : [],
    },
  },
  dashes: {
    name: '5. Dashes (Americana)',
    note: 'Americana light dashes, 4 road widths long. Off-road: short dashes, 1 road width.',
    minWidth: 3,
    draw: (level, c, w) => ({
      over: level === 'paved' ? [] : [{ color: c.dash, width: w, dash: off(level) ? [w, w] : [4 * w, 4 * w], cap: 'butt' }],
    }),
  },
  gaps: {
    name: '6. Open gaps',
    note: 'Road cut into class-coloured pieces with see-through gaps: few gaps = Unpaved, many = Off-road.',
    minWidth: 3,
    draw: (level, c, w) => {
      if (level === 'paved') return {};
      const dash = off(level) ? [w * 1.1, w * 0.45] : [w * 3.6, w * 0.45];
      return { casing: { dash, cap: 'butt' }, fill: { dash, cap: 'butt' } };
    },
  },
};
