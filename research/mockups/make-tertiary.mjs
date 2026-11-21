// Tertiary in iD's pale yellow (2026-11-21): can it take design #11 (condition outline, white gap, class core)?
// (a) #11 with the pale yellow core; (b) #11 with a stronger yellow core; (c) light classes without the white gap: the
// pale yellow fill plays the white, the condition outline around it (as white roads, tinted). Secondary and unclassified
// for comparison. High vis 2 colours, 1.5 x, z15, proposed land.
// Usage (from research/): node mockups/make-tertiary.mjs && node mockups/svg2png.mjs mockups/tertiary-options.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666', LAND = '#fbfaf6';
const CF = '#4a6fb0', UNPAVED = '#b0773a', FOURWD = '#2b190c';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width }) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="round" stroke-linejoin="round"/>`;
const CH = 56, TW = 280, CW = 160, GAP = 8, LW = 330;
const tL = `M12 ${CH / 2} L${TW / 2} ${CH / 2}`, tR = `M${TW / 2} ${CH / 2} L${TW - 12} ${CH / 2}`;
const curve = `M10 ${CH - 12} C 50 8, 110 ${CH}, ${CW - 10} 14`;
const COND = { cf: CF, unp: UNPAVED, fwd: FOURWD };

const TER = { fill: '#fff9b3', casing: '#a39a3a', w: 6 }; // iD's tertiary; casing an olive between secondary's and grey
const SEC = { fill: '#f4e04a', casing: '#7d7206', w: 6 };
const paved = (r) => (d) => line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: r.fill, width: r.w });
const gapCore = (r, core) => (d, c) => line(d, { color: COND[c], width: r.w + 3 }) + line(d, { color: '#ffffff', width: r.w }) + line(d, { color: core, width: r.w * 0.55 });
const outlineOnFill = (r) => (d, c) => line(d, { color: COND[c], width: r.w + 3 }) + line(d, { color: r.fill, width: r.w });
const ROWS = [
  ['Secondary, #11 (reference)', 'yellow core in a white gap', paved(SEC), gapCore(SEC, SEC.fill)],
  ['Tertiary (a): #11, pale core', "iD's #fff9b3 core in a white gap", paved(TER), gapCore(TER, TER.fill)],
  ['Tertiary (b): #11, stronger core', 'core #f6e878 in a white gap', paved(TER), gapCore(TER, '#f6e878')],
  ['Tertiary (c): outline on the pale fill', 'no white gap; the pale yellow plays the white', paved(TER), outlineOnFill(TER)],
  ['Tertiary (d): (c) with a grey paved edge', 'paved: pale yellow, dark grey edge #6f6f6f, as unclassified', paved({ ...TER, casing: '#6f6f6f' }), outlineOnFill(TER)],
  ['Unclassified (reference)', 'white, outline system, 5.5 dp', paved({ fill: '#ffffff', casing: '#6f6f6f', w: 5.5 }), outlineOnFill({ fill: '#ffffff', w: 5.5 })],
];
const W = LW + TW + 3 * (CW + GAP) + 20;
let out = text(10, 26, 'Tertiary in pale yellow: does design #11 work, or does it need the outline on its own fill?', 17, 700) +
  text(10, 46, "iD's tertiary #fff9b3 is almost white (contrast 1.06), so a pale core in a white gap may vanish. High vis 2, 1.5 x, z15.", 12, 400, MUTED);
let y = 80;
[['Paved → Unpaved', TW], ['Car friendly', CW], ['Unpaved', CW], ['4WD', CW]].reduce((x, [n, w]) => { out += text(x + w / 2, y, n, 13, 700, INK, 'middle'); return x + w + GAP; }, LW);
y += 12;
for (const [title, note, p, u] of ROWS) {
  out += text(10, y + CH / 2 - 2, title, 13, 700) + text(10, y + CH / 2 + 14, note, 11, 400, MUTED);
  out += `<g transform="translate(${LW} ${y})"><rect width="${TW}" height="${CH}" rx="4" fill="${LAND}"/>${p(tL)}${u(tR, 'unp')}</g>`;
  ['cf', 'unp', 'fwd'].forEach((c, j) => { out += `<g transform="translate(${LW + TW + GAP + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${u(curve, c)}</g>`; });
  y += CH + GAP;
}
writeFileSync(new URL('tertiary-options.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/tertiary-options.svg');
