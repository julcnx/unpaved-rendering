// Main-road patterns compared (Julien, 2026-11-20): dotted band against dashed band, each on the High vis 2 fill and on
// a fill 40% lighter. Marks in a darker shade of the class colour (35% toward black); Car friendly sparse, Unpaved
// dense; 4WD a solid near-black band in both. White roads and tracks keep the outline system (v3), shown for context.
// Usage (from research/): node mockups/make-pattern-options.mjs && node mockups/svg2png.mjs mockups/pattern-options.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666';
const BG = { Land: '#fbfaf6', Forest: '#e2ebd8' };
const FOURWD = '#2b190c', UNPAVED = '#b0773a', CF = '#4a6fb0';
const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width, dash = null, cap = null }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${cap ?? (dash ? 'butt' : 'round')}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((n) => +(n * K).toFixed(2)).join(' ')}"` : ''}/>`;
const CW = 170, CH = 56, GAP = 8, LW = 250;
const curve = `M10 ${CH - 12} C 50 8, 115 ${CH}, ${CW - 10} 14`;
const LEV = ['Paved', 'Car friendly', 'Unpaved', '4WD'];
const MAIN = [['Secondary', '#f4e04a', '#7d7206', 6], ['Primary', '#ef8a1f', '#8a4a08', 6.5], ['Trunk', '#d6336c', '#7a1236', 7]];

// Patterns, in dp along the line. Dots: round caps on a near-zero dash, so OsmAnd core-legacy can draw them too.
const PATTERNS = {
  dots: { name: 'Dotted band', cf: (bw) => ({ dash: [0.01, bw * 3.2], cap: 'round', width: bw * 0.8 }), unp: (bw) => ({ dash: [0.01, bw * 1.5], cap: 'round', width: bw }) },
  dashes: { name: 'Dashed band', cf: (bw) => ({ dash: [bw * 0.9, bw * 2.6], width: bw * 0.8 }), unp: (bw) => ({ dash: [bw * 3, bw * 1.1], width: bw }) },
};
const cell = (fill0, casing, w, lightT, pat, lv) => {
  const fill = mix(fill0, '#ffffff', lightT), shade = mix(fill0, '#000000', 0.35), bw = w * 0.4;
  let o = line(curve, { color: casing, width: w + 2 }) + line(curve, { color: fill, width: w });
  if (lv === 'Car friendly') o += line(curve, { color: shade, ...PATTERNS[pat].cf(bw) });
  if (lv === 'Unpaved') o += line(curve, { color: shade, ...PATTERNS[pat].unp(bw) });
  if (lv === '4WD') o += line(curve, { color: FOURWD, width: bw });
  return o;
};
const DESIGNS = [['dots', 0, 'Dotted band, High vis 2 fill'], ['dots', 0.4, 'Dotted band, fill 40% lighter'], ['dashes', 0, 'Dashed band, High vis 2 fill'], ['dashes', 0.4, 'Dashed band, fill 40% lighter']];

// Context rows: white road and track in the outline system (v3).
const white = (lv) => {
  const c = { Paved: '#6f6f6f', 'Car friendly': CF, Unpaved: UNPAVED, '4WD': FOURWD }[lv];
  return line(curve, { color: c, width: 4.5 + (lv === 'Paved' ? 2 : 3) }) + line(curve, { color: '#ffffff', width: 4.5 });
};
const track = (lv) => (lv === 'Paved' ? line(curve, { color: '#8f8f8f', width: 2.5 + 2 / K }) + line(curve, { color: '#ffffff', width: 2.5 })
  : lv === 'Car friendly' ? line(curve, { color: CF, width: 2.5 + 2 / K }) + line(curve, { color: '#ffffff', width: 2.5 })
  : line(curve, { color: lv === 'Unpaved' ? UNPAVED : FOURWD, width: 2.5 }));

const W = LW + LEV.length * (CW + GAP) + 10;
let out = text(10, 26, 'Main roads: dotted band against dashed band', 17, 700) +
  text(10, 46, 'Marks in a darker shade of the class colour: Car friendly sparse, Unpaved dense; 4WD a near-black band. White roads and tracks in the outline system for context. z15, 1.5 x.', 12, 400, MUTED);
let y = 84;
LEV.forEach((n, j) => { out += text(LW + j * (CW + GAP) + CW / 2, y, n, 13, 700, INK, 'middle'); });
y += 12;
const block = (title, rows, bg) => {
  out += text(10, y + 16, title, 14, 700);
  y += 24;
  for (const [label, fn] of rows) {
    out += text(10, y + CH / 2 + 4, label, 12);
    LEV.forEach((lv, j) => { out += `<g transform="translate(${LW + j * (CW + GAP)} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${bg}"/>${fn(lv)}</g>`; });
    y += CH + GAP;
  }
  y += 8;
};
for (const [bgName, bg] of Object.entries(BG)) {
  for (const [pat, t, title] of DESIGNS) block(`${title} (${bgName.toLowerCase()})`, MAIN.map(([n, f, c, w]) => [n, (lv) => cell(f, c, w, t, pat, lv)]), bg);
  if (bgName === 'Land') block('Context: white road and track, outline system', [['Unclassified', white], ['Track', track]], bg);
}
writeFileSync(new URL('pattern-options.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y + 10}" viewBox="0 0 ${W} ${y + 10}"><rect width="${W}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/pattern-options.svg');
