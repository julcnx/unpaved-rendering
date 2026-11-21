// Every main-road option discussed (2026-11-13 to 2026-11-21) on one example, the orange primary (the hardest case
// for brown): paved to Unpaved along one road, an Unpaved curve and a 4WD curve. High vis 2 colours, 1.5 x, z15.
// Usage (from research/): node mockups/make-main-compare.mjs && node mockups/svg2png.mjs mockups/main-compare.svg
import { writeFileSync } from 'node:fs';

const K = 1.5, INK = '#222', MUTED = '#666', LAND = '#fbfaf6';
const UNPAVED = '#b0773a', FOURWD = '#2b190c', EDGE = '#3d3d3d';
const FILL = '#ef8a1f', CASING = '#8a4a08', W = 6.5;
const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const SHADE = mix(FILL, '#000000', 0.35), LIGHT40 = mix(FILL, '#ffffff', 0.4), TINT50 = mix(FILL, '#ffffff', 0.5), PALE65 = mix(FILL, '#ffffff', 0.65), PALEBAND = mix(FILL, '#ffffff', 0.75);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 12, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (d, { color, width, dash = null, cap = null }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * K}" stroke-linecap="${cap ?? (dash ? 'butt' : 'round')}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash.map((n) => +(n * K).toFixed(2)).join(' ')}"` : ''}/>`;

const CH = 60, TW = 300, CW = 170, GAP = 10, LW = 360;
const tLeft = `M12 ${CH / 2} L${TW / 2} ${CH / 2}`, tRight = `M${TW / 2} ${CH / 2} L${TW - 12} ${CH / 2}`;
const curve = `M10 ${CH - 12} C 50 8, 115 ${CH}, ${CW - 10} 14`;
const paved = (d) => line(d, { color: CASING, width: W + 2 }) + line(d, { color: FILL, width: W });
const bw = W * 0.4;

// Each option: [title, note, draw(d, level) for level 'unpaved' | '4wd']
const OPTIONS = [
  ['1. Solid brown band, 60%', '2026-11-13, first fork design', (d, l) => paved(d) + line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: W * 0.6 })],
  ['2. Brown band 40%, thick dark edge', '2026-11-20 (B); band weak on orange', (d, l) => paved(d) + line(d, { color: EDGE, width: bw + 2 / K }) + line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: bw })],
  ['3. Brown band 40%, no edge (a)', 'fades on orange', (d, l) => paved(d) + line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: bw })],
  ['4. Band in a darker class shade (b)', 'calm; loses brown = dirt', (d, l) => paved(d) + line(d, { color: l === '4wd' ? FOURWD : SHADE, width: bw })],
  ['5. Pale band (c)', 'reads like a divided road', (d, l) => paved(d) + line(d, { color: l === '4wd' ? FOURWD : PALEBAND, width: bw })],
  ['6. Tinted fill 50%, brown casing', 'casing change hard to see (Julien)', (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: W + 2 }) + line(d, { color: TINT50, width: W })],
  ['7. Pale fill 65%, thick condition outline', 'v3 outline system; casing disliked', (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: W + 2 }) + line(d, { color: PALE65, width: W - 2 })],
  ['8. Dotted band, fill 40% lighter', 'quiet; dots fade on yellow', (d, l) => line(d, { color: CASING, width: W + 2 }) + line(d, { color: LIGHT40, width: W }) + (l === '4wd' ? line(d, { color: FOURWD, width: bw }) : line(d, { color: SHADE, width: bw, dash: [0.01, bw * 1.5], cap: 'round' }))],
  ['9. Dashed band, fill 40% lighter', 'strong; the article convention', (d, l) => line(d, { color: CASING, width: W + 2 }) + line(d, { color: LIGHT40, width: W }) + (l === '4wd' ? line(d, { color: FOURWD, width: bw }) : line(d, { color: SHADE, width: bw, dash: [bw * 3, bw * 1.1] }))],
  ['10. Thick condition casing, class core 55%', '2026-11-21, no gap; brown close to orange', (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: W + 2 }) + line(d, { color: FILL, width: W * 0.55 })],
  ['11. Condition casing, white gap, class core 55%', '2026-11-21, latest; same rule as white roads', (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: W + 3 }) + line(d, { color: '#ffffff', width: W }) + line(d, { color: FILL, width: W * 0.55 })],
];
// White roads in the outline system: the condition casing 1.5 dp a side, white fill.
const whiteRow = (title, note, w, grey, opacity = 1) => {
  const g = (x) => (opacity < 1 ? `<g opacity="${opacity}">${x}</g>` : x);
  return [[title, note, (d, l) => g(line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: w + 3 / K * 1.5 }) + line(d, { color: '#ffffff', width: w }))],
    (d) => g(line(d, { color: grey, width: w + 2 / K * 1.5 }) + line(d, { color: '#ffffff', width: w }))];
};
const WHITE_MAIN = whiteRow('Reference: unclassified, tertiary', 'white, dark grey edge #6f6f6f; the rule option 11 extends', 4.5, '#6f6f6f');
const WHITE_MINOR = whiteRow('Reference: residential', 'white, grey edge #8f8f8f', 4, '#8f8f8f');
const SERVICE = whiteRow('Reference: service road', 'white, light edge #a8a8a8, whole road faded (45%)', 3, '#a8a8a8', 0.45);

const WIDTH = LW + TW + 2 * (CW + GAP) + 20;
let out = text(10, 26, 'Main roads: every option discussed, on one example (orange primary)', 17, 700) +
  text(10, 46, 'Paved to Unpaved along one road, then Unpaved and 4WD. 2026-11-13 to 2026-11-21. High vis 2 colours, 1.5 x widths, z15, proposed land.', 12, 400, MUTED);
let y = 80;
[['Paved → Unpaved', TW], ['Unpaved', CW], ['4WD', CW]].reduce((x, [n, w]) => { out += text(x + w / 2, y, n, 13, 700, INK, 'middle'); return x + w + GAP; }, LW);
y += 12;
const row = ([title, note, fn], pavedFn = paved) => {
  out += text(10, y + CH / 2 - 2, title, 13, 700) + text(10, y + CH / 2 + 14, note, 11, 400, MUTED);
  out += `<g transform="translate(${LW} ${y})"><rect width="${TW}" height="${CH}" rx="4" fill="${LAND}"/>${pavedFn(tLeft)}${fn(tRight, 'unpaved')}</g>`;
  out += `<g transform="translate(${LW + TW + GAP} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${fn(curve, 'unpaved')}</g>`;
  out += `<g transform="translate(${LW + TW + CW + 2 * GAP} ${y})"><rect width="${CW}" height="${CH}" rx="4" fill="${LAND}"/>${fn(curve, '4wd')}</g>`;
  y += CH + GAP;
};
OPTIONS.forEach((o) => row(o));
y += 10;
row(WHITE_MAIN[0], WHITE_MAIN[1]);
row(WHITE_MINOR[0], WHITE_MINOR[1]);
row(SERVICE[0], SERVICE[1]);
// Track and path references (Julien, 2026-11-21), in the adopted outline system.
const TRACK = ['Reference: track', 'paved white, grey edges; solid brown or near black at the same width',
  (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: 2.5 + 2 / K })]; // as wide as the paved track with its edges (Julien, 2026-11-21)
const trackPaved = (d) => line(d, { color: '#8f8f8f', width: 2.5 + 2 / K }) + line(d, { color: '#ffffff', width: 2.5 });
const SINGLE = ['Reference: single track (motorcycle=yes)', 'paved white dashes, grey edges; brown; near black',
  (d, l) => line(d, { color: l === '4wd' ? FOURWD : UNPAVED, width: 1.75 + 2 / K, dash: [7, 3] })];
const singlePaved = (d) => line(d, { color: '#8f8f8f', width: 1.75 + 2 / K, dash: [7, 3] }) + line(d, { color: '#ffffff', width: 1.75, dash: [7, 3] });
const PATH = ['Reference: path you may not ride', 'grey dashes (left); closed track solid grey (right cells)',
  (d) => line(d, { color: '#c4bdb4', width: 2.5 })];
const pathLeft = (d) => line(d, { color: '#c4bdb4', width: 1.75, dash: [7, 3] });
row(TRACK, trackPaved);
row(SINGLE, singlePaved);
row(PATH, pathLeft);
writeFileSync(new URL('main-compare.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${y + 10}" viewBox="0 0 ${WIDTH} ${y + 10}"><rect width="${WIDTH}" height="${y + 10}" fill="#fff"/>${out}</svg>`);
console.error('mockups/main-compare.svg');
