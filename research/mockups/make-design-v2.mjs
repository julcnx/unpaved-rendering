// Design overview v2 (2026-11-20, Julien): white roads carry the condition on their casing (grey paved, brown
// Unpaved, near black 4WD; Car friendly in a colour of its own), tracks the same colours; main roads with much lighter
// fills under the darker-shade marks (b). Candidates for the Car friendly colour and two fill strengths side by side.
// Usage (from research/): node mockups/make-design-v2.mjs && node mockups/svg2png.mjs mockups/design-overview-v2.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666', LAND = '#fbfaf6';
const UNPAVED = '#b0773a', FOURWD = '#2b190c';
const CF = [['tan', '#c8a070'], ['teal', '#2f8f86'], ['slate blue', '#4a6fb0'], ['mauve', '#9c74b8']];
const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width, dash = null }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${dash ? 'butt' : 'round'}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((n) => n * K).join(' ')}"` : ''}/>`;
const CW = 128, CH = 54, GAP = 7, LW = 250;
const curve = `M10 ${CH - 12} C 40 8, 85 ${CH}, ${CW - 10} 14`;

// ---------- Section 1: minor ways, columns Paved | CF x4 | Unpaved | 4WD ----------
const COLS1 = [['Paved', null], ...CF.map(([n, c]) => [`Car friendly: ${n}`, c]), ['Unpaved', UNPAVED], ['4WD', FOURWD]];
const whiteRoad = (w, grey) => (col) => line(curve, { color: col ?? grey, width: w + 2 }) + line(curve, { color: '#ffffff', width: w });
const track = (col, j) => (col === null ? line(curve, { color: '#8f8f8f', width: 2.5 + 2 / K }) + line(curve, { color: '#ffffff', width: 2.5 })
  : j >= 1 && j <= CF.length ? line(curve, { color: col, width: 2.5 + 2 / K }) + line(curve, { color: '#ffffff', width: 2.5 })
  : line(curve, { color: col, width: 2.5 }));
const single = (col, j) => (col === null ? line(curve, { color: '#8f8f8f', width: 1.75 + 2 / K, dash: [7, 3] }) + line(curve, { color: '#ffffff', width: 1.75, dash: [7, 3] })
  : j >= 1 && j <= CF.length ? line(curve, { color: col, width: 1.75 + 2 / K, dash: [7, 3] }) + line(curve, { color: '#ffffff', width: 1.75, dash: [7, 3] })
  : line(curve, { color: col, width: 1.75, dash: [7, 3] }));
const ROWS1 = [
  ['Track', 'edges: grey paved, colour car friendly; solid brown, near black', track],
  ['Single track', 'same, dashed (car friendly = smooth)', single],
  ['Unclassified, tertiary', 'casing = condition; grey #6f6f6f when paved', (c) => whiteRoad(4.5, '#6f6f6f')(c)],
  ['Residential', 'casing = condition; grey #8f8f8f when paved', (c) => whiteRoad(4, '#8f8f8f')(c)],
];

// ---------- Section 2: main roads, fills now / lighter / much lighter ----------
const MAIN = [['Secondary', '#f4e04a', '#7d7206', 6], ['Primary', '#ef8a1f', '#8a4a08', 6.5], ['Trunk', '#d6336c', '#7a1236', 7]];
const LIGHT = [['High vis 2 (now)', 0], ['lighter (fill 40% toward white)', 0.4], ['much lighter (fill 65% toward white)', 0.65]];
const LEV2 = ['Paved', 'Car friendly', 'Unpaved', '4WD'];
const mainCell = (fill0, casing, w, t, lv) => {
  const fill = mix(fill0, '#ffffff', t), shade = mix(fill0, '#000000', 0.35);
  let o = line(curve, { color: casing, width: w + 2 }) + line(curve, { color: fill, width: w });
  if (lv === 'Car friendly') o += line(curve, { color: shade, width: 1.2 });
  if (lv === 'Unpaved') o += line(curve, { color: shade, width: w * 0.4 });
  if (lv === '4WD') o += line(curve, { color: FOURWD, width: w * 0.4 });
  return o;
};

const W = LW + COLS1.length * (CW + GAP) + 10;
let out = text(10, 26, 'Design v2: white roads with the condition on the casing, Car friendly in its own colour, lighter main roads', 17, 700) +
  text(10, 46, 'Julien, 2026-11-20. High vis 2 widths (1.5 x), z15, proposed land. Pick a Car friendly colour (section 1) and a main-road fill strength (section 2).', 12, 400, MUTED);
let y = 80;
out += text(10, y, 'Minor ways: condition on the casing or edges', 14, 700);
y += 26;
COLS1.forEach(([n], j) => { out += text(LW + j * (CW + GAP) + CW / 2, y, n, 11, 700, INK, 'middle'); });
y += 10;
for (const [label, note, fn] of ROWS1) {
  out += text(10, y + CH / 2, label, 12, 700) + text(10, y + CH / 2 + 15, note, 10, 400, MUTED);
  COLS1.forEach(([, c], j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${fn(c, j)}</g>`; });
  y += CH + GAP;
}
y += 24;
out += text(10, y, 'Main roads: darker shade of the class colour on lighter fills', 14, 700);
y += 26;
LEV2.forEach((n, j) => { out += text(LW + j * (CW + GAP) + CW / 2, y, n, 11, 700, INK, 'middle'); });
y += 10;
for (const [name, fill, casing, w] of MAIN) {
  for (const [lname, t] of LIGHT) {
    out += text(10, y + CH / 2, name, 12, 700) + text(10, y + CH / 2 + 15, lname, 10, 400, MUTED);
    LEV2.forEach((lv, j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${mainCell(fill, casing, w, t, lv)}</g>`; });
    y += CH + GAP;
  }
  y += 6;
}
writeFileSync(new URL('design-overview-v2.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/design-overview-v2.svg');
