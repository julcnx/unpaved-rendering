// Mockups of the unpaved styles we keep from the Mind the Surface brief, on red, orange, yellow and white roads.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage: node mockups/make-mockups.ts   (writes mockups/*.svg and mockups/styles.json)
// styles.json is the single source of the style values: the demo (~/Workspaces/OSM/unpaved-rendering) copies it
// with `node scripts/sync-styles.mjs`.
// Road colours are OSM Carto's. The grain fill is based on the OSM Carto grain, the dashed fill on the Americana dashes;
// the Off-road marks are ours (neither style has one).

import { readFileSync, writeFileSync } from 'node:fs';

const LAND = '#f2efe9';
// Per road class (OSM Carto road-colors-generated.mss and roads.mss):
// fill and casing; grain dots (symbols/unpaved/unpaved_<class>-fill.svg) on a background tinted a little toward brown
// (Carto's own background is only a lighter fill); white roads stay white, with warm brown dots instead of Carto's grey; tunnel fill (Carto: lighter fill, darker for white roads);
// dash colour: a slightly darker tint of the class colour, light brown on white roads (grey would look like Carto construction).
type Klass = { name: string; id: string; fill: string; casing: string; grainBg: string; grainDot: string; dash: string; tunnel: string };
// One track rhythm for the line styles (centre line and dashed casing), from OSM Carto tracks scaled to our lines:
// One ladder for roads now and tracks later (Julien's choice, 2026-11-09): Paved solid, Unpaved = long dashes
// (Carto tracktype=grade2, 11, 4), Off-road = medium dashes (grade3, 7, 5), both at about 1.36 x.
// Rougher = more broken, as in Carto's track grades. Not the dash-dot (in Carto: track with no tracktype, unknown),
// not grade4 short sparse dashes (read as dots), not dense short dashes (a tunnel casing, 4, 2).
const RHYTHM = { unpaved: [15, 6], offroad: [9, 7] };
// Dashed fill fills the whole road, so it uses the same rhythm 1.8 x larger, in fill widths (the mockup fill is 11 px).
const xWidth = (d: number[]) => d.map((v) => Math.round((v * 1.8 / 11) * 100) / 100);
const SPEC = {
  // Keys are the demo's road classes; `name` is the mockup label. Motorway is not in the mockups, only in the demo.
  classes: {
    motorway: { name: 'Pink', fill: '#e892a2', casing: '#dc2a67', grainBg: '#ea98a2', grainDot: '#420015', dash: '#dc7c8f', tunnel: '#efb3be' },
    trunk: { name: 'Red', fill: '#f9b29c', casing: '#c84e2f', grainBg: '#f6b598', grainDot: '#511d0f', dash: '#ef9a80', tunnel: '#fbd3c6' },
    primary: { name: 'Orange', fill: '#fcd6a4', casing: '#a06b00', grainBg: '#f6d29c', grainDot: '#563d12', dash: '#f0bd7c', tunnel: '#fde7c9' },
    secondary: { name: 'Yellow', fill: '#f7fabf', casing: '#707d05', grainBg: '#f3efb2', grainDot: '#555a28', dash: '#dfe48a', tunnel: '#fbfdd8' },
    minor: { name: 'White', fill: '#ffffff', casing: '#bbbbbb', grainBg: '#ffffff', grainDot: '#5e4a35', dash: '#dccab0', tunnel: '#f2f2f2' },
  },
  // Widths and dashes in px at the mockup fill width (11 px) unless the name says "x fill width".
  styles: {
    'centre-line': { color: '#8a6440', width: 1.8, narrowWidth: 1, narrowBelow: 6, unpavedDash: RHYTHM.unpaved, offroadDash: RHYTHM.offroad },
    grain: { scale: 1.5, offroadScale: 3, offroadShift: [21, 37] },
    'dashed-fill': { unpavedXWidth: xWidth(RHYTHM.unpaved), offroadXWidth: xWidth(RHYTHM.offroad) },
    // Dashed casing, the fill stays continuous (as Gaia GPS draws tracks and DMD2 unpaved roads).
    // Casing colour for the dashed outline: darker on red and orange (the normal casing is close to the fill),
    // darker on white (OSM Carto tertiary casing), or the dashes fade.
    'dashed-casing': { unpaved: RHYTHM.unpaved, offroad: RHYTHM.offroad, casing: { trunk: '#a33b20', primary: '#7d5400', minor: '#8f8f8f' } },
  },
};
const MOCKUP_CLASSES = ['trunk', 'primary', 'secondary', 'minor'] as const;
const CLASSES: Klass[] = MOCKUP_CLASSES.map((id) => ({ id, ...SPEC.classes[id] }));
const CL = SPEC.styles['centre-line'], GR = SPEC.styles.grain, DA = SPEC.styles['dashed-fill'], GA = SPEC.styles['dashed-casing'];
const BROWN = CL.color; // a bit lighter than a contour-line brown, so it does not read as a third dark line
const TRACK = '#996600'; // OSM Carto @track-fill
const MINOR_CONSTRUCTION = '#aaa'; // OSM Carto @minor-construction
const STATES = ['Paved', 'Unpaved', 'Unpaved + Off-road'] as const;
type State = (typeof STATES)[number];

const CELL_W = 300;
const CELL_H = 70;
const ROAD = 'M 20 35 L 280 35'; // straight, so the patterns are easy to compare
// Fill width and casing (both sides). Two passes: wide (about z16) and narrow (about z12-13, where patterns fail first).
let W = 11;
let CAS = 4;

// OSM Carto grain (CC0): the same 64 px tile for every class, only the two colours change.
// Unpaved: drawn 1.5 x larger than Carto, which is too faint at this size. Off-road: a 3 x larger copy of the dots on top.
const GRAIN = readFileSync(new URL('./carto-unpaved-grain.svg', import.meta.url), 'utf8').match(/<path[^>]*?\sd="([^"]+)"/)![1];
const grain = (c: Klass) =>
  `<pattern id="grain-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="scale(${GR.scale})"><rect width="64" height="64" fill="${c.grainBg}"/><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>` +
  `<pattern id="grain2-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${GR.offroadShift.join(' ')}) scale(${GR.offroadScale})"><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>`;
const DEFS = `<defs>${CLASSES.map(grain).join('')}</defs>`;

const line = (stroke: string, width: number, dash = '', cap = 'butt', extra = '') =>
  `<path d="${ROAD}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra}/>`;
const road = (fill: string, casing: string, extra = '') => line(casing, W + CAS, '') + line(fill, W) + extra;
// Dashed casing: only the outline is broken, the fill stays continuous.
// White roads get a darker casing (OSM Carto tertiary casing), or the dashes vanish into the land.
const gapCasing = (c: Klass) => (GA.casing as Record<string, string>)[c.id] ?? c.casing;
const dashedCasing = (c: Klass, dash: string) => line(gapCasing(c), W + CAS, dash) + line(c.fill, W);

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

// Numbered by preference (ranking 2026-11-09): dashed centre line, dashed casing, grain fill, dashed fill. Brown fill and tint were dropped. Paved is the same normal road in all of them.
type Option = { title: string; note: string; road: (s: State, c: Klass) => string };
const OPTIONS: Record<string, Option> = {
  'centre-line': {
    title: '1. Dashed centre line',
    note: 'Thin brown line down the middle, in OSM Carto track rhythms: long dashes = Unpaved (grade2), medium dashes = Off-road (grade3). Slightly thicker than contour lines.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(BROWN, W < CL.narrowBelow ? CL.narrowWidth : CL.width, (offroad(s) ? CL.offroadDash : CL.unpavedDash).join(' ')) : ''),
  },
  'dashed-casing': {
    title: '2. Dashed casing',
    note: 'Continuous class-coloured fill, dashed outline (as Gaia GPS draws tracks and DMD2 unpaved roads): long dashes = Unpaved, medium dashes = Off-road, the same rhythm as the centre line.',
    road: (s, c) => unpaved(s) ? dashedCasing(c, (offroad(s) ? GA.offroad : GA.unpaved).join(' ')) : road(c.fill, c.casing),
  },
  grain: {
    title: '3. Grain fill',
    note: 'Unpaved: the OSM Carto grain, dark dots in the class hue, 1.5 x larger, on a fill tinted a little toward brown. Off-road: big grain added on top.',
    road: (s, c) => road(unpaved(s) ? `url(#grain-${c.id})` : c.fill, c.casing, offroad(s) ? line(`url(#grain2-${c.id})`, W) : ''),
  },
  'dashed-fill': {
    title: '4. Dashed fill',
    note: 'The shared ladder across the road, in a darker class tint (light brown on white): long dashes = Unpaved, medium dashes = Off-road.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(c.dash, W, (offroad(s) ? DA.offroadXWidth : DA.unpavedXWidth).map((x) => x * W).join(' ')) : ''),
  },
};

// OSM Carto features the styles must not look like, scaled from z16 (construction 8 px wide) to our road width.
// Tunnel: dashed casing 4,2 and a lighter fill.
const k = () => (W + CAS) / 8;
const construction = (colour: string) => line(colour, W + CAS) + line('white', 7 * k(), `${8 * k()} ${6 * k()}`);
const track = () => line('white', (1.5 + 2) * k(), '', 'butt', ' stroke-opacity="0.4"') +
  line(TRACK, 1.5 * k(), [5, 4, 2, 4].map((d) => d * k()).join(' '), 'butt', ' stroke-opacity="0.8"');
const tunnel = (c: Klass) => line(c.casing, W + CAS, `${4 * k()} ${2 * k()}`) + line(c.tunnel, W);
const REFERENCES = () => [
  { label: 'Carto construction', cells: [...CLASSES.slice(0, 3).map((c) => [`${c.name.split(' ')[0]}`, construction(c.fill)]), ['White', construction(MINOR_CONSTRUCTION)]] },
  { label: 'Carto tunnel', cells: CLASSES.map((c) => [c.name, tunnel(c)]) },
  { label: 'Carto track', cells: [
    ['Track', track()],
    ['Track next to a road', road(CLASSES[2].fill, CLASSES[2].casing) + `<g transform="translate(0 ${(W + CAS) / 2 + 3 * k()})">${track()}</g>`],
    ['Dashed centre line, Off-road', OPTIONS['centre-line'].road('Unpaved + Off-road', CLASSES[2])],
    ['Dashed centre line, Off-road on white', OPTIONS['centre-line'].road('Unpaved + Off-road', CLASSES[3])],
  ] },
];

const text = (x: number, y: number, s: string, size = 14, weight = 400, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#333" text-anchor="${anchor}">${s}</text>`;

const box = (x: number, y: number, inner: string) =>
  `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" fill="${LAND}" rx="4"/>${inner}</g>`;

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>\n`;

const out = (name: string, content: string) => writeFileSync(new URL(`./${name}.svg`, import.meta.url), content);

function render(suffix: string) {
  // One option, all states side by side, one row per class: for issues and the wiki.
  for (const [key, option] of Object.entries(OPTIONS)) {
    const w = STATES.length * (CELL_W + 10) + 10;
    const h = CLASSES.length * (CELL_H + 10) + 60;
    const body = STATES.map((s, i) => text(10 + i * (CELL_W + 10) + CELL_W / 2, 30, s, 15, 700, 'middle') +
      CLASSES.map((c, r) => box(10 + i * (CELL_W + 10), 40 + r * (CELL_H + 10), option.road(s, c))).join('')).join('');
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
  const rows = ROWS.map(({ c, s }, r) => text(10, y(r) + CELL_H / 2 + 5, `${c.name}: ${s}`, 14, 700) +
    keys.map((key, i) => box(LABEL_W + i * (CELL_W + 10), y(r), OPTIONS[key].road(s, c))).join('')).join('');
  out(`options-comparison${suffix}`, svg(w, h, header + rows));

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

render('');
W = 5;
CAS = 2;
render('-narrow');

// Style values for the demo, with the titles and notes shown in its menu and legend.
const styles = Object.fromEntries(Object.entries(SPEC.styles).map(([k, v]) => [k, { name: OPTIONS[k].title, note: OPTIONS[k].note, ...v }]));
writeFileSync(new URL('./styles.json', import.meta.url), JSON.stringify({ source: 'osm-wiki/unpaved-rendering/mockups/make-mockups.ts', classes: SPEC.classes, styles }, null, 2) + '\n');
