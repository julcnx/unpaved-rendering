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
  { title: 'Shape v2: grey edges, centre line', shape: true, levels: [['Easy', 'shape'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
  // v3, the default since 2026-11-20 (Julien): brown edges on tracks and roads; more brown = rougher.
  { title: 'Shape v3: brown edges (adopted)', shape: true, levels: [['Easy', 'shape3'], ['Unpaved', UNPAVED], ['4WD', FOURWD]] },
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
  if (color === 'shape3') {
    if (row === 'Track') return line(d, { color: UNPAVED, width: 2.5 + 2 / K }) + line(d, { color: '#ffffff', width: 2.5 });
    if (row === 'Single track') return line(d, { color: UNPAVED, width: 1.75, dash: [7, 3] });
    const r = ROADS[row];
    return line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: UNPAVED, width: r.w }) + line(d, { color: r.fill, width: r.w - 2 / K });
  }
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

// ---------- Main roads (2026-11-20): five designs, every level, secondary, primary and trunk, land and forest ----------
// Now: 40% band with a thin dark edge (Easy: brown inner edges, v3). B: Easy a thin centre line with a dark halo,
// Unpaved the band with a thicker dark edge, 4WD a near-black band. A t: Julien's idea, fill tinted to t of the
// class colour (rest white) with a brown casing, near black for 4WD; Easy keeps the full fill with the brown casing.
{
  const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
  const LEVELS = [['Paved', null], ['Easy', 'easy'], ['Unpaved', UNPAVED], ['4WD', FOURWD]];
  const DESIGNS = [['Before: band', 'band'], ['B: inner band (adopted)', 'centre'], ['A 65', 0.65], ['A 50', 0.5], ['A 35', 0.35]];
  const MAIN = Object.entries(ROADS).filter(([k]) => !k.startsWith('White'));
  const SUB4 = CELL_W / 4;
  const mcurve = (x0) => `M${x0 + 6} ${CELL_H - 12} C ${x0 + 26} 8, ${x0 + 48} ${CELL_H}, ${x0 + SUB4 - 6} 14`;
  const road = (r, level, design, x0) => {
    const d = mcurve(x0), bw = r.w * 0.4;
    const base = (fill, casing) => line(d, { color: casing, width: r.w + 2 }) + line(d, { color: fill, width: r.w });
    if (!level) return base(r.fill, r.casing);
    if (typeof design === 'number') {
      if (level === 'easy') return base(r.fill, UNPAVED);
      return base(mix(r.fill, '#ffffff', 1 - design), level === FOURWD ? FOURWD : UNPAVED);
    }
    if (design === 'centre') {
      if (level === 'easy') return base(r.fill, r.casing) + line(d, { color: EDGE, width: 2.2 / K }) + line(d, { color: UNPAVED, width: 1.2 / K });
      return base(r.fill, r.casing) + line(d, { color: EDGE, width: bw + 2 / K }) + line(d, { color: level, width: bw });
    }
    if (level === 'easy') return line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: UNPAVED, width: r.w }) + line(d, { color: r.fill, width: r.w - 2 / K });
    return base(r.fill, r.casing) + line(d, { color: EDGE, width: bw + 1.2 / K }) + line(d, { color: level, width: bw });
  };
  const groups2 = ['Land', 'Forest'];
  const W2 = LW + DESIGNS.length * (CELL_W + GAP) + 10;
  let o = text(10, 26, 'Unpaved main roads: five designs, every level (Paved, Easy, Unpaved, 4WD), secondary, primary and trunk', 17, 700) +
    text(10, 46, 'High vis 2 colours and widths. A = class fill tinted to 65, 50 or 35% with a brown casing (Julien, 2026-11-20); B = centre line and thick-edged band; Now = 40% band.', 12, 400, MUTED);
  DESIGNS.forEach(([title], j) => {
    const x = LW + j * (CELL_W + GAP);
    o += text(x + CELL_W / 2, TOP - 30, title, 14, 700, INK, 'middle');
    LEVELS.forEach(([n], k) => { o += text(x + k * SUB4 + SUB4 / 2, TOP - 12, n, 11, 400, MUTED, 'middle'); });
  });
  let y2 = TOP;
  for (const g of groups2) {
    o += text(10, y2 + 14, g, 14, 700);
    y2 += 22;
    for (const [name, r] of MAIN) {
      o += text(10, y2 + CELL_H / 2 + 4, name, 12);
      DESIGNS.forEach(([, design], j) => {
        const x = LW + j * (CELL_W + GAP);
        o += `<g transform="translate(${x} ${y2})"><rect width="${CELL_W}" height="${CELL_H}" rx="4" fill="${BG[g]}"/>` +
          LEVELS.map(([, lv], k) => road(r, lv, design, k * SUB4)).join('') + '</g>';
      });
      y2 += CELL_H + GAP;
    }
    y2 += 8;
  }
  writeFileSync(new URL('mainroads-options.svg', import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W2}" height="${y2 + 10}" viewBox="0 0 ${W2} ${y2 + 10}"><rect width="${W2}" height="${y2 + 10}" fill="#fff"/>${o}</svg>`);
  console.error('mockups/mainroads-options.svg');
}

// ---------- Design overview (2026-11-20): the adopted design, minor ways (edges) against main roads (inner band) ----------
{
  const LEV = ['Paved', 'Easy', 'Unpaved', '4WD'];
  const CW2 = 150, CH2 = 58, LW2 = 300, TOP2 = 110;
  const c2 = (x0) => `M${x0 + 10} ${CH2 - 12} C ${x0 + 45} 8, ${x0 + 95} ${CH2}, ${x0 + CW2 - 10} 14`;
  const GREYC = '#c4bdb4';
  // Each row: [label, sub, draw(level) -> strokes]
  const white = (w, casing) => (lv, d) => {
    const base = line(d, { color: casing, width: w + 2 }) + line(d, { color: '#ffffff', width: w });
    if (lv === 'Paved') return base;
    if (lv === 'Easy') return line(d, { color: casing, width: w + 2 }) + line(d, { color: UNPAVED, width: w }) + line(d, { color: '#ffffff', width: w - 2 / K });
    return base + line(d, { color: lv === 'Unpaved' ? UNPAVED : FOURWD, width: w * 0.4 });
  };
  const mainR = (r) => (lv, d) => {
    const base = line(d, { color: r.casing, width: r.w + 2 }) + line(d, { color: r.fill, width: r.w });
    if (lv === 'Paved') return base;
    if (lv === 'Easy') return base + line(d, { color: EDGE, width: 2.2 / K }) + line(d, { color: UNPAVED, width: 1.2 / K });
    const bw = r.w * 0.4;
    return base + line(d, { color: EDGE, width: bw + 2 / K }) + line(d, { color: lv === 'Unpaved' ? UNPAVED : FOURWD, width: bw });
  };
  const track = (lv, d) => lv === 'Paved' ? line(d, { color: '#8f8f8f', width: 2.5 + 2 / K }) + line(d, { color: '#ffffff', width: 2.5 })
    : lv === 'Easy' ? line(d, { color: UNPAVED, width: 2.5 + 2 / K }) + line(d, { color: '#ffffff', width: 2.5 })
    : line(d, { color: lv === 'Unpaved' ? UNPAVED : FOURWD, width: 2.5 });
  const single = (lv, d) => lv === 'Paved' ? line(d, { color: '#8f8f8f', width: 1.75, dash: [7, 3] })
    : line(d, { color: lv === '4WD' ? FOURWD : UNPAVED, width: 1.75, dash: [7, 3] });
  const SECTIONS = [
    ['Minor ways: the mark is on the edges, then fills the middle', 'Edges are neutral here, so they can carry the surface. More brown = rougher.', [
      ['Track', 'a narrow road; Easy = white with brown edges', track],
      ['Single track (motorcycle=yes)', 'dashes; Easy drawn as Unpaved', single],
      ['Unclassified, tertiary', 'dark grey edges #6f6f6f', white(4.5, '#6f6f6f')],
      ['Residential', 'grey edges #8f8f8f', white(4, '#8f8f8f')],
    ]],
    ['Main roads: the mark is inside, the edges keep the class', 'Easy a thin centre line; Unpaved a band with a thick dark edge; 4WD a near-black band.', [
      ['Secondary (yellow)', '', mainR(ROADS['Secondary (yellow)'])],
      ['Primary (orange)', '', mainR(ROADS['Primary (orange)'])],
      ['Trunk (crimson)', '', mainR(ROADS['Trunk (crimson)'])],
    ]],
    ['You may not ride it', 'one light grey, solid on tracks and roads, dashed on paths', [
      ['Closed track | path | road', 'no, private, agricultural, forestry; nobody said yes on paths', (lv, d) =>
        lv === 'Paved' ? line(d, { color: GREYC, width: 2.5 }) : lv === 'Easy' ? line(d, { color: GREYC, width: 1.75, dash: [7, 3] }) : lv === 'Unpaved' ? line(d, { color: GREYC, width: 4.5 }) : ''],
    ]],
  ];
  const W3 = LW2 + LEV.length * (CW2 + GAP) + 10;
  let o = text(10, 26, 'The design: minor ways (tracks and white roads) against main roads', 17, 700) +
    text(10, 46, 'High vis 2 colours, 1.5 x widths, z15, on the proposed land. Easy = confirmed for a city car; Unpaved = not confirmed; 4WD = horrible or worse.', 12, 400, MUTED);
  LEV.forEach((n, j) => { o += text(LW2 + j * (CW2 + GAP) + CW2 / 2, TOP2 - 12, n, 13, 700, INK, 'middle'); });
  let y3 = TOP2;
  for (const [title, sub, rows] of SECTIONS) {
    o += text(10, y3 + 16, title, 14, 700) + text(10, y3 + 32, sub, 11, 400, MUTED);
    y3 += 42;
    for (const [label, note, fn] of rows) {
      o += text(10, y3 + CH2 / 2, label, 12, 700) + (note ? text(10, y3 + CH2 / 2 + 15, note, 10, 400, MUTED) : '');
      LEV.forEach((lv, j) => {
        const x = LW2 + j * (CW2 + GAP);
        const inner = title.startsWith('You may not') ? fn(lv, c2(0)) : fn(lv, c2(0));
        const cap = title.startsWith('You may not') ? (['track', 'path', 'road', ''][j]) : '';
        o += `<g transform="translate(${x} ${y3})"><rect width="${CW2}" height="${CH2}" rx="4" fill="${BG.Land}"/>${inner}${cap ? text(CW2 - 8, CH2 - 6, cap, 10, 400, MUTED, 'end') : ''}</g>`;
      });
      y3 += CH2 + GAP;
    }
    y3 += 10;
  }
  // relabel the grey row's columns
  o += '';
  writeFileSync(new URL('design-overview.svg', import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W3}" height="${y3 + 10}" viewBox="0 0 ${W3} ${y3 + 10}"><rect width="${W3}" height="${y3 + 10}" fill="#fff"/>${o}</svg>`);
  console.error('mockups/design-overview.svg');
}
