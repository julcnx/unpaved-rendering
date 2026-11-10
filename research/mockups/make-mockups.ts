// Mockups of the unpaved styles we keep from the Mind the Surface brief, on red, orange, yellow and white roads.
// Two levels (Paved, Unpaved) plus an optional Off-road mark drawn on top of Unpaved roads only.
// Usage: node mockups/make-mockups.ts   (writes mockups/*.svg and mockups/styles.json)
// styles.json is the single source of the style values: the demo (~/Workspaces/OSM/unpaved-rendering) copies it
// with `node scripts/sync-styles.mjs`.
// Road colours are OSM Carto's. The grain fill is based on the OSM Carto grain, the dashed fill on the Americana dashes;
// the Off-road marks are ours (neither style has one).

import { readFileSync, writeFileSync } from 'node:fs';

const LAND = '#f2efe9';
// Per road class (OSM Carto road-colors-generated.mss and roads.mss):
// fill and casing; grain dots (symbols/unpaved/unpaved_<class>-fill.svg) on a background tinted a little toward brown
// (Carto's own background is only a lighter fill); white roads stay white, with warm brown dots instead of Carto's grey; tunnel fill (Carto: lighter fill, darker for white roads);
// dash colour (luminance contrast 1.3 or more against the fill, 1.4 on red and orange where the dashes looked soft; same hue): a slightly darker tint of the class colour, light brown on white roads (grey would look like Carto construction).
type Klass = { name: string; id: string; fill: string; casing: string; grainBg: string; grainDot: string; dash: string; tunnel: string; offTint: string; offDash: string; lowTint: string; fullDash: string };
// One track rhythm for the line styles (centre line and dashed casing), from OSM Carto tracks scaled to our lines:
// One ladder for roads now and tracks later (Julien's choice, 2026-11-09): Paved solid, Unpaved = long dashes
// (Carto tracktype=grade2 order), Off-road = medium dashes (grade3 order), with a bigger step than Carto between the
// two so they are easy to tell apart: Unpaved long dashes and short gaps (22/6), Off-road short dashes and gaps a bit
// longer than the dashes (8/9). Limits: Off-road dashes 7 px or more (shorter read as dots), Unpaved gaps 5 px or more
// (shorter look solid at z13-14). Not the dash-dot (in Carto: track with no tracktype), not dense short dashes (tunnel casing).
const RHYTHM = { unpaved: [22, 6], offroad: [8, 9] };
// Dashed fill fills the whole road, so it uses the same rhythm 1.8 x larger, in fill widths (the mockup fill is 11 px).
const xWidth = (d: number[]) => d.map((v) => Math.round((v * 1.8 / 11) * 100) / 100);
const SPEC = {
  // Keys are the demo's road classes; `name` is the mockup label. Motorway is not in the mockups, only in the demo.
  classes: {
    motorway: { name: 'Pink', fill: '#e892a2', casing: '#dc2a67', grainBg: '#ea98a2', grainDot: '#420015', dash: '#da768a', tunnel: '#efb3be', offTint: '#d7697e', offDash: '#d0526b', lowTint: '#dd7f91', fullDash: '#db7b8e' },
    trunk: { name: 'Red', fill: '#f9b29c', casing: '#c84e2f', grainBg: '#f6b598', grainDot: '#511d0f', dash: '#ea8b6e', tunnel: '#fbd3c6', offTint: '#e98667', offDash: '#e3643d', lowTint: '#ed9d84', fullDash: '#ed9980' },
    primary: { name: 'Orange', fill: '#fcd6a4', casing: '#a06b00', grainBg: '#f6d29c', grainDot: '#563d12', dash: '#e9b066', tunnel: '#fde7c9', offTint: '#e8ac61', offDash: '#df8d23', lowTint: '#eec28b', fullDash: '#ecbc7e' },
    secondary: { name: 'Yellow', fill: '#f7fabf', casing: '#707d05', grainBg: '#f3efb2', grainDot: '#3f4318', dash: '#d9df75', tunnel: '#fbfdd8', offTint: '#d0d651', offDash: '#b9c12d', lowTint: '#e3e798', fullDash: '#dee387' },
    minor: { name: 'White', fill: '#ffffff', casing: '#bbbbbb', grainBg: '#ffffff', grainDot: '#46362a', dash: '#dccab0', tunnel: '#f2f2f2', offTint: '#d6bc9b', offDash: '#c8ac84', lowTint: '#e2cfb8', fullDash: '#dccab0' },
  },
  // Below this fill width (px) every style draws a plain tint: lowTint for Unpaved, offTint for Off-road (patterns blur there).
  lowZoom: { below: 6 },
  // Widths and dashes in px at the mockup fill width (11 px) unless the name says "x fill width".
  styles: {
    'centre-line': { color: '#8a6440', width: 1.8, narrowWidth: 1, narrowBelow: 6, unpavedDash: RHYTHM.unpaved, offroadDash: RHYTHM.offroad },
    grain: { scale: 1.5, offroadScale: 3, offroadShift: [21, 37] },
    'dashed-fill': { unpavedXWidth: xWidth(RHYTHM.unpaved), offroadXWidth: xWidth(RHYTHM.offroad), band: 0.6, bandFromWidth: 6 },
    // Full width, as Americana draws unpaved roads (and DMD2): same dashes, no band. Lighter Unpaved dash (fullDash, contrast
    // 1.25 against the fill; white keeps the tan dash so it does not fade into the land): full width already covers most of the road.
    'dashed-fill-full': { unpavedXWidth: xWidth(RHYTHM.unpaved), offroadXWidth: xWidth(RHYTHM.offroad) },
    // Dashed casing, the fill stays continuous: the dashed outline of Gaia GPS tracks, with the class kept.
    // Casing colour for the dashed outline: darker on red and orange (the normal casing is close to the fill),
    // darker on white (OSM Carto tertiary casing), or the dashes fade.
    'dashed-casing': { unpaved: RHYTHM.unpaved, offroad: RHYTHM.offroad, casing: { trunk: '#a33b20', primary: '#7d5400', minor: '#8f8f8f' } },
  },
};
const MOCKUP_CLASSES = ['trunk', 'primary', 'secondary', 'minor'] as const;
const CLASSES: Klass[] = MOCKUP_CLASSES.map((id) => ({ id, ...SPEC.classes[id] }));
// Mix two #rrggbb colours: t = 0 gives a, t = 1 gives b.
const mix = (a: string, b: string, t: number) => '#' + [1, 3, 5].map((i) =>
  Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
// Tint variant (to compare, 2026-11-10): Off-road keeps the Unpaved pattern and gets a darker class tint in the fill
// (offTint: same hue as the class, luminance contrast 1.35 or more against the fill and 1.3 against the land, 1.5 for white,
// whose tint is tan so it does not melt into the beige land). Grain background to match.
// Dashed fill: the fill stays normal (a dark fill is too heavy) and the dashes get darker (offDash, 1.35 or more against the dash).
const tinted = (c: Klass): Klass => ({ ...c, id: `${c.id}-t`, fill: c.offTint, grainBg: c.offTint });
const tintedDash = (c: Klass): Klass => ({ ...c, dash: c.offDash, fullDash: c.offDash });
const CL = SPEC.styles['centre-line'], GR = SPEC.styles.grain, DA = SPEC.styles['dashed-fill'], DF = SPEC.styles['dashed-fill-full'], GA = SPEC.styles['dashed-casing'];
const BROWN = CL.color; // a bit lighter than a contour-line brown, so it does not read as a third dark line
const TRACK = '#996600'; // OSM Carto @track-fill
const MINOR_CONSTRUCTION = '#aaa'; // OSM Carto @minor-construction
const STATES = ['Paved', 'Unpaved', 'Unpaved + Off-road'] as const;
type State = (typeof STATES)[number];

const CELL_W = 300;
const CELL_H = 70;
const ROAD = 'M 20 35 L 280 35'; // straight, so the patterns are easy to compare
// Fill width and casing (both sides). Two passes: wide (about z16) and narrow (about z12-13, where patterns fail first).
let W = 11;
let CAS = 4;

// OSM Carto grain (CC0): the same 64 px tile for every class, only the two colours change.
// Unpaved: drawn 1.5 x larger than Carto, which is too faint at this size. Off-road: a 3 x larger copy of the dots on top.
const GRAIN = readFileSync(new URL('./carto-unpaved-grain.svg', import.meta.url), 'utf8').match(/<path[^>]*?\sd="([^"]+)"/)![1];
const grain = (c: Klass) =>
  `<pattern id="grain-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="scale(${GR.scale})"><rect width="64" height="64" fill="${c.grainBg}"/><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>` +
  `<pattern id="grain2-${c.id}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="translate(${GR.offroadShift.join(' ')}) scale(${GR.offroadScale})"><path d="${GRAIN}" fill="${c.grainDot}"/></pattern>`;
const DEFS = `<defs>${[...CLASSES, ...CLASSES.map(tinted)].map(grain).join('')}</defs>`;

const line = (stroke: string, width: number, dash = '', cap = 'butt', extra = '') =>
  `<path d="${ROAD}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra}/>`;
const road = (fill: string, casing: string, extra = '') => line(casing, W + CAS, '') + line(fill, W) + extra;
// Dashed casing: only the outline is broken, the fill stays continuous.
// White roads get a darker casing (OSM Carto tertiary casing), or the dashes vanish into the land.
const gapCasing = (c: Klass) => (GA.casing as Record<string, string>)[c.id.replace(/-t$/, '')] ?? c.casing;
const dashedCasing = (c: Klass, dash: string) => line(gapCasing(c), W + CAS, dash) + line(c.fill, W);

const unpaved = (s: State) => s.startsWith('Unpaved');
const offroad = (s: State) => s.endsWith('Off-road');

// Ordered from faint to strong (2026-11-10): grain fill, dashed centre line, dashed fill, dashed casing, dashed fill full width.
// Official Off-road (2026-11-10): the Unpaved pattern, only darker (see official()). Each style's own road() below still draws
// the earlier Off-road, more broken (medium dashes), kept as a backup comparison only. No preference:
// the right one depends on the provider's style. Brown fill and tint were dropped. Paved is the same normal road in all of them.
type Option = { title: string; note: string; road: (s: State, c: Klass) => string };
const OPTIONS: Record<string, Option> = {
  grain: {
    title: '1. Grain fill',
    note: 'Unpaved: the OSM Carto grain, dark dots in the class hue, 1.5 x larger, on a fill tinted a little toward brown. Off-road: the same grain on a darker tint.',
    road: (s, c) => road(unpaved(s) ? `url(#grain-${c.id})` : c.fill, c.casing, offroad(s) ? line(`url(#grain2-${c.id})`, W) : ''),
  },
  'centre-line': {
    title: '2. Dashed centre line',
    note: 'Thin brown line down the middle in long dashes (OSM Carto grade2 rhythm). Off-road: the same line on a darker tint of the road.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(BROWN, W < CL.narrowBelow ? CL.narrowWidth : CL.width, (offroad(s) ? CL.offroadDash : CL.unpavedDash).join(' ')) : ''),
  },
  'dashed-fill': {
    title: '3. Dashed fill',
    note: 'Long dashes in a darker class tint, in a centred band (as DMD2; light brown on white). Off-road: the same dashes, darker.',
    // Dashes in a centred band 60% of the road width, so a thin edge of the normal fill stays along both sides: the road reads
    // as one road with a pattern, not as Carto construction (full-width blocks). Full width below 6 px, or the band vanishes.
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(c.dash, W < DA.bandFromWidth ? W : W * DA.band, (offroad(s) ? DA.offroadXWidth : DA.unpavedXWidth).map((x) => x * W).join(' ')) : ''),
  },
  'dashed-casing': {
    title: '4. Dashed casing',
    note: 'Class-coloured fill, outline in long dashes (as Gaia GPS tracks, class kept). Off-road: the same outline on a darker tint.',
    road: (s, c) => unpaved(s) ? dashedCasing(c, (offroad(s) ? GA.offroad : GA.unpaved).join(' ')) : road(c.fill, c.casing),
  },
  'dashed-fill-full': {
    title: '5. Dashed fill, full width',
    note: 'Long dashes in a darker class tint over the whole road width (as Americana). Off-road: the same dashes, darker.',
    road: (s, c) => road(c.fill, c.casing, unpaved(s) ? line(c.fullDash, W, (offroad(s) ? DF.offroadXWidth : DF.unpavedXWidth).map((x) => x * W).join(' ')) : ''),
  },
};

// Official Off-road: the Unpaved pattern, only darker: darker fill (offTint) in the grain fill, centre line and casing,
// darker dashes (offDash) in the two dashed fills.
// Below SPEC.lowZoom.below px of fill width, every style is a plain tint (stepwise contrast 1.2 or more: fill, lowTint, offTint).
const official = (key: string, s: State, c: Klass) => unpaved(s) && W < SPEC.lowZoom.below ? road(offroad(s) ? c.offTint : c.lowTint, c.casing)
  : !offroad(s) ? OPTIONS[key].road(s, c)
  : OPTIONS[key].road('Unpaved', key.startsWith('dashed-fill') ? tintedDash(c) : tinted(c));

// OSM Carto features the styles must not look like, scaled from z16 (construction 8 px wide) to our road width.
// Tunnel: dashed casing 4,2 and a lighter fill.
const k = () => (W + CAS) / 8;
const construction = (colour: string) => line(colour, W + CAS) + line('white', 7 * k(), `${8 * k()} ${6 * k()}`);
const track = () => line('white', (1.5 + 2) * k(), '', 'butt', ' stroke-opacity="0.4"') +
  line(TRACK, 1.5 * k(), [5, 4, 2, 4].map((d) => d * k()).join(' '), 'butt', ' stroke-opacity="0.8"');
const tunnel = (c: Klass) => line(c.casing, W + CAS, `${4 * k()} ${2 * k()}`) + line(c.tunnel, W);
const REFERENCES = () => [
  { label: 'Carto construction', cells: [...CLASSES.slice(0, 3).map((c) => [`${c.name.split(' ')[0]}`, construction(c.fill)]), ['White', construction(MINOR_CONSTRUCTION)]] },
  { label: 'Carto tunnel', cells: CLASSES.map((c) => [c.name, tunnel(c)]) },
  { label: 'Carto track', cells: [
    ['Track', track()],
    ['Track next to a road', road(CLASSES[2].fill, CLASSES[2].casing) + `<g transform="translate(0 ${(W + CAS) / 2 + 3 * k()})">${track()}</g>`],
    ['Dashed centre line, Off-road', official('centre-line', 'Unpaved + Off-road', CLASSES[2])],
    ['Dashed centre line, Off-road on white', official('centre-line', 'Unpaved + Off-road', CLASSES[3])],
  ] },
];

const text = (x: number, y: number, s: string, size = 14, weight = 400, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#333" text-anchor="${anchor}">${s}</text>`;

const box = (x: number, y: number, inner: string) =>
  `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" fill="${LAND}" rx="4"/>${inner}</g>`;

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>\n`;

const out = (name: string, content: string) => writeFileSync(new URL(`./${name}.svg`, import.meta.url), content);

function render(suffix: string) {
  // One option, all states side by side, one row per class: for issues and the wiki.
  for (const [key, option] of Object.entries(OPTIONS)) {
    const w = STATES.length * (CELL_W + 10) + 10;
    const h = CLASSES.length * (CELL_H + 10) + 60;
    const body = STATES.map((s, i) => text(10 + i * (CELL_W + 10) + CELL_W / 2, 30, s, 15, 700, 'middle') +
      CLASSES.map((c, r) => box(10 + i * (CELL_W + 10), 40 + r * (CELL_H + 10), official(key, s, c))).join('')).join('');
    out(`option-${key}${suffix}`, svg(w, h, body + text(10, h - 12, `${option.title}: ${option.note}`, 12)));
  }

  // All options: rows = class and state, columns = options.
  const LABEL_W = 290;
  const keys = Object.keys(OPTIONS);
  const ROWS = CLASSES.flatMap((c) => STATES.map((s) => ({ c, s })));
  const w = LABEL_W + keys.length * (CELL_W + 10) + 10;
  const y = (r: number) => 40 + r * (CELL_H + 10);
  const h = y(ROWS.length);
  const header = keys.map((key, i) => text(LABEL_W + i * (CELL_W + 10) + CELL_W / 2, 26, OPTIONS[key].title, 15, 700, 'middle')).join('');
  const grid = (road: (key: string, s: State, c: Klass) => string) => ROWS.map(({ c, s }, r) => text(10, y(r) + CELL_H / 2 + 5, `${c.name}: ${s}`, 14, 700) +
    keys.map((key, i) => box(LABEL_W + i * (CELL_W + 10), y(r), road(key, s, c))).join('')).join('');
  out(`options-comparison${suffix}`, svg(w, h + 30, header + grid(official) +
    text(10, h + 18, (W < SPEC.lowZoom.below ? 'Below 6 px of road width every style is a plain tint: lighter for Unpaved, darker for Off-road (patterns blur there).' : 'Off-road = the Unpaved pattern, only darker: darker fill in styles 1, 2 and 4 (tan on white), darker dashes in styles 3 and 5.'), 13)));
  // Backup only: the earlier Off-road, more broken (medium dashes, big grain).
  out(`options-comparison-broken${suffix}`, svg(w, h + 30, header + grid((key, s, c) => OPTIONS[key].road(s, c)) +
    text(10, h + 18, 'Backup only: the earlier Off-road, more broken (medium dashes; big grain on top in style 1). The official version uses a darker tint.', 13)));

  // OSM Carto features the styles must not look like: own file.
  const refTop = 40;
  const hr = refTop + REFERENCES().length * (CELL_H + 10) + 10;
  const refs = text(10, 26, 'Must not look like (OSM Carto):', 15, 700) + REFERENCES().map((ref, r) => {
    const top = refTop + r * (CELL_H + 10);
    return text(10, top + CELL_H / 2 + 5, ref.label, 14, 700) +
      ref.cells.map(([name, inner], i) => box(LABEL_W + i * (CELL_W + 10), top, inner + text(CELL_W / 2, CELL_H - 8, name, 11, 400, 'middle'))).join('');
  }).join('');
  out(`references${suffix}`, svg(w, hr, refs));
}

render('');
W = 5;
CAS = 2;
render('-narrow');

// Style values for the demo, with the titles and notes shown in its menu and legend.
const styles = Object.fromEntries(Object.entries(SPEC.styles).map(([k, v]) => [k, { name: OPTIONS[k].title, note: OPTIONS[k].note, ...v }]));
writeFileSync(new URL('./styles.json', import.meta.url), JSON.stringify({ source: 'osm-wiki/unpaved-rendering/mockups/make-mockups.ts', lowZoom: SPEC.lowZoom, classes: SPEC.classes, styles }, null, 2) + '\n');
