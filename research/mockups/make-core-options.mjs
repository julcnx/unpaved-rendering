// Main roads, Julien's idea (2026-11-21): when not paved, the condition colour as a thick casing and the class colour
// as an inner band (the core). Three core widths, a paved-to-unpaved transition along one road, land and forest.
// Condition colours as in the outline system: Car friendly slate blue, Unpaved brown, 4WD near black.
// Usage (from research/): node mockups/make-core-options.mjs && node mockups/svg2png.mjs mockups/core-options.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666';
const BG = { Land: '#fbfaf6', Forest: '#e2ebd8' };
const CF = '#4a6fb0', UNPAVED = '#b0773a', FOURWD = '#2b190c';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width, cap = 'round' }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
const CW = 150, CH = 56, GAP = 8, LW = 230;
const curve = `M10 ${CH - 12} C 45 8, 100 ${CH}, ${CW - 10} 14`;
// Transition cell: a straight road, paved on the left half, unpaved on the right.
const left = `M10 ${CH / 2} L${CW / 2} ${CH / 2}`, right = `M${CW / 2} ${CH / 2} L${CW - 10} ${CH / 2}`;
const MAIN = [['Secondary', '#f4e04a', '#7d7206', 6], ['Primary', '#ef8a1f', '#8a4a08', 6.5], ['Trunk', '#d6336c', '#7a1236', 7]];
const LEV = [['Paved', null], ['Car friendly', CF], ['Unpaved', UNPAVED], ['4WD', FOURWD], ['Paved → Unpaved', 'transition']];

// A road of total width w + 2 (casing included). Paved: class casing 1 dp a side. Not paved: the condition colour over
// the whole width, the class fill as a core of share `core` of w.
const paved = (d, fill, casing, w) => line(d, { color: casing, width: w + 2 }) + line(d, { color: fill, width: w });
const dirt = (d, fill, cond, w, core) => line(d, { color: cond, width: w + 2 }) + line(d, { color: fill, width: w * core });
const cell = (fill, casing, w, core, c) => {
  if (c === null) return paved(curve, fill, casing, w);
  if (c === 'transition') return paved(left, fill, casing, w) + dirt(right, fill, UNPAVED, w, core);
  return dirt(curve, fill, c, w, core);
};
// White road in the outline system (v3), for comparison.
const white = (c) => {
  if (c === 'transition') return line(left, { color: '#6f6f6f', width: 6.5 }) + line(left, { color: '#fff', width: 4.5 }) + line(right, { color: UNPAVED, width: 7.5 }) + line(right, { color: '#fff', width: 4.5 });
  return line(curve, { color: c ?? '#6f6f6f', width: c ? 7.5 : 6.5 }) + line(curve, { color: '#fff', width: 4.5 });
};
const CORES = [[0.4, 'core 40%'], [0.55, 'core 55%'], [0.7, 'core 70%']];

const W = LW + LEV.length * (CW + GAP) + 10;
let out = text(10, 26, 'Main roads: condition colour as a thick casing, class colour as the core', 17, 700) +
  text(10, 46, 'Julien, 2026-11-21. Car friendly slate blue, Unpaved brown, 4WD near black; paved roads unchanged. Three core widths. High vis 2 colours, 1.5 x, z15.', 12, 400, MUTED);
let y = 84;
LEV.forEach(([n], j) => { out += text(LW + j * (CW + GAP) + CW / 2, y, n, 12, 700, INK, 'middle'); });
y += 12;
for (const [bgName, bg] of Object.entries(BG)) {
  for (const [core, cname] of CORES) {
    out += text(10, y + 16, `${cname} (${bgName.toLowerCase()})`, 14, 700);
    y += 24;
    for (const [name, fill, casing, w] of MAIN) {
      out += text(10, y + CH / 2 + 4, name, 12);
      LEV.forEach(([, c], j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${bg}"/>${cell(fill, casing, w, core, c)}</g>`; });
      y += CH + GAP;
    }
    y += 8;
  }
  out += text(10, y + 16, `For comparison: white road, outline system (${bgName.toLowerCase()})`, 14, 700);
  y += 24;
  out += text(10, y + CH / 2 + 4, 'Unclassified', 12);
  LEV.forEach(([, c], j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${bg}"/>${white(c)}</g>`; });
  y += CH + GAP + 14;
}
writeFileSync(new URL('core-options.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/core-options.svg');
