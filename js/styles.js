// Road palettes and the unpaved styles. Each style is one small function that says how to draw
// one road: its casing, its fill, and optional overlays. The map draws all casings first, then
// all fills, then the overlays, so crossings look right.
import { GRAIN_D } from './grain.js';
import SPEC from './style-spec.js';

// Light palette and style values: from the osm-wiki mockups (js/style-spec.js, synced by scripts/sync-styles.mjs).
// Per class: fill and casing (OSM Carto), grain background and dots, dash colour. Dark mode: our own darker variants.
const { motorway, trunk, primary, secondary, minor } = SPEC.classes;
const S = SPEC.styles;
// Dashed casing: a darker outline where the normal casing is too close to the fill (red, orange, white).
const withGapCasing = (key, c) => ({ ...c, gapCasing: S['dashed-casing'].casing[key] });
const LIGHT = {
  motorway: withGapCasing('motorway', motorway), trunk: withGapCasing('trunk', trunk), primary: withGapCasing('primary', primary),
  secondary: withGapCasing('secondary', secondary), minor: withGapCasing('minor', minor),
  brown: S['centre-line'].color,
};
// Dark palette from the mockups too (SPEC.dark): on a dark map Off-road is the lighter step; the dashed outline uses the
// class casing, already lighter than the fill.
const DARK = {
  ...Object.fromEntries(Object.entries(SPEC.dark.classes).map(([k, c]) => [k, { ...c, gapCasing: c.casing }])),
  brown: SPEC.dark.centreLine,
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
const CL = S['centre-line'], GR = S.grain, DA = S['dashed-fill'], GA = S['dashed-casing'], DF = S['dashed-fill-full'];
// Off-road (official, 2026-11-10): the Unpaved pattern, only darker. Darker fill (offTint) in the grain fill, centre line and
// casing; darker dashes (offDash) in the two dashed fills. Dark mode has no measured tints yet: falls back to the dash colour.
const offTint = (c) => c.offTint ?? c.dash;
const offDash = (c) => c.offDash ?? c.casing;
export const STYLES = {
  grain: {
    name: GR.name, note: GR.note, minWidth: 6,
    draw: (level, c, w, brown, ctx) => level === 'paved' ? {} : {
      fill: { color: grain(ctx, off(level) ? offTint(c) : c.grainBg, c.grainDot, GR.scale) },
    },
  },
  'centre-line': {
    name: CL.name, note: CL.note, minWidth: 5,
    draw: (level, c, w, brown) => level === 'paved' ? {} : {
      fill: off(level) ? { color: offTint(c) } : undefined,
      over: [{ color: brown, width: w < CL.narrowBelow ? CL.narrowWidth : CL.width, dash: CL.unpavedDash, cap: 'butt' }],
    },
  },
  'dashed-fill': {
    name: DA.name, note: DA.note, minWidth: 3,
    draw: (level, c, w) => ({
      over: level === 'paved' ? [] : [{ color: off(level) ? offDash(c) : c.dash, width: w < DA.bandFromWidth ? w : w * DA.band, dash: DA.unpavedXWidth.map((x) => x * w), cap: 'butt' }],
    }),
  },
  'dashed-casing': {
    name: GA.name, note: GA.note, minWidth: 3,
    draw: (level, c) => level === 'paved' ? {} : {
      casing: { dash: GA.unpaved, cap: 'butt', color: c.gapCasing },
      fill: off(level) ? { color: offTint(c) } : undefined,
    },
  },
  'dashed-fill-full': {
    name: DF.name, note: DF.note, minWidth: 3,
    draw: (level, c, w) => ({
      over: level === 'paved' ? [] : [{ color: off(level) ? offDash(c) : (c.fullDash ?? c.dash), width: w, dash: DF.unpavedXWidth.map((x) => x * w), cap: 'butt' }],
    }),
  },
};

// Below SPEC.lowZoom.below px of fill width every style is a plain tint (patterns blur there): lowTint for Unpaved,
// offTint for Off-road. Dark mode has no measured tints yet: falls back to the dash colour.
for (const st of Object.values(STYLES)) {
  const draw = st.draw;
  st.draw = (level, c, w, brown, ctx) => level !== 'paved' && w < SPEC.lowZoom.below
    ? { fill: { color: off(level) ? offTint(c) : (c.lowTint ?? c.dash) } }
    : draw(level, c, w, brown, ctx);
}
