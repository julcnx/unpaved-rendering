// Mockups of the unpaved styles we keep from the Mind the Surface brief, on red, orange, yellow and white roads.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage (from research/): node mockups/make-mockups.ts   (writes mockups/*.svg and mockups/styles.json), then
// node mockups/svg2png.mjs for the PNGs and python3 mockups/check-colour-blindness.py sheet for the colour-blind sheet.
// styles.json is the single source of the style values: the demo copies it with `node scripts/sync-styles.mjs` (repo root).
// Road colours are OSM Carto's. The grain fill is based on the OSM Carto grain, the dashed fill on the Americana dashes;
// the Off-road marks are ours (neither style has one).

import { readFileSync, writeFileSync } from 'node:fs';
import { dotPoints } from '../../js/styles.js';

let LAND = '#f2efe9';
// Per road class (OSM Carto road-colors-generated.mss and roads.mss):
// fill and casing; grain dots (symbols/unpaved/unpaved_<class>-fill.svg) on a background tinted a little toward brown
// (Carto's own background is only a lighter fill); white roads stay white, with warm brown dots instead of Carto's grey; tunnel fill (Carto: lighter fill, darker for white roads);
// Yellow tints (2026-11-10): hue 58, a little warmer than the fill (63), same contrast steps: at hue 63 the dark steps read as olive green, a different class.
// tintCasing (white only): the casing of a white road whose fill is a tan tint (low zoom, Off-road in styles 1 and 2). The normal light grey casing
// is 1.05 against the tan, so the road lost its outline and nearly vanished on sand (tint 1.06 to 1.27 against the land); OSM Carto tertiary casing.
// White Off-road tints (2026-11-10): a bigger step than the coloured classes (offTint 1.45 over lowTint, offDash 1.8 over the dash) and more saturated.
// A coloured class gains saturation as it darkens; two pale tans at the usual 1.25 to 1.35 were hard to tell apart.
// dash colour (luminance contrast 1.3 or more against the fill, 1.4 on red and orange where the dashes looked soft; same hue): a slightly darker tint of the class colour, light brown on white roads (grey would look like Carto construction).
type Klass = { name: string; id: string; fill: string; casing: string; grainBg: string; grainDot: string; dash: string; tunnel: string; offTint: string; offDash: string; lowTint: string; fullDash: string; tintCasing?: string };
// One track rhythm for the line styles (centre line and dashed casing), from OSM Carto tracks scaled to our lines:
// One ladder for roads now and tracks later (Julien's choice, 2026-11-09): Paved solid, Unpaved = long dashes
// (Carto tracktype=grade2 order), Off-road = medium dashes (grade3 order), with a bigger step than Carto between the
// two so they are easy to tell apart: Unpaved long dashes and short gaps (22/6), Off-road short dashes and gaps a bit
// longer than the dashes (8/9). Limits: Off-road dashes 7 px or more (shorter read as dots), Unpaved gaps 5 px or more
// (shorter look solid at z13-14). Not the dash-dot (in Carto: track with no tracktype), not dense short dashes (tunnel casing).
const RHYTHM = { unpaved: [22, 6], offroad: [8, 9] };
// Dashed fill fills the whole road, so it uses the same rhythm 1.8 x larger, in fill widths (the mockup fill is 11 px).
const xWidth = (d: number[]) => d.map((v) => Math.round((v * 1.8 / 11) * 100) / 100);
const SPEC = {
  // Keys are the demo's road classes; `name` is the mockup label. Motorway is not in the mockups, only in the demo.
  classes: {
    motorway: { name: 'Pink', fill: '#e892a2', casing: '#dc2a67', grainBg: '#ea98a2', grainDot: '#420015', dash: '#da768a', tunnel: '#efb3be', offTint: '#d7697e', offDash: '#d0526b', lowTint: '#dd7f91', fullDash: '#db7b8e' },
    trunk: { name: 'Red', fill: '#f9b29c', casing: '#c84e2f', grainBg: '#f6b598', grainDot: '#511d0f', dash: '#ea8b6e', tunnel: '#fbd3c6', offTint: '#e98667', offDash: '#e3643d', lowTint: '#ed9d84', fullDash: '#ed9980' },
    primary: { name: 'Orange', fill: '#fcd6a4', casing: '#a06b00', grainBg: '#f6d29c', grainDot: '#563d12', dash: '#e9b066', tunnel: '#fde7c9', offTint: '#e8ac61', offDash: '#df8d23', lowTint: '#eec28b', fullDash: '#ecbc7e' },
    secondary: { name: 'Yellow', fill: '#f7fabf', casing: '#707d05', grainBg: '#f3efb2', grainDot: '#3f4318', dash: '#e0dc82', tunnel: '#fbfdd8', offTint: '#d0cb44', offDash: '#c4bf31', lowTint: '#e4e194', fullDash: '#e4e194' },
    minor: { name: 'White', fill: '#ffffff', casing: '#bbbbbb', grainBg: '#ffffff', grainDot: '#46362a', dash: '#dccab0', tunnel: '#f2f2f2', offTint: '#cca979', offDash: '#c18f46', lowTint: '#e2cfb8', fullDash: '#dccab0', tintCasing: '#8f8f8f' },
  },
  // Below this fill width (px) every style draws a plain tint: lowTint for Unpaved, offTint for Off-road (patterns blur there).
  // Main roads (2026-11-15, Julien): the Unpaved tint was 1.20 to 1.25 against the fill and hard to see; now 1.5, as white roads,
  // and Off-road one 1.35 step darker (light mode; low zoom only, so lowTint and offTint keep their other uses). Sheet: main-roads-low-zoom.png.
  lowZoom: { below: 6, main: { unpaved: { trunk: '#eb8261', primary: '#e9a751', secondary: '#d2d059' }, offroad: { trunk: '#e15d34', primary: '#dc8617', secondary: '#bab315' } } },
  // Dark mode (2026-11-10): on a dark map Off-road is the LIGHTER step. Fills from the demo's dark palette, primary more orange
  // (it read brown). Steps measured the same way as in light mode, going lighter: lowTint and offTint 1.25 each, dash 1.3,
  // offDash 1.35 above it, fullDash 1.25. White roads are a warm grey-tan, as the tan of light mode.
  dark: {
    land: '#202124', centreLine: '#d4a46c',
    // On the lighter Off-road fill the centre line and the dashed outline are lighter too, so they keep the contrast they have on Unpaved
    // (line 2.5 to 4.0; outline 1.7 to 2.1, it was 1.05 to 1.3 and vanished).
    centreLineOff: '#f2dcbc', offCasing: { motorway: '#db9dac', trunk: '#d6a28f', primary: '#e0c399', secondary: '#bdc095', minor: '#8f8f94' },
    classes: {
      motorway: { name: 'Pink', fill: '#8f4456', casing: '#c86a82', grainBg: '#8f4456', grainDot: '#d2a2ad', dash: '#ab5167', offTint: '#b56477', offDash: '#ba6d80', lowTint: '#a75065', fullDash: '#a75065', tunnel: '#8f4456' },
      trunk: { name: 'Red', fill: '#8c4d3a', casing: '#c27358', grainBg: '#8c4d3a', grainDot: '#cfa89c', dash: '#a75c45', offTint: '#b76952', offDash: '#bc745e', lowTint: '#a35a44', fullDash: '#a35a44', tunnel: '#8c4d3a' },
      primary: { name: 'Orange', fill: '#956123', casing: '#c8954a', grainBg: '#956123', grainDot: '#d6c1a9', dash: '#b07229', offTint: '#c37f2d', offDash: '#cf8732', lowTint: '#ac7028', fullDash: '#ac7028', tunnel: '#956123' },
      secondary: { name: 'Yellow', fill: '#5e6238', casing: '#93985a', grainBg: '#5e6238', grainDot: '#b1b86c', dash: '#717543', offTint: '#7f844b', offDash: '#878c50', lowTint: '#6e7241', fullDash: '#6e7241', tunnel: '#5e6238' },
      minor: { name: 'White', fill: '#4b4b4f', casing: '#6d6d72', grainBg: '#4b4b4f', grainDot: '#d2c1ac', dash: '#685b4b', offTint: '#776856', offDash: '#7f705c', lowTint: '#655949', fullDash: '#655949', tunnel: '#4b4b4f', tintCasing: '#8f8f94' },
    },
    // Main roads in dark mode (2026-11-16): the light-mode picks with the same contrast steps, going LIGHTER, in the hue of each
    // class's dash. Grain (bigger, on lowTint) and dashed casing (14/8) need no colours of their own. Centre line: the old
    // Off-road cream as the line (3.9 to 4.9 against the fill), as light mode took its old Off-road brown; Off-road near white.
    // Dashed fill 1.8, Off-road a 1.36 step lighter; full width 1.45, then 1.33; low zoom 1.5, then 1.35.
    main: {
      lowZoom: { unpaved: { trunk: '#b4644b', primary: '#bd7b2c', secondary: '#7a7f48' }, offroad: { trunk: '#c2806c', primary: '#d49548', secondary: '#919655' } },
      'centre-line': { color: '#f2dcbc', offColor: '#fff6ea' },
      'dashed-fill': { dash: { trunk: '#bd755e', primary: '#cf8833', secondary: '#888c50' }, offDash: { trunk: '#cb9381', primary: '#dca869', secondary: '#a0a562' } },
      'dashed-fill-full': { dash: { trunk: '#b16249', primary: '#ba792b', secondary: '#777c47' }, offDash: { trunk: '#c07c66', primary: '#d39040', secondary: '#8d9253' } },
    },
  },
  // Main roads (Julien's picks, 2026-11-15): the reader test found 43% of unpaved main roads against 78% of minor roads, so on
  // these classes every style gets a stronger mark, in its `main` block (white roads and motorway unchanged; dark mode colours in dark.main).
  // Each Off-road stays one step darker than the new Unpaved. Mockups: main-roads-*.png (variants), main-roads-picks.png.
  mainRoads: ['trunk', 'primary', 'secondary'],
  // Widths and dashes in px at the mockup fill width (11 px) unless the name says "x fill width".
  styles: {
    // offColor: the line on the darker Off-road fill, darker too, so it keeps the contrast it has on Unpaved (3.6 or more; the normal brown fell to 2.0 on red).
    'centre-line': { color: '#8a6440', offColor: '#5e4126', width: 1.8, narrowWidth: 1, narrowBelow: 6, unpavedDash: RHYTHM.unpaved, offroadDash: RHYTHM.offroad,
      // Main roads (pick B, line narrowed from 30% to 20% on 2026-11-16: 30% outweighed the class colour): a line 20% of the fill in the old Off-road brown; Off-road the same line, darker, on the Off-road tint.
      main: { xWidth: 0.2, color: '#5e4126', offColor: '#382717' } },
    // denseShift: Off-road draws the same grain a second time, shifted, so the dots are twice as dense (same dot size). The dots are
    // already near black and cannot get darker with the fill, as the line and the outline of styles 2 and 4 do.
    grain: { scale: 1.5, denseShift: [32, 32], offroadScale: 3, offroadShift: [21, 37],
      // Main roads (pick C): grain 2.25 x on the low-zoom Unpaved tint (lowTint); Off-road twice as dense on the Off-road tint.
      main: { scale: 2.25, onLowTint: true } },
    'dashed-fill': { unpavedXWidth: xWidth(RHYTHM.unpaved), offroadXWidth: xWidth(RHYTHM.offroad), band: 0.6, bandFromWidth: 6,
      // Main roads (pick A): dash contrast 1.8 against the fill (was 1.3 to 1.4), Off-road 2.45 (a 1.36 step, as before).
      main: { dash: { trunk: '#e56c46', primary: '#e1932d', secondary: '#c3be30' }, offDash: { trunk: '#da4517', primary: '#d47200', secondary: '#aba200' } } },
    // Full width, as Americana draws unpaved roads (and DMD2): same dashes, no band. Lighter Unpaved dash (fullDash, contrast
    // 1.25 against the fill; white keeps the tan dash so it does not fade into the land): full width already covers most of the road.
    // Rhythm kept at 3.6 : 0.98 (2026-11-10): wider gaps (2.4 : 1.2 was tried) make the blocks read as Carto construction, most of all
    // on white roads (tan blocks, white gaps). The cost: a way shorter than one period shows no gap (see options-junction).
    'dashed-fill-full': { unpavedXWidth: xWidth(RHYTHM.unpaved), offroadXWidth: xWidth(RHYTHM.offroad),
      // Main roads (pick A, softened): dash contrast 1.45 (was 1.25; 1.6 left no room for Off-road). Off-road: the class offDash on red
      // and orange (a 1.32 step), darker on yellow (#bcb61c, 1.35; offDash was only 1.23 over the new dash).
      main: { dash: { trunk: '#ec8666', primary: '#ebab58', secondary: '#d5d361' }, offDash: { trunk: '#e3643d', primary: '#df8d23', secondary: '#bcb61c' } } },
    // Dashed casing, the fill stays continuous: the dashed outline of Gaia GPS tracks, with the class kept.
    // Casing colour for the dashed outline: darker on red and orange (the normal casing is close to the fill),
    // darker on white (OSM Carto tertiary casing), or the dashes fade.
    'dashed-casing': { unpaved: RHYTHM.unpaved, offroad: RHYTHM.offroad, casing: { trunk: '#a33b20', primary: '#7d5400', minor: '#8f8f8f' },
      // Outline on the darker Off-road fill: same hue, darker, so it keeps the contrast it has on Unpaved (it fell to 1.8 on white).
      offCasing: { motorway: '#af1d4f', trunk: '#782c18', primary: '#5d3e00', secondary: '#535c04', minor: '#575757' },
      // Unpaved fill on white roads (2026-11-12, Julien): the light tan of the low-zoom tint (minor lowTint), so Unpaved is light tan
      // and Off-road the darker tan (offTint) at every zoom. A white fill with a dashed outline looked like the tracks of AllTrails,
      // OpenCycleMap and Thunderforest on light land, and its dashes nearly vanished on forest (D-examples-visuals, style 4).
      unpavedFill: { minor: '#e2cfb8' },
      // Main roads (pick A): longer gaps in the outline, 14/8 (was 22/6), for Unpaved and Off-road.
      main: { dash: [14, 8] } },
    // Solid dirt, class dots (2026-11-22, Julien; for off-road maps): the whole road in the dirt colour, casing included, with dots
    // in the class colour. Surface first, class second, the reverse of the other five. The dots are saturated, not the Carto fills: those
    // are only 7 to 11 apart on brown for colour-blind readers (CIE76, worst of normal and the three simulations); these 20 or more
    // (motorway 13). The dirt is the same brown as Carto's tracks (#996600, 2.8 apart): not for maps that draw tracks that way.
    // Below lowZoom.below: no dots; dirt core lowCore x the fill, class fill and casing around it.
    'dirt-dots': { unpaved: '#94612f', offroad: '#2a1a0e', dotXWidth: 0.55, dotEveryXWidth: 2.8, lowCore: 0.6,
      dots: { motorway: '#ee86c8', trunk: '#ff7d70', primary: '#ffa633', secondary: '#ffe100', minor: '#ffffff' },
      // Dark map: Off-road is the lighter step, as in the other styles, so its dots are dark.
      dark: { unpaved: '#94612f', offroad: '#d1a068', offDots: { motorway: '#7a2a50', trunk: '#8c3a20', primary: '#7a4a00', secondary: '#5e6238', minor: '#4b4b4f' } } },
  },
};
const MOCKUP_CLASSES = ['trunk', 'primary', 'secondary', 'minor'] as const;
let CLASSES: Klass[] = MOCKUP_CLASSES.map((id) => ({ id, ...SPEC.classes[id] }));
// Mix two #rrggbb colours: t = 0 gives a, t = 1 gives b.
const mix = (a: string, b: string, t: number) => '#' + [1, 3, 5].map((i) =>
  Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
// Tint variant (to compare, 2026-11-10): Off-road keeps the Unpaved pattern and gets a darker class tint in the fill
// (offTint: same hue as the class, luminance contrast 1.35 or more against the fill and 1.3 against the land, 1.5 for white,
// whose tint is tan so it does not melt into the beige land). Grain background to match.
// Dashed fill: the fill stays normal (a dark fill is too heavy) and the dashes get darker (offDash, 1.35 or more against the dash).
const tinted = (c: Klass): Klass => ({ ...c, id: `${c.id}-t`, fill: c.offTint, grainBg: c.offTint, casing: c.tintCasing ?? c.casing });
const tintedDash = (c: Klass): Klass => ({ ...c, dash: c.offDash, fullDash: c.offDash });
const CL = SPEC.styles['centre-line'], GR = SPEC.styles.grain, DA = SPEC.styles['dashed-fill'], DF = SPEC.styles['dashed-fill-full'], GA = SPEC.styles['dashed-casing'];
let BROWN = CL.color; // a bit lighter than a contour-line brown, so it does not read as a third dark line
const TRACK = '#996600'; // OSM Carto @track-fill
const MINOR_CONSTRUCTION = '#aaa'; // OSM Carto @minor-construction
const STATES = ['Paved', 'Unpaved', 'Unpaved + Off-road'] as const;
type State = (typeof STATES)[number];

const CELL_W = 300;
const CELL_H = 70;
let ROAD = 'M 20 35 L 280 35'; // straight, so the patterns are easy to compare
// Fill width and casing (both sides). Two passes: wide (about z16) and narrow (about z12-13, where patterns fail first).
let W = 11;
let CAS = 4;

// OSM Carto grain (CC0): the same 64 px tile for every class, only the two colours change.
// Unpaved: drawn 1.5 x larger than Carto, which is too faint at this size. Off-road: a 3 x larger copy of the dots on top.
const GRAIN = readFileSync(new URL('./carto-unpaved-grain.svg', import.meta.url), 'utf8').match(/<path[^>]*?\sd="([^"]+)"/)![1];
const grain = (c: Klass) =>
  `<pattern id="grain-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="scale(${GR.scale})"><rect width="64" height="64" fill="${c.grainBg}"/><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>` +
  `<pattern id="grainDense-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${GR.denseShift.join(' ')}) scale(${GR.scale})"><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>` +
  `<pattern id="grain2-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${GR.offroadShift.join(' ')}) scale(${GR.offroadScale})"><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>`;
const defs = () => `<defs>${[...CLASSES, ...CLASSES.map(tinted)].map(grain).join('')}</defs>`;
let DEFS = defs();

const line = (stroke: string, width: number, dash = '', cap = 'butt', extra = '') =>
  `<path d="${ROAD}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra}/>`;
const road = (fill: string, casing: string, extra = '') => line(casing, W + CAS, '') + line(fill, W) + extra;
// Dashed casing: only the outline is broken, the fill stays continuous.
// White roads get a darker casing (OSM Carto tertiary casing), or the dashes vanish into the land.
let DARK_MODE = false; // dark map: the outline is the class casing, already lighter than the fill
const isTinted = (c: Klass) => c.id.endsWith('-t'); // Off-road: the darker fill (see tinted())
const gapCasing = (c: Klass) => DARK_MODE ? (isTinted(c) ? (SPEC.dark.offCasing as Record<string, string>)[c.id.replace(/-t$/, '')] : c.casing)
  : (isTinted(c) ? (GA.offCasing as Record<string, string>)[c.id.replace(/-t$/, '')] : (GA.casing as Record<string, string>)[c.id]) ?? c.casing;
// Unpaved white roads: a light tan fill (GA.unpavedFill, light mode only); Off-road is already tinted (see tinted()).
const dashedCasing = (c: Klass, dash: string) => line(gapCasing(c), W + CAS, dash) +
  line(!DARK_MODE && !isTinted(c) ? (GA.unpavedFill as Record<string, string>)[c.id] ?? c.fill : c.fill, W);

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

// Ordered from faint to strong (2026-11-10): grain fill, dashed centre line, dashed fill, dashed casing, dashed fill full width.
// Official Off-road (2026-11-10): the Unpaved pattern, only darker (see official()). Each style's own road() below still draws
// the earlier Off-road, more broken (medium dashes), kept as a backup comparison only. No preference:
// the right one depends on the provider's style. Brown fill and tint were dropped. Paved is the same normal road in all of them.
type Option = { title: string; note: string; road: (s: State, c: Klass) => string };
const OPTIONS: Record<string, Option> = {
  grain: {
    title: '1. Grain fill',
    note: 'Unpaved: the OSM Carto grain, dark dots in the class hue, 1.5 x larger, on a fill tinted a little toward brown (main roads: 2.25 x, on a darker tint). Off-road: the same grain, twice as dense, on a darker tint.',
    road: (s, c) => road(unpaved(s) ? `url(#grain-${c.id})` : c.fill, c.casing, offroad(s) ? line(`url(#grain2-${c.id})`, W) : unpaved(s) && isTinted(c) ? line(`url(#grainDense-${c.id})`, W) : ''),
  },
  'centre-line': {
    title: '2. Dashed centre line',
    note: 'Thin brown line down the middle in long dashes (OSM Carto grade2 rhythm; main roads: wider and darker). Off-road: the same line on a darker tint of the road.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(isTinted(c) ? (DARK_MODE ? SPEC.dark.centreLineOff : CL.offColor) : BROWN, W < CL.narrowBelow ? CL.narrowWidth : CL.width, (offroad(s) ? CL.offroadDash : CL.unpavedDash).join(' ')) : ''),
  },
  'dashed-fill': {
    title: '3. Dashed fill',
    note: 'Long dashes in a darker class tint, in a centred band (as DMD2; light brown on white; darker on main roads). Off-road: the same dashes, darker.',
    // Dashes in a centred band 60% of the road width, so a thin edge of the normal fill stays along both sides: the road reads
    // as one road with a pattern, not as Carto construction (full-width blocks). Full width below 6 px, or the band vanishes.
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(c.dash, W < DA.bandFromWidth ? W : W * DA.band, (offroad(s) ? DA.offroadXWidth : DA.unpavedXWidth).map((x) => x * W).join(' ')) : ''),
  },
  'dashed-casing': {
    title: '4. Dashed casing',
    note: 'Class-coloured fill, outline in long dashes (as Gaia GPS tracks, class kept; longer gaps on main roads); white roads get a light tan fill. Off-road: the same outline on a darker tint.',
    road: (s, c) => unpaved(s) ? dashedCasing(c, (offroad(s) ? GA.offroad : GA.unpaved).join(' ')) : road(c.fill, c.casing),
  },
  'dashed-fill-full': {
    title: '5. Dashed fill, full width',
    note: 'Long dashes in a darker class tint over the whole road width (as Americana; darker on main roads). Off-road: the same dashes, darker.',
    // White roads: the tan dashes cover most of the road, so the casing is the darker tintCasing, as for a tan fill.
    road: (s, c) => road(c.fill, unpaved(s) ? c.tintCasing ?? c.casing : c.casing, unpaved(s) ? line(c.fullDash, W, (offroad(s) ? DF.offroadXWidth : DF.unpavedXWidth).map((x) => x * W).join(' ')) : ''),
  },
  'dirt-dots': {
    title: '6. Solid dirt, class dots',
    note: 'The whole road in brown with dots in the class colour: surface first, for off-road maps. Off-road: near black, same dots.',
    road: (s, c) => dirtDots(s, c),
  },
};

// Solid dirt, class dots: the dirt colour over fill and casing; below the low-zoom limit a dirt core inside the class colours.
const DD = SPEC.styles['dirt-dots'];
// Points of a mockup path (M, L and C commands only), curves sampled; dots as dotPoints in js/styles.js.
const pathPoints = (d: string) => {
  const pts: number[][] = [];
  for (const [, cmd, args] of d.matchAll(/([MLC])([^MLC]*)/g)) {
    const a = args.trim().split(/[\s,]+/).map(Number), q = pts[pts.length - 1];
    if (cmd !== 'C') pts.push(a);
    else for (let i = 1; i <= 50; i++) {
      const t = i / 50, u = 1 - t;
      pts.push([0, 1].map((k) => u ** 3 * q[k] + 3 * u * u * t * a[k] + 3 * u * t * t * a[k + 2] + t ** 3 * a[k + 4]));
    }
  }
  return pts;
};
let PLACED: number[][] | null = null; // dots already in this cell, when several roads share it (junction sheet)
const dirtDots = (s: State, c: Klass) => {
  if (!unpaved(s)) return road(c.fill, c.casing);
  const off = offroad(s), dirt = (DARK_MODE ? DD.dark : DD)[off ? 'offroad' : 'unpaved'];
  if (W < SPEC.lowZoom.below) return road(c.fill, c.casing, line(dirt, W * DD.lowCore));
  const dot = ((DARK_MODE && off ? DD.dark.offDots : DD.dots) as Record<string, string>)[c.id];
  const dots = dotPoints(pathPoints(ROAD), W * DD.dotEveryXWidth, PLACED ?? []);
  return line(dirt, W + CAS) + dots.map(([x, y]: number[]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${W * DD.dotXWidth / 2}" fill="${dot}"/>`).join('');
};

// Official Off-road: the Unpaved pattern, only darker: darker fill (offTint) in the grain fill, centre line and casing,
// darker dashes (offDash) in the two dashed fills.
// Below SPEC.lowZoom.below px of fill width, every style is a plain tint (stepwise contrast 1.2 or more: fill, lowTint, offTint).
// Main roads (SPEC.mainRoads) draw the picks (PICKS below), with the dark.main colours in dark mode; MAIN_PICKS = false gives the reader-test style.
let MAIN_PICKS = true;
const lowMain = (c: Klass) => MAIN_PICKS && (SPEC.mainRoads as string[]).includes(c.id);
const official = (key: string, s: State, c: Klass): string => key === 'dirt-dots' ? dirtDots(s, c) : unpaved(s) && W < SPEC.lowZoom.below
  ? road(lowMain(c) ? ((DARK_MODE ? SPEC.dark.main.lowZoom : SPEC.lowZoom.main) as any)[offroad(s) ? 'offroad' : 'unpaved'][c.id] : offroad(s) ? c.offTint : c.lowTint, c.tintCasing ?? c.casing)
  : unpaved(s) && lowMain(c) ? PICKS[key].road(c, offroad(s))
  : !offroad(s) ? OPTIONS[key].road(s, c)
  : OPTIONS[key].road('Unpaved', key.startsWith('dashed-fill') ? tintedDash(c) : tinted(c));

// OSM Carto features the styles must not look like, scaled from z16 (construction 8 px wide) to our road width.
// Tunnel: dashed casing 4,2 and a lighter fill.
const k = () => (W + CAS) / 8;
const construction = (colour: string) => line(colour, W + CAS) + line('white', 7 * k(), `${8 * k()} ${6 * k()}`);
const track = () => line('white', (1.5 + 2) * k(), '', 'butt', ' stroke-opacity="0.4"') +
  line(TRACK, 1.5 * k(), [5, 4, 2, 4].map((d) => d * k()).join(' '), 'butt', ' stroke-opacity="0.8"');
const tunnel = (c: Klass) => line(c.casing, W + CAS, `${4 * k()} ${2 * k()}`) + line(c.tunnel, W);
const REFERENCES = () => [
  { label: 'Carto construction', cells: [...CLASSES.slice(0, 3).map((c) => [`${c.name.split(' ')[0]}`, construction(c.fill)]), ['White', construction(MINOR_CONSTRUCTION)]] },
  { label: 'Carto tunnel', cells: [...CLASSES.map((c) => [c.name, tunnel(c)]), ['Dashed casing, Unpaved (red)', official('dashed-casing', 'Unpaved', CLASSES[0])]] },
  { label: 'Carto track', cells: [
    ['Track', track()],
    ['Track next to a road', road(CLASSES[2].fill, CLASSES[2].casing) + `<g transform="translate(0 ${(W + CAS) / 2 + 3 * k()})">${track()}</g>`],
    ['Dashed centre line, Off-road', official('centre-line', 'Unpaved + Off-road', CLASSES[2])],
    ['Dashed centre line, Off-road on white', official('centre-line', 'Unpaved + Off-road', CLASSES[3])],
  ] },
];

let INK = '#333', PAGE = '#fff';
const text = (x: number, y: number, s: string, size = 14, weight = 400, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${INK}" text-anchor="${anchor}">${s}</text>`;

const box = (x: number, y: number, inner: string) =>
  `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" fill="${LAND}" rx="4"/>${inner}</g>`;

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${extraDefs.size ? `<defs>${[...extraDefs.values()].join('')}</defs>` : ''}<rect width="${w}" height="${h}" fill="${PAGE}"/>${body}</svg>\n`;

const out = (name: string, content: string) => writeFileSync(new URL(`./${name}.svg`, import.meta.url), content);

function render(suffix: string) {
  // One option, all states side by side, one row per class: for issues and the wiki.
  for (const [key, option] of Object.entries(OPTIONS)) {
    const w = STATES.length * (CELL_W + 10) + 10;
    const h = CLASSES.length * (CELL_H + 10) + 60;
    const body = STATES.map((s, i) => text(10 + i * (CELL_W + 10) + CELL_W / 2, 30, s, 15, 700, 'middle') +
      CLASSES.map((c, r) => box(10 + i * (CELL_W + 10), 40 + r * (CELL_H + 10), official(key, s, c))).join('')).join('');
    out(`option-${key}${suffix}`, svg(w, h, body + text(10, h - 12, `${option.title}: ${option.note}`, 12)));
  }

  // All options: rows = class and state, columns = options.
  const LABEL_W = 290;
  const keys = Object.keys(OPTIONS);
  const ROWS = CLASSES.flatMap((c) => STATES.map((s) => ({ c, s })));
  const w = LABEL_W + keys.length * (CELL_W + 10) + 10;
  const y = (r: number) => 40 + r * (CELL_H + 10);
  const h = y(ROWS.length);
  const header = keys.map((key, i) => text(LABEL_W + i * (CELL_W + 10) + CELL_W / 2, 26, OPTIONS[key].title, 15, 700, 'middle')).join('');
  const grid = (road: (key: string, s: State, c: Klass) => string) => ROWS.map(({ c, s }, r) => text(10, y(r) + CELL_H / 2 + 5, `${c.name}: ${s}`, 14, 700) +
    keys.map((key, i) => box(LABEL_W + i * (CELL_W + 10), y(r), road(key, s, c))).join('')).join('');
  out(`options-comparison${suffix}`, svg(w, h + 30, header + grid(official) +
    text(10, h + 18, (W < SPEC.lowZoom.below ? 'Below 6 px of road width every style is a plain tint: lighter for Unpaved, darker for Off-road (patterns blur there).' : 'Off-road = the Unpaved pattern, only darker: darker fill in styles 1, 2 and 4 (tan on white), darker dashes in styles 3 and 5.'), 13)));
  // Backup only: the earlier Off-road, more broken (medium dashes, big grain).
  out(`options-comparison-broken${suffix}`, svg(w, h + 30, header + grid((key, s, c) => OPTIONS[key].road(s, c)) +
    text(10, h + 18, 'Backup only: the earlier Off-road, more broken (medium dashes; big grain on top in style 1). The official version uses a darker tint.', 13)));

  // OSM Carto features the styles must not look like: own file.
  const refTop = 40;
  const hr = refTop + REFERENCES().length * (CELL_H + 10) + 10;
  const refs = text(10, 26, 'Must not look like (OSM Carto):', 15, 700) + REFERENCES().map((ref, r) => {
    const top = refTop + r * (CELL_H + 10);
    return text(10, top + CELL_H / 2 + 5, ref.label, 14, 700) +
      ref.cells.map(([name, inner], i) => box(LABEL_W + i * (CELL_W + 10), top, inner + text(CELL_W / 2, CELL_H - 8, name, 11, 400, 'middle'))).join('');
  }).join('');
  out(`references${suffix}`, svg(w, hr, refs));
}

// Comparison grid only (used for the dark version).
function renderComparison(suffix: string) {
  const LABEL_W = 290, keys = Object.keys(OPTIONS);
  const ROWS = CLASSES.flatMap((c) => STATES.map((s) => ({ c, s })));
  const w = LABEL_W + keys.length * (CELL_W + 10) + 10, y = (r: number) => 40 + r * (CELL_H + 10), h = y(ROWS.length);
  const header = keys.map((key, i) => text(LABEL_W + i * (CELL_W + 10) + CELL_W / 2, 26, OPTIONS[key].title, 15, 700, 'middle')).join('');
  const rows = ROWS.map(({ c, s }, r) => text(10, y(r) + CELL_H / 2 + 5, `${c.name}: ${s}`, 14, 700) +
    keys.map((key, i) => box(LABEL_W + i * (CELL_W + 10), y(r), official(key, s, c))).join('')).join('');
  out(`options-comparison${suffix}`, svg(w, h + 30, header + rows + text(10, h + 18,
    W < SPEC.lowZoom.below ? 'Dark map, below 6 px: plain tints, Unpaved lighter than the road, Off-road lighter again.'
      : 'Dark map: Off-road = the Unpaved pattern, only LIGHTER (lighter fill, line and outline in styles 1, 2 and 4, lighter dashes in styles 3 and 5).', 13)));
}

// Bend and junction: one road per class going Paved, Unpaved (S-bend), Off-road (bend, then straight), with a white Unpaved
// side road joining in the bend. Straight samples hide what dashes do on curves, at short ways and where the surface changes.
// twoLevels (article figure, 2026-11-13): the last part stays Unpaved, so the sheet shows Paved and Unpaved only;
// the Off-road mark is an optional extension described in text.
function renderJunction(suffix = '', land = LAND, twoLevels = false) {
  const H = 120, LABEL_W = 290, keys = Object.keys(OPTIONS);
  const PARTS: [string, State][] = [['M 15 28 L 75 28', 'Paved'], ['M 75 28 C 120 28 120 70 165 70', 'Unpaved'], ['M 165 70 C 205 70 205 30 240 30 L 285 30', twoLevels ? 'Unpaved' : 'Unpaved + Off-road']];
  const SIDE = 'M 120 112 L 120 49'; // ends on the middle of the S-bend
  const on = (path: string, draw: () => string) => { ROAD = path; return draw(); };
  const cell = (key: string, c: Klass) => {
    PLACED = [];
    const main = PARTS.map(([path, s]) => on(path, () => official(key, s, c))).join(''), side = on(SIDE, () => official(key, 'Unpaved', CLASSES[3]));
    PLACED = null;
    return side + main;
  };
  const straight = ROAD, normalLand = LAND;
  LAND = land;
  const w = LABEL_W + keys.length * (CELL_W + 10) + 10, y = (r: number) => 40 + r * (H + 10), h = y(CLASSES.length);
  const body = keys.map((key, i) => text(LABEL_W + i * (CELL_W + 10) + CELL_W / 2, 26, OPTIONS[key].title, 15, 700, 'middle')).join('') +
    CLASSES.map((c, r) => text(10, y(r) + H / 2 + 5, `${c.name}: Paved, Unpaved${twoLevels ? '' : ', Off-road'}`, 14, 700) + keys.map((key, i) =>
      `<g transform="translate(${LABEL_W + i * (CELL_W + 10)} ${y(r)})"><rect width="${CELL_W}" height="${H}" fill="${LAND}" rx="4"/>${cell(key, c)}</g>`).join('')).join('');
  ROAD = straight; LAND = normalLand;
  out(`options-junction${suffix}`, svg(w, h + 30, body + text(10, h + 18, twoLevels
    ? 'Left to right: Paved, then Unpaved through the S-bend. Side road: white, Unpaved. Each part is its own way, so the dashes restart where the surface changes.'
    : 'Left to right: Paved, Unpaved (S-bend), Off-road. Side road: white, Unpaved. Each part is its own way, so the dashes restart where the surface changes.', 13)));
}

// Main roads (2026-11-15): in the reader test non-mappers found 43% of unpaved main roads against 78% of minor roads
// (research/reader-test/README.md, Results). Variants that make the mark stronger on red, orange and yellow roads only,
// class colour kept; white minor roads stay as they are. Mockups only: nothing here goes into styles.json.
// Luminance contrast (WCAG), as used for every tint step above.
const lum = (h: string) => { const [r, g, b] = [1, 3, 5].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => p - q); return (y + 0.05) / (x + 0.05); };
// The class fill pushed toward its Off-road dash (same hue) until it reaches the target contrast against the fill.
const stronger = (c: Klass, target: number) => { let t = 0; while (t < 2 && contrast(c.fill, mixC(c.fill, c.offDash, t)) < target) t += 0.01; return mixC(c.fill, c.offDash, t); };
const mixC = (a: string, b: string, t: number) => '#' + [1, 3, 5].map((i) => Math.max(0, Math.min(255,
  Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t))).toString(16).padStart(2, '0')).join('');
// Grain patterns at other scales and backgrounds, added to the sheet's own <defs>.
const extraDefs = new Map<string, string>();
// bg '' draws the dots only; shift moves the tile (Off-road: a second, shifted copy doubles the dots).
const grainV = (c: Klass, bg: string, scale: number, shift = [0, 0]) => {
  const id = `grainV-${c.id}-${bg.slice(1)}-${scale}-${shift.join('_')}`;
  extraDefs.set(id, `<pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${shift.join(' ')}) scale(${scale})">${bg ? `<rect width="64" height="64" fill="${bg}"/>` : ''}<path d="${GRAIN}" fill="${c.grainDot}"/></pattern>`);
  return `url(#${id})`;
};
const gap = (c: Klass) => (GA.casing as Record<string, string>)[c.id] ?? c.casing;
// Variants per style, Unpaved only (two levels, as in the reader test). W and CAS are the demo's widths here (see renderMainRoads).
type Variant = { title: string; note: string; road: (c: Klass) => string };
const CURRENT = (key: string): Variant => ({ title: 'Current', note: 'As in the reader test.', road: (c) => official(key, 'Unpaved', c) });
const band = (c: Klass, colour: string, width: number, dash: number[]) => road(c.fill, c.casing, line(colour, width, dash.map((x) => x * W).join(' ')));
const VARIANTS: Record<string, Variant[]> = {
  grain: [CURRENT('grain'),
    { title: 'A. Bigger grain', note: 'Grain 2.25 x (was 1.5 x): bigger, sparser dots.', road: (c) => road(grainV(c, c.grainBg, 2.25), c.casing) },
    { title: 'B. Grain on the tint', note: 'Same grain on the low-zoom Unpaved tint (lowTint).', road: (c) => road(grainV(c, c.lowTint, GR.scale), c.casing) },
    { title: 'C. Bigger, on the tint', note: 'A and B together.', road: (c) => road(grainV(c, c.lowTint, 2.25), c.casing) }],
  'centre-line': [CURRENT('centre-line'),
    { title: 'A. Wider line', note: 'Line 30% of the fill (3 px at z15, was 1.8).', road: (c) => road(c.fill, c.casing, line(BROWN, 0.3 * W, CL.unpavedDash.join(' '))) },
    { title: 'B. Wider, darker', note: 'A in the Off-road brown #5e4126.', road: (c) => road(c.fill, c.casing, line(CL.offColor, 0.3 * W, CL.unpavedDash.join(' '))) },
    { title: 'C. Wider, shorter dashes', note: 'A with dashes 12/6 (was 22/6).', road: (c) => road(c.fill, c.casing, line(BROWN, 0.3 * W, '12 6')) }],
  'dashed-fill': [CURRENT('dashed-fill'),
    { title: 'A. Stronger dash', note: 'Dash contrast 1.8 (was 1.3 to 1.4), band 60%.', road: (c) => band(c, stronger(c, 1.8), W * DA.band, DA.unpavedXWidth) },
    { title: 'B. Stronger, wider band', note: 'A in a band 80% of the fill.', road: (c) => band(c, stronger(c, 1.8), W * 0.8, DA.unpavedXWidth) },
    { title: 'C. Stronger, longer gaps', note: 'A with dashes 2.4 and gaps 1.6 fill widths (was 3.6 / 1).', road: (c) => band(c, stronger(c, 1.8), W * DA.band, [2.4, 1.6]) }],
  'dashed-casing': [CURRENT('dashed-casing'),
    { title: 'A. Longer gaps', note: 'Outline dashes 14/8 (was 22/6).', road: (c) => dashedCasing(c, '14 8') },
    { title: 'B. Longer gaps, thicker', note: 'A with an outline twice as thick.', road: (c) => { const cas = CAS; CAS *= 2; const r = dashedCasing(c, '14 8'); CAS = cas; return r; } },
    { title: 'C. Teeth', note: 'Land-coloured notches (6 every 22 px) cut the outline; middle 60% whole.',
      road: (c) => line(gap(c), W + CAS) + line(c.fill, W) + line(LAND, W + CAS, '6 16') + line(c.fill, W * 0.6) }],
  'dashed-fill-full': [CURRENT('dashed-fill-full'),
    { title: 'A. Stronger dash', note: 'Dash contrast 1.6 (was 1.25).', road: (c) => band(c, stronger(c, 1.6), W, DF.unpavedXWidth) },
    { title: 'B. White gaps (GmapTool)', note: 'Class fill broken by white gaps 0.6 fill widths long every 3.6.', road: (c) => band(c, '#ffffff', W, [0.6, 3]) },
    { title: 'C. Gaps through the casing', note: 'B with land-coloured gaps that cut the casing too.', road: (c) => road(c.fill, c.casing) + line(LAND, W + CAS + 0.5, [0.6, 3].map((x) => x * W).join(' ')) }],
};

// One sheet per style: phone frames of 400 x 520 CSS px (the reader-test size; PNG at 2 x), current style then the variants.
// Each frame: red, orange and yellow main roads, Paved on the left and Unpaved on the right (two ways, so the dashes restart
// at the change), then a white minor road the same way, at z15 (top) and z16 (bottom). Widths as in the demo (js/styles.js:
// trunk and primary 10 px, secondary 9, residential 6 at z15, x 1.46 at z16; casing + 30%).
function renderMainRoads() {
  MAIN_PICKS = false; // "Current" = the reader-test style
  const FW = 400, FH = 520, LABEL = 120, TOP = 50, NOTE = 44;
  const ROWS: [Klass, number, number][] = [];
  for (const [z, y0] of [[15, 34], [16, 296]] as const) {
    const k = 2 ** (0.55 * (z - 15));
    CLASSES.forEach((c, i) => ROWS.push([c, (c.id === 'secondary' ? 9 : c.id === 'minor' ? 6 : 10) * k, y0 + i * 60 + (z === 16 ? i * 6 : 0)]));
  }
  const parts = (y: number): [string, boolean][] => [[`M -20 ${y} L 140 ${y} C 170 ${y} 170 ${y + 12} 200 ${y + 12}`, false],
    [`M 200 ${y + 12} L 250 ${y + 12} C 290 ${y + 12} 290 ${y} 330 ${y} L 420 ${y}`, true]];
  const saved = { W, CAS, ROAD };
  // White minor roads: the current style, unchanged.
  const frame = (key: string, v: Variant) => ROWS.map(([c, w, y]) => {
    W = w; CAS = Math.max(1, 0.3 * w);
    return parts(y).map(([p, unp]) => { ROAD = p; return !unp ? road(c.fill, c.casing) : c.id === 'minor' ? official(key, 'Unpaved', c) : v.road(c); }).join('');
  }).join('');
  for (const [key, variants] of Object.entries(VARIANTS)) {
    const w = LABEL + variants.length * (FW + 10) + 10;
    const refsY = TOP + FH + NOTE + 16, h = refsY + 96;
    const frames = variants.map((v, i) => {
      const x = LABEL + i * (FW + 10);
      return text(x + FW / 2, 30, v.title, 16, 700, 'middle') +
        `<svg x="${x}" y="${TOP}" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}"><rect width="${FW}" height="${FH}" fill="${LAND}"/>${frame(key, v)}</svg>` +
        text(x + 4, TOP + FH + 18, v.note, 12);
    }).join('');
    const labels = ROWS.map(([c, , y], r) => text(10, TOP + y + 10, `${r < 4 ? 'z15' : 'z16'} ${c.name}`, 13, 700)).join('') +
      text(10, TOP + FH + 18, 'Paved | Unpaved', 12);
    // Carto features the marks must not look like, on orange at z15 (white for construction of minor roads is in references.svg).
    W = 10; CAS = 3; ROAD = 'M 10 30 L 290 30';
    const refs = text(10, refsY + 34, 'Must not look like', 13, 700) + [['Carto construction (orange)', construction(CLASSES[1].fill)], ['Carto tunnel (orange)', tunnel(CLASSES[1])],
      ['Carto track', track()]].map(([name, inner], i) => `<g transform="translate(${LABEL + i * 310} ${refsY})"><rect width="300" height="64" fill="${LAND}" rx="4"/>${inner}${text(150, 56, name, 11, 400, 'middle')}</g>`).join('');
    const body = frames + labels + refs;
    out(`main-roads-${key}`, svg(w, h, body));
  }
  ({ W, CAS, ROAD } = saved);
  MAIN_PICKS = true;
  for (const c of CLASSES.slice(0, 3)) console.log(`${c.name}: dashed fill 1.8 ${stronger(c, 1.8)}, full width 1.6 ${stronger(c, 1.6)}`);
}

// Picks (Julien, 2026-11-15): one variant per style, with its Off-road add-on one step darker than the new Unpaved.
// Style 5 softened: its stronger dash (1.6) left no room for a darker Off-road, so Unpaved goes to 1.45 under the current Off-road dash.
const MAIN_LIGHT = Object.fromEntries(Object.entries(SPEC.styles).map(([k, v]) => [k, (v as any).main])) as Record<string, any>;
// Dark mode: the same picks with the dark.main colours.
const MAIN = new Proxy({} as Record<string, any>, { get: (_, k: string) => DARK_MODE ? { ...MAIN_LIGHT[k], ...(SPEC.dark.main as any)[k] } : MAIN_LIGHT[k] });
type Pick = { title: string; unpaved: string; off: string; road: (c: Klass, off: boolean) => string };
const PICKS: Record<string, Pick> = {
  grain: { title: '1. Grain fill: C', unpaved: 'grain 2.25 x on the low-zoom tint', off: 'same grain, twice as dense, on the Off-road tint',
    road: (c, off) => road(grainV(c, off ? c.offTint : c.lowTint, MAIN.grain.scale), c.casing, off ? line(grainV(c, '', MAIN.grain.scale, GR.denseShift), W) : '') },
  'centre-line': { title: '2. Dashed centre line: B', unpaved: `line ${MAIN['centre-line'].xWidth * 100}% of the fill, in the old Off-road colour`, off: 'same line, one step further, on the Off-road tint',
    road: (c, off) => road(off ? c.offTint : c.fill, c.casing, line(off ? MAIN['centre-line'].offColor : MAIN['centre-line'].color, MAIN['centre-line'].xWidth * W, CL.unpavedDash.join(' '))) },
  'dashed-fill': { title: '3. Dashed fill: A', unpaved: 'dash contrast 1.8', off: 'dash contrast 2.45',
    road: (c, off) => band(c, MAIN['dashed-fill'][off ? 'offDash' : 'dash'][c.id], W * DA.band, DA.unpavedXWidth) },
  'dashed-casing': { title: '4. Dashed casing: A', unpaved: 'outline dashes 14/8', off: 'same outline, darker, on the Off-road tint',
    road: (c, off) => dashedCasing(off ? tinted(c) : c, MAIN['dashed-casing'].dash.join(' ')) },
  'dashed-fill-full': { title: '5. Full width: A, softened', unpaved: 'dash contrast 1.45 (A was 1.6)', off: 'a 1.32 to 1.35 step darker',
    road: (c, off) => band(c, MAIN['dashed-fill-full'][off ? 'offDash' : 'dash'][c.id], W, DF.unpavedXWidth) },
};

// One row per style, four frames: current Unpaved, current Off-road, new Unpaved, new Off-road. Same roads and widths as
// main-roads-*.svg, z15 then z16; white roads keep the current style in every frame.
function renderPicks(suffix = '') {
  const current = (key: string, s: State, c: Klass) => { MAIN_PICKS = false; const r = official(key, s, c); MAIN_PICKS = true; return r; };
  const FW = 400, FH = 400, LABEL = 70, TOP = 50, HEAD = 26, RH = HEAD + FH + 40;
  const ROWS: [Klass, number, number][] = [];
  for (const [z, y0] of [[15, 28], [16, 222]] as const) {
    const k = 2 ** (0.55 * (z - 15));
    CLASSES.forEach((c, i) => ROWS.push([c, (c.id === 'secondary' ? 9 : c.id === 'minor' ? 6 : 10) * k, y0 + i * (z === 16 ? 50 : 46)]));
  }
  const parts = (y: number): [string, boolean][] => [[`M -20 ${y} L 140 ${y} C 170 ${y} 170 ${y + 12} 200 ${y + 12}`, false],
    [`M 200 ${y + 12} L 250 ${y + 12} C 290 ${y + 12} 290 ${y} 330 ${y} L 420 ${y}`, true]];
  const COLS: [string, (key: string, c: Klass) => string][] = [
    ['Current Unpaved', (key, c) => current(key, 'Unpaved', c)], ['Current Off-road', (key, c) => current(key, 'Unpaved + Off-road', c)],
    ['New Unpaved', (key, c) => c.id === 'minor' ? official(key, 'Unpaved', c) : PICKS[key].road(c, false)],
    ['New Off-road', (key, c) => c.id === 'minor' ? official(key, 'Unpaved + Off-road', c) : PICKS[key].road(c, true)]];
  const saved = { W, CAS, ROAD };
  const keys = Object.keys(PICKS);
  const body = COLS.map(([t], i) => text(LABEL + i * (FW + 10) + FW / 2, 30, t, 16, 700, 'middle')).join('') + keys.map((key, r) => {
    const y = TOP + r * RH + HEAD;
    return text(10, y - 8, `${PICKS[key].title.replace(': ', ', pick ')}`, 15, 700) +
      ROWS.map(([c, , ry]) => text(10, y + ry + 10, c.name, 11)).join('') +
      COLS.map(([, draw], i) => `<svg x="${LABEL + i * (FW + 10)}" y="${y}" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}"><rect width="${FW}" height="${FH}" fill="${LAND}"/>` +
        ROWS.map(([c, w, ry]) => { W = w; CAS = Math.max(1, 0.3 * w); return parts(ry).map(([p, unp]) => { ROAD = p; return unp ? draw(key, c) : road(c.fill, c.casing); }).join(''); }).join('') + '</svg>').join('') +
      text(LABEL + 2 * (FW + 10) + 4, y + FH + 18, `${PICKS[key].unpaved}  |  Off-road: ${PICKS[key].off}`, 12);
  }).join('');
  const w = LABEL + COLS.length * (FW + 10) + 10, h = TOP + keys.length * RH + 30;
  out(`main-roads-picks${suffix}`, svg(w, h, body +
    text(10, h - 14, 'Red, orange, yellow at z15 (top) and z16 (bottom), white minor roads unchanged; each road Paved on the left. White rows keep the current style.', 12)));
  ({ W, CAS, ROAD } = saved);
  // Contrast check of the spec values: mark against the fill, and the Off-road step over Unpaved.
  for (const c of CLASSES.slice(0, 3)) console.log(`${c.name}: ` + (['dashed-fill', 'dashed-fill-full'] as const).map((k) => { const m = MAIN[k];
    return `${k} ${contrast(c.fill, m.dash[c.id]).toFixed(2)}, Off-road step ${contrast(m.dash[c.id], m.offDash[c.id]).toFixed(2)}`; }).join('; '));
}

// Low-zoom tint on main roads (2026-11-15): under 6 px every style is a plain tint, and on red, orange and yellow the Unpaved
// tint was only 1.20 to 1.25 against the fill (white: 1.52). Now (SPEC.lowZoom.main): Unpaved 1.5 against the fill, as white
// roads, and Off-road one 1.35 step darker. LOW_PROPOSED is the rule the spec values come from.
const darkerStep = (c: Klass, from: string, step: number) => { let t = 0; while (t < 3 && (lum(mixC(c.fill, c.offDash, t)) >= lum(from) || contrast(from, mixC(c.fill, c.offDash, t)) < step)) t += 0.01; return mixC(c.fill, c.offDash, t); };
const LOW_PROPOSED = (c: Klass) => { const unp = stronger(c, 1.5); return { unp, off: darkerStep(c, unp, 1.35) }; };
function renderLowZoom() {
  const FW = 400, FH = 300, LABEL = 70, TOP = 50;
  const ROWS: [Klass, number, number][] = [];
  for (const [z, y0] of [[12, 30], [13, 170]] as const) {
    const k = 2 ** (0.55 * (z - 15));
    CLASSES.forEach((c, i) => ROWS.push([c, (c.id === 'secondary' ? 9 : c.id === 'minor' ? 6 : 10) * k, y0 + i * 30]));
  }
  const PARTS = (y: number): [string, State][] => [[`M -20 ${y} L 130 ${y}`, 'Paved'], [`M 130 ${y} L 270 ${y}`, 'Unpaved'], [`M 270 ${y} L 420 ${y}`, 'Unpaved + Off-road']];
  const COLS: [string, (s: State, c: Klass) => string][] = [
    ['Before', (s, c) => { MAIN_PICKS = false; const r = official('dashed-fill', s, c); MAIN_PICKS = true; return r; }],
    ['Now: Unpaved 1.5, Off-road +1.35', (s, c) => official('dashed-fill', s, c)]];
  const saved = { W, CAS, ROAD };
  const body = COLS.map(([title, draw], i) => { const x = LABEL + i * (FW + 10);
    return text(x + FW / 2, 30, title, 16, 700, 'middle') + `<svg x="${x}" y="${TOP}" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}"><rect width="${FW}" height="${FH}" fill="${LAND}"/>` +
      ROWS.map(([c, w, y]) => { W = w; CAS = Math.max(1, 0.3 * w); return PARTS(y).map(([p, s]) => { ROAD = p; return draw(s, c); }).join(''); }).join('') + '</svg>'; }).join('') +
    ROWS.map(([c, , y], r) => text(10, TOP + y + 4, `${r < 4 ? 'z12' : 'z13'} ${c.name}`, 11)).join('');
  ({ W, CAS, ROAD } = saved);
  out('main-roads-low-zoom', svg(LABEL + COLS.length * (FW + 10) + 10, TOP + FH + 40, body +
    text(10, TOP + FH + 26, 'Each road: Paved, Unpaved, Off-road (left to right). Under 6 px every style draws these tints. White roads unchanged.', 12)));
  // Check: the spec values against the rule (computed by LOW_PROPOSED).
  for (const c of CLASSES.slice(0, 3)) { const t = LOW_PROPOSED(c), m = SPEC.lowZoom.main as any;
    if (t.unp !== m.unpaved[c.id] || t.off !== m.offroad[c.id]) console.log(`${c.name} low zoom: spec ${m.unpaved[c.id]} / ${m.offroad[c.id]}, rule gives ${t.unp} / ${t.off}`); }
}

render('');
renderJunction();
renderJunction('-2levels', LAND, true);
// The same sheet on the demo's forest and sand backgrounds (js/map.js): the tints and browns must hold on green and on beige.
renderJunction('-forest', '#add19e');
renderJunction('-sand', '#e8d6ad');
W = 5;
CAS = 2;
render('-narrow');
renderMainRoads();
renderPicks();
renderLowZoom();

// Dark version: same styles on the dark palette, comparison grids and the main-road picks sheet.
LAND = SPEC.dark.land;
BROWN = SPEC.dark.centreLine;
CLASSES = MOCKUP_CLASSES.map((id) => ({ id, ...(SPEC.dark.classes as any)[id] }));
DEFS = defs();
INK = '#e8e8e8'; PAGE = '#18181a'; DARK_MODE = true;
for (const [w, cas, suffix] of [[11, 4, '-dark'], [5, 2, '-dark-narrow']] as const) { W = w; CAS = cas; renderComparison(suffix); }
renderPicks('-dark');

// Style values for the demo, with the titles and notes shown in its menu and legend.
const styles = Object.fromEntries(Object.entries(SPEC.styles).map(([k, v]) => [k, { name: OPTIONS[k].title, note: OPTIONS[k].note, ...v }]));
writeFileSync(new URL('./styles.json', import.meta.url), JSON.stringify({ source: 'research/mockups/make-mockups.ts', lowZoom: SPEC.lowZoom, mainRoads: SPEC.mainRoads, classes: SPEC.classes, dark: SPEC.dark, styles }, null, 2) + '\n');
