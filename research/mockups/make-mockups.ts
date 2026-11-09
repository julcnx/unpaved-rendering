// Mockups of the unpaved styles we keep from the Mind the Surface brief, on red, orange, yellow and white roads.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage: node mockups/make-mockups.ts   (writes mockups/*.svg)
// Road colours are OSM Carto's. Style 2 is based on the OSM Carto grain, style 3 on the Americana dashes;
// the Off-road marks are ours (neither style has one).

import { readFileSync, writeFileSync } from 'node:fs';

const LAND = '#f2efe9';
// Per road class (OSM Carto road-colors-generated.mss and roads.mss):
// fill and casing; grain dots (symbols/unpaved/unpaved_<class>-fill.svg) on a background tinted a little toward brown
// (Carto's own background is only a lighter fill); white roads stay white, with warm brown dots instead of Carto's grey; tunnel fill (Carto: lighter fill, darker for white roads);
// dash colour: a slightly darker tint of the class colour, light brown on white roads (grey would look like Carto construction).
type Klass = { name: string; id: string; fill: string; casing: string; grainBg: string; grainDot: string; dash: string; tunnel: string };
const CLASSES: Klass[] = [
  { name: 'Red', id: 'r', fill: '#f9b29c', casing: '#c84e2f', grainBg: '#f6b598', grainDot: '#511d0f', dash: '#ef9a80', tunnel: '#fbd3c6' },
  { name: 'Orange', id: 'o', fill: '#fcd6a4', casing: '#a06b00', grainBg: '#f6d29c', grainDot: '#563d12', dash: '#f0bd7c', tunnel: '#fde7c9' },
  { name: 'Yellow', id: 'y', fill: '#f7fabf', casing: '#707d05', grainBg: '#f3efb2', grainDot: '#555a28', dash: '#dfe48a', tunnel: '#fbfdd8' },
  { name: 'White', id: 'w', fill: '#ffffff', casing: '#bbbbbb', grainBg: '#ffffff', grainDot: '#5e4a35', dash: '#dccab0', tunnel: '#f2f2f2' },
];
const BROWN = '#8a6440'; // a bit lighter than a contour-line brown, so it does not read as a third dark line
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
  `<pattern id="grain-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)"><rect width="64" height="64" fill="${c.grainBg}"/><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>` +
  `<pattern id="grain2-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(21 37) scale(3)"><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>`;
const DEFS = `<defs>${CLASSES.map(grain).join('')}</defs>`;

const line = (stroke: string, width: number, dash = '', cap = 'butt', extra = '') =>
  `<path d="${ROAD}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra}/>`;
const road = (fill: string, casing: string, extra = '') => line(casing, W + CAS, '') + line(fill, W) + extra;
// Road cut into pieces with see-through gaps: casing and fill share the same dashes.
// White roads get a darker casing (OSM Carto tertiary casing), or the pieces vanish into the land.
const gapCasing = (c: Klass) => (c.id === 'w' ? '#8f8f8f' : c.casing);
const pieces = (c: Klass, dash: string) => line(gapCasing(c), W + CAS, dash) + line(c.fill, W, dash);

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

// From the brief, renumbered (its brown fill and tint styles were dropped: too hard to see). Paved is the same normal road in all of them.
type Option = { title: string; note: string; road: (s: State, c: Klass) => string };
const OPTIONS: Record<string, Option> = {
  'centre-line': {
    title: '1. Centre line',
    note: 'Thin brown line down the middle: solid = Unpaved, dashed = Off-road. Slightly thicker than contour lines.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(BROWN, W < 6 ? 1 : 1.8, offroad(s) ? '6 5' : '') : ''),
  },
  grain: {
    title: '2. Grain (OSM Carto)',
    note: 'Unpaved: the OSM Carto grain, dark dots in the class hue, 1.5 x larger, on a fill tinted a little toward brown. Off-road: big grain added on top.',
    road: (s, c) => road(unpaved(s) ? `url(#grain-${c.id})` : c.fill, c.casing, offroad(s) ? line(`url(#grain2-${c.id})`, W) : ''),
  },
  dashes: {
    title: '3. Dashes',
    note: 'Unpaved: long dashes, dash 3 x and gap 2 x road width (Americana: 4 x and 4 x), darker tint of the class colour (light brown on white). Off-road: dash 2 x, gap 1 x road width.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(c.dash, W, offroad(s) ? `${2 * W} ${W}` : `${3 * W} ${2 * W}`) : ''),
  },
  gaps: {
    title: '4. Open gaps',
    note: 'Road cut into class-coloured pieces with see-through gaps: long pieces = Unpaved; long and short pieces, like the Carto track dash-dot = Off-road.',
    road: (s, c) => unpaved(s) ? pieces(c, offroad(s) ? '26 6 6 6' : '36 8') : road(c.fill, c.casing),
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
  { label: 'Carto tunnel', cells: CLASSES.map((c) => [c.name.split(' ')[0], tunnel(c)]) },
  { label: 'Carto track', cells: [['Track', track()]] },
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
