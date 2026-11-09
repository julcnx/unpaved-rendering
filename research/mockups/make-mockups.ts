// Mockups of the five styles from the Mind the Surface brief, on a yellow tertiary road.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage: node mockups/make-mockups.ts   (writes mockups/*.svg)
// Colours are illustrative, close to common OSM styles: each provider uses its own palette.

import { writeFileSync } from 'node:fs';

const LAND = '#f2efe9';
const FILL = '#fdfbb0';
const CASING = '#c6c68a';
const CLASS_DARK = '#d8c13a'; // stronger class colour, for a class-coloured casing
const BROWN = '#7d5328'; // "not paved" in every style
const SAND = '#c9a06a'; // light brown fill
const TINT = '#efdc98'; // class colour mixed with some brown
const TINT_OFF = '#dcc08a'; // browner
const STATES = ['Paved', 'Unpaved', 'Unpaved + Off-road'] as const;
type State = (typeof STATES)[number];

const CELL_W = 300;
const CELL_H = 70;
const ROAD = 'M 20 35 L 280 35'; // straight, so the patterns are easy to compare

// Regular staggered dots: one tile holds two dots, so rows are offset by half a step.
function dots(id: string, step: number, r: number) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">` +
    `<rect width="${step}" height="${step}" fill="${FILL}"/><g fill="${BROWN}">` +
    `<circle cx="${step / 4}" cy="${step / 4}" r="${r}"/><circle cx="${(3 * step) / 4}" cy="${(3 * step) / 4}" r="${r}"/></g></pattern>`;
}

// Same spacing: Off-road dots are bigger, not denser.
const DEFS = `<defs>${dots('small', 10, 0.9)}${dots('big', 10, 1.8)}</defs>`;

const line = (stroke: string, width: number, dash = '', cap = 'round') =>
  `<path d="${ROAD}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const road = (fill: string, casing = CASING, extra = '', casingDash = '') =>
  line(casing, 15, casingDash, casingDash ? 'butt' : 'round') + line(fill, 11) + extra;

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

// The five styles of the brief, in its order. Paved is the same normal road in all of them.
type Option = { title: string; note: string; road: (s: State) => string };
const OPTIONS: Record<string, Option> = {
  'centre-line': {
    title: '1. Centre line',
    note: 'Thin brown line down the middle: solid = Unpaved, dashed = Off-road. Slightly thicker than contour lines.',
    road: (s) => road(FILL, CASING, unpaved(s) ? line(BROWN, 2.2, offroad(s) ? '6 5' : '', 'butt') : ''),
  },
  'brown-fill': {
    title: '2. Brown fill',
    note: 'Width and class-coloured casing show the class, brown fill shows the surface. Off-road: dashed casing.',
    road: (s) => unpaved(s) ? road(SAND, CLASS_DARK, '', offroad(s) ? '7 4' : '') : road(FILL),
  },
  dots: {
    title: '3. Dots',
    note: 'Faint option for subtle styles: small dots = Unpaved, bigger dots (same spacing) = Off-road.',
    road: (s) => road(offroad(s) ? 'url(#big)' : unpaved(s) ? 'url(#small)' : FILL),
  },
  tint: {
    title: '4. Tint',
    note: 'Class colour mixed with brown, never just darker. Off-road: browner fill and dashed casing.',
    road: (s) => unpaved(s) ? road(offroad(s) ? TINT_OFF : TINT, CASING, '', offroad(s) ? '7 4' : '') : road(FILL),
  },
  dashes: {
    title: '5. Brown dashes',
    note: 'Long brown dashes = Unpaved, short dashes with wide gaps = Off-road. Fallback only: tiring, close to construction.',
    road: (s) => road(FILL, CASING, unpaved(s) ? line(BROWN, 5, offroad(s) ? '4 9' : '14 6', 'butt') : ''),
  },
};

const text = (x: number, y: number, s: string, size = 14, weight = 400, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#333" text-anchor="${anchor}">${s}</text>`;

function cell(option: Option, s: State, x: number, y: number) {
  return `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" fill="${LAND}" rx="4"/>${option.road(s)}</g>`;
}

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>\n`;

// One option, all states side by side: for issues and the wiki.
for (const [key, option] of Object.entries(OPTIONS)) {
  const w = STATES.length * (CELL_W + 10) + 10;
  const h = CELL_H + 70;
  const body = STATES.map((s, i) => cell(option, s, 10 + i * (CELL_W + 10), 40) + text(10 + i * (CELL_W + 10) + CELL_W / 2, 30, s, 15, 700, 'middle')).join('');
  writeFileSync(new URL(`./option-${key}.svg`, import.meta.url), svg(w, h, body + text(10, h - 12, `${option.title}: ${option.note}`, 12)));
}

// All options: rows = states, columns = options.
const LABEL_W = 170;
const keys = Object.keys(OPTIONS);
const w = LABEL_W + keys.length * (CELL_W + 10) + 10;
const h = 40 + STATES.length * (CELL_H + 10) + 10;
const header = keys.map((k, i) => text(LABEL_W + i * (CELL_W + 10) + CELL_W / 2, 26, OPTIONS[k].title, 15, 700, 'middle')).join('');
const rows = STATES.map((s, r) => text(10, 40 + r * (CELL_H + 10) + CELL_H / 2 + 5, s, 14, 700) +
  keys.map((k, i) => cell(OPTIONS[k], s, LABEL_W + i * (CELL_W + 10), 40 + r * (CELL_H + 10))).join('')).join('');
writeFileSync(new URL('./options-comparison.svg', import.meta.url), svg(w, h, header + rows));
