// Road palettes and the unpaved styles. Each style is one small function that says how to draw
// one road: its casing, its fill, and optional overlays. The map draws all casings first, then
// all fills, then the overlays, so crossings look right.
import { GRAIN_D } from './grain.js';
import SPEC from './style-spec.js';

// Light palette and style values: from the osm-wiki mockups (js/style-spec.js, synced by scripts/sync-styles.mjs).
// Per class: fill and casing (OSM Carto), grain background and dots, dash colour. Dark mode: our own darker variants.
const { motorway, trunk, primary, secondary, minor } = SPEC.classes;
const S = SPEC.styles;
const LIGHT = {
  motorway, trunk, primary, secondary,
  minor: { ...minor, gapCasing: S.gaps.minorCasing }, // open gaps: a darker casing, or white pieces vanish into the land
  brown: S['centre-line'].color,
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

// Grain patterns are built once per colour pair and scale: the same 64 px OSM Carto tile, two colours.
const grainCache = new Map();
function grain(ctx, bg, dot, scale, shift = [0, 0]) {
  const key = `${bg}|${dot}|${scale}|${shift}`;
  if (!grainCache.has(key)) {
    const c = new OffscreenCanvas(64, 64);
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, 64, 64); }
    g.fillStyle = dot;
    g.fill(new Path2D(GRAIN_D));
    const p = ctx.createPattern(c, 'repeat');
    p.setTransform(new DOMMatrix().translate(...shift).scale(scale));
    grainCache.set(key, p);
  }
  return grainCache.get(key);
}

const off = (level) => level === 'offroad' || level === 'specialized';

// Each style: (level, class colours, fill width w, brown, ctx) -> { casing, fill, over[] }.
// A layer is { color, width, dash?, cap? }. Paved roads are the same in every style.
const CL = S['centre-line'], GR = S.grain, DA = S.dashes, GA = S.gaps;
export const STYLES = {
  'centre-line': {
    name: CL.name, note: CL.note, minWidth: 5,
    draw: (level, c, w, brown) => ({
      over: level === 'paved' ? [] : [{ color: brown, width: w < CL.narrowBelow ? CL.narrowWidth : CL.width, dash: off(level) ? CL.offroadDash : CL.unpavedDash, cap: 'butt' }],
    }),
  },
  grain: {
    name: GR.name, note: GR.note, minWidth: 6,
    draw: (level, c, w, brown, ctx) => level === 'paved' ? {} : {
      fill: { color: grain(ctx, c.grainBg, c.grainDot, GR.scale) },
      over: off(level) ? [{ color: grain(ctx, null, c.grainDot, GR.offroadScale, GR.offroadShift), width: w, cap: 'butt' }] : [],
    },
  },
  dashes: {
    name: DA.name, note: DA.note, minWidth: 3,
    draw: (level, c, w) => ({
      over: level === 'paved' ? [] : [{ color: c.dash, width: w, dash: (off(level) ? DA.offroadXWidth : DA.unpavedXWidth).map((x) => x * w), cap: 'butt' }],
    }),
  },
  gaps: {
    name: GA.name, note: GA.note, minWidth: 3,
    draw: (level, c) => {
      if (level === 'paved') return {};
      const dash = off(level) ? GA.offroad : GA.unpaved;
      return { casing: { dash, cap: 'butt', color: c.gapCasing }, fill: { dash, cap: 'butt' } };
    },
  },
};
