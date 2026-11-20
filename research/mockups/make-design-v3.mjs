// Design v3 (Julien, 2026-11-20): one system everywhere, the outline carries the condition, the fill keeps the class.
// Paved: grey (white roads, tracks) or class (main roads) outline. Car friendly: slate blue. Unpaved: brown. 4WD: near
// black. Main roads: the condition outline thicker (2 dp a side) and the fill 65% toward white when not paved; variant
// with every main road on the light fill. Tracks: white with the condition outline; Unpaved and 4WD tracks solid.
// Usage (from research/): node mockups/make-design-v3.mjs && node mockups/svg2png.mjs mockups/design-overview-v3.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666', LAND = '#fbfaf6';
const CF = '#4a6fb0', UNPAVED = '#b0773a', FOURWD = '#2b190c';
const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width, dash = null }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${dash ? 'butt' : 'round'}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((n) => n * K).join(' ')}"` : ''}/>`;
const CW = 150, CH = 56, GAP = 8, LW = 270;
const curve = `M10 ${CH - 12} C 45 8, 100 ${CH}, ${CW - 10} 14`;
const LEV = [['Paved', null], ['Car friendly', CF], ['Unpaved', UNPAVED], ['4WD', FOURWD]];

const way = (w, fill, edge, edgeW) => line(curve, { color: edge, width: w + 2 * edgeW }) + line(curve, { color: fill, width: w });
const track = (c) => (c === null ? way(2.5, '#ffffff', '#8f8f8f', 1) : c === CF ? way(2.5, '#ffffff', CF, 1) : line(curve, { color: c, width: 2.5 }));
const single = (c) => (c === null || c === CF
  ? line(curve, { color: c ?? '#8f8f8f', width: 1.75 + 2 / K, dash: [7, 3] }) + line(curve, { color: '#ffffff', width: 1.75, dash: [7, 3] })
  : line(curve, { color: c, width: 1.75, dash: [7, 3] }));
const white = (w, grey) => (c) => way(w, '#ffffff', c ?? grey, c ? 1.5 : 1);
const MAIN = [['Secondary', '#f4e04a', '#7d7206', 6], ['Primary', '#ef8a1f', '#8a4a08', 6.5], ['Trunk', '#d6336c', '#7a1236', 7]];
const main = (fill, casing, w, allLight) => (c) => {
  const light = mix(fill, '#ffffff', 0.65);
  if (c === null) return way(w, allLight ? light : fill, casing, 1);
  return way(w - 2, light, c, 2); // same outer width: thicker condition outline, fill inside it
};

const SECTIONS = [
  ['Minor ways', 'white fill; the outline is the condition', [
    ['Track', 'Unpaved and 4WD solid (all outline)', track],
    ['Single track', 'dashed; car friendly = smooth', single],
    ['Unclassified, tertiary', 'paved outline #6f6f6f', white(4.5, '#6f6f6f')],
    ['Residential', 'paved outline #8f8f8f', white(4, '#8f8f8f')],
  ]],
  ['Main roads A: paved saturated', 'not paved: fill 65% toward white, thick condition outline', MAIN.map(([n, f, c, w]) => [n, '', main(f, c, w, false)])],
  ['Main roads B: every main road light', 'paved: light fill with the class outline', MAIN.map(([n, f, c, w]) => [n, '', main(f, c, w, true)])],
];
const W = LW + LEV.length * (CW + GAP) + 10;
let out = text(10, 26, 'Design v3: one system, the outline carries the condition, the fill keeps the class', 17, 700) +
  text(10, 46, 'Paved: grey or class outline. Car friendly: slate blue. Unpaved: brown. 4WD: near black. High vis 2 widths (1.5 x), z15, proposed land.', 12, 400, MUTED);
let y = 86;
LEV.forEach(([n], j) => { out += text(LW + j * (CW + GAP) + CW / 2, y, n, 13, 700, INK, 'middle'); });
y += 14;
for (const [title, sub, rows] of SECTIONS) {
  out += text(10, y + 14, title, 14, 700) + text(10, y + 30, sub, 11, 400, MUTED);
  y += 40;
  for (const [label, note, fn] of rows) {
    out += text(10, y + CH / 2, label, 12, 700) + (note ? text(10, y + CH / 2 + 15, note, 10, 400, MUTED) : '');
    LEV.forEach(([, c], j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${fn(c)}</g>`; });
    y += CH + GAP;
  }
  y += 10;
}
writeFileSync(new URL('design-overview-v3.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/design-overview-v3.svg');
