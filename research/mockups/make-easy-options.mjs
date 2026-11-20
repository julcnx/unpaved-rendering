// Easy level options side by side (2026-11-20): each option with all three levels of its ladder, on tracks, single
// tracks and the band inside each road class, on land, forest and sand. High vis 2 widths (1.5 x) and colours, casing
// B. Columns: the vehicle ladder before 2026-11-20 (Unpaved, High clearance, 4WD), then the confirmed ladder with the
// Easy level in tan, slate blue, purple and mauve (E-tracks 6.4).
// Usage (from research/): node mockups/make-easy-options.mjs && node mockups/svg2png.mjs mockups/easy-options.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666';
const BG = { Land: '#fbfaf6', Forest: '#e2ebd8', Sand: '#f6f1e2' };
const UNPAVED = '#b0773a', FOURWD = '#2b190c', EDGE = '#3d3d3d';
const OPTIONS = [
  { title: 'Before: vehicle ladder', levels: [['Unpaved', UNPAVED], ['High clear.', '#74481f'], ['4WD', FOURWD]] },
  { title: 'Tan', levels: [['Easy', '#c8a070'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
  { title: 'Slate blue', levels: [['Easy', '#4a6fb0'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
  { title: 'Purple', levels: [['Easy', '#8a5aa8'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
  { title: 'Mauve', levels: [['Easy', '#9c74b8'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
  // Adopted 2026-11-20 (Julien): Easy as a shape, dirt always inside. Track = paved track + thin brown centre line;
  // road = class fill + thin brown centre line. Band 40% on every class.
  { title: 'Shape (adopted)', shape: true, levels: [['Easy', 'shape'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
];
// Road classes: fill, casing, width in dp at z15 (before x K), band share of the fill.
const ROADS = {
  'White road (unclassified)': { fill: '#ffffff', casing: '#6f6f6f', w: 4.5, band: 0.4, edge: false },
  'Secondary (yellow)': { fill: '#f4e04a', casing: '#7d7206', w: 6, band: 0.6, edge: true },
  'Primary (orange)': { fill: '#ef8a1f', casing: '#8a4a08', w: 6.5, band: 0.6, edge: true },
  'Trunk (crimson)': { fill: '#d6336c', casing: '#7a1236', w: 7, band: 0.6, edge: true },
};
const ROWS = ['Track', 'Single track', ...Object.keys(ROADS)];

const CELL_W = 300, CELL_H = 58, GAP = 8, LW = 230, TOP = 96;
const SUB = CELL_W / 3;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const curve = (x0) => `M${x0 + 8} ${CELL_H - 12} C ${x0 + 35} 8, ${x0 + 65} ${CELL_H}, ${x0 + SUB - 8} 14`;
const line = (d, { color, width, dash = null, cap = 'round' }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${dash ? 'butt' : cap}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((n) => n * K).join(' ')}"` : ''}/>`;

function draw(row, color, x0, shape = false) {
  const d = curve(x0);
  if (color === 'shape') {
    if (row === 'Track') return line(d, { color: '#8f8f8f', width: 2.5 + 2 / K }) + line(d, { color: '#ffffff', width: 2.5 }) + line(d, { color: UNPAVED, width: 1 / K });
    if (row === 'Single track') return line(d, { color: UNPAVED, width: 1.75, dash: [7, 3] });
    const r = ROADS[row];
    return line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: r.fill, width: r.w }) + line(d, { color: UNPAVED, width: 1 / K });
  }
  if (shape && !['Track', 'Single track'].includes(row)) {
    const r = ROADS[row], bw = r.w * 0.4;
    return line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: r.fill, width: r.w }) + (r.edge ? line(d, { color: EDGE, width: bw + 1.2 / K }) : '') + line(d, { color, width: bw });
  }
  if (row === 'Track') return line(d, { color, width: 2.5 });
  if (row === 'Single track') return line(d, { color, width: 1.75, dash: [7, 3] });
  const r = ROADS[row], bw = Math.max(r.w * r.band, 0.8);
  return line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: r.fill, width: r.w }) +
    (r.edge ? line(d, { color: EDGE, width: bw + 1.2 / K }) : '') + line(d, { color, width: bw });
}

const groups = Object.keys(BG);
const W = LW + OPTIONS.length * (CELL_W + GAP) + 10;
const H = TOP + groups.length * (ROWS.length * (CELL_H + GAP) + 30) + 20;
let out = text(10, 26, 'Easy level options: every ladder level on tracks, single tracks and road bands, on land, forest and sand', 17, 700) +
  text(10, 46, 'High vis 2 colours and widths (1.5 x, phone at density 2). Before = the vehicle ladder until 2026-11-20; the others = the confirmed ladder (Easy = confirmed for a city car).', 12, 400, MUTED);
OPTIONS.forEach((o, j) => {
  const x = LW + j * (CELL_W + GAP);
  out += text(x + CELL_W / 2, TOP - 30, o.title, 14, 700, INK, 'middle');
  o.levels.forEach(([name], k) => { out += text(x + k * SUB + SUB / 2, TOP - 12, name, 11, 400, MUTED, 'middle'); });
});
let y = TOP;
for (const g of groups) {
  out += text(10, y + 14, g, 14, 700);
  y += 22;
  for (const row of ROWS) {
    out += text(10, y + CELL_H / 2 + 4, row, 12);
    OPTIONS.forEach((o, j) => {
      const x = LW + j * (CELL_W + GAP);
      out += `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" rx="4" fill="${BG[g]}"/>` +
        o.levels.map(([, c], k) => draw(row, c, k * SUB, o.shape)).join('') + '</g>';
    });
    y += CELL_H + GAP;
  }
  y += 8;
}
writeFileSync(new URL('easy-options.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/easy-options.svg');
