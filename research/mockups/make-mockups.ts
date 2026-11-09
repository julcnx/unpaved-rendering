// Mockups of the styling options on a yellow tertiary road.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage: node mockups/make-mockups.ts   (writes mockups/*.svg)
// Colours are illustrative, close to common OSM styles: each provider uses its own palette.

import { writeFileSync } from 'node:fs';

const LAND = '#f2efe9';
const FILL = '#fdfbb0';
const CASING = '#c6c68a';
const TINT = '#f1df9c';
const TINT_CASING = '#c4b27a';
const BROWN = '#7d5328';
const DARK = '#ebd979'; // darker tint of the class colour, for the dashes
const STATES = ['Paved', 'Unpaved', 'Unpaved + Off-road'] as const;
type State = (typeof STATES)[number];

const CELL_W = 300;
const CELL_H = 70;
const ROAD = 'M 20 35 L 280 35'; // straight, so the patterns are easy to compare

// Regular staggered dots: one tile holds two dots, so rows are offset by half a step.
function dots(id: string, step: number, r: number) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">` +
    `<rect width="${step}" height="${step}" fill="${FILL}"/><g fill="${BROWN}" fill-opacity="0.85">` +
    `<circle cx="${step / 4}" cy="${step / 4}" r="${r}"/><circle cx="${(3 * step) / 4}" cy="${(3 * step) / 4}" r="${r}"/></g></pattern>`;
}

// Same grain everywhere: only the spacing changes.
const DEFS = `<defs>${dots('unpaved', 12, 1.1)}${dots('dense', 7, 1.1)}</defs>`;

const road = (fill: string, casing = CASING, extra = '') =>
  `<path d="${ROAD}" fill="none" stroke="${casing}" stroke-width="15" stroke-linecap="round"/>` +
  `<path d="${ROAD}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round"/>${extra}`;
const DASH = `<path d="${ROAD}" fill="none" stroke="${BROWN}" stroke-width="2.4" stroke-dasharray="9 4"/>`;
// Full-width dashes in a darker tint of the class colour, the usual dashed unpaved style (dash 4, gap 4 in road widths in Americana, here 11 px).
const TINT_DASHES = `<path d="${ROAD}" fill="none" stroke="${DARK}" stroke-width="11" stroke-dasharray="11 11"/>`;
const CENTRE_DOTS = `<path d="${ROAD}" fill="none" stroke="${BROWN}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 7"/>`;

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

type Option = { title: string; note: string; road: (s: State) => string };
const OPTIONS: Record<string, Option> = {
  'tint-dash': {
    title: 'Tint + dash',
    note: 'Unpaved: class colour shifted toward sandy. Off-road mark: brown centre dash on top.',
    road: (s) => unpaved(s) ? road(TINT, TINT_CASING, offroad(s) ? DASH : '') : road(FILL),
  },
  'dashes-dots': {
    title: 'Dashes + dots',
    note: 'Unpaved: dashes in a darker tint of the class colour, the dashed style already in use. Off-road mark: brown centre dots on top.',
    road: (s) => road(FILL, CASING, (unpaved(s) ? TINT_DASHES : '') + (offroad(s) ? CENTRE_DOTS : '')),
  },
  'dots-dense': {
    title: 'Dots + dense dots',
    note: 'Unpaved: regular dots. Off-road mark: tighter dots, same grain.',
    road: (s) => road(offroad(s) ? 'url(#dense)' : unpaved(s) ? 'url(#unpaved)' : FILL),
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
