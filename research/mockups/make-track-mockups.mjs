// Track mockups for the OsmAnd enduro fork (E-tracks.md), 2026-11-13.
// 1. tracks-enduro-plugin.svg: how the OsmAnd Motorcycle style (enduro.render.xml, commit f0676ed) draws tracks and
//    paths at z15, from its code: colours $piste, $chemin, $sentier, $interdit, widths $piste_trait, $chemin_trait,
//    $sentier_trait, dashes $piste_pointillé, $chemin_pointillé, $sentier_pointillé (z15 values, not engine_v1).
// 2. tracks-best-practice.svg: the fork proposal against two single-signal versions: dashes only, colour only, both.
// 3. tracks-solid.svg: scheme D (2026-11-13, Julien): solid tracks coloured by roughness, dashes only for single track.
// 4. roads-fork.svg: five ways to draw Unpaved and Off-road roads in the fork, next to a solid Unpaved track.
// Lines are drawn at 2 x the style's z15 widths (a phone at density 2). Shares of track km: E-tracks.md section 2.
// Usage (from research/): node mockups/make-track-mockups.mjs && node mockups/svg2png.mjs mockups/tracks-*.svg
import { writeFileSync } from 'node:fs';
import SPEC from '../../js/style-spec.js';

const S = 2; // style px to mockup px
const INK = '#222', MUTED = '#666';
const BGS = {
  land: { name: 'Land', color: '#f2efe9', night: false },
  forest: { name: 'Forest', color: '#dce6d0', night: false }, // the style's $foret
  night: { name: 'Night', color: '#202124', night: true },
};
const CELL_W = 130, CELL_H = 54, LABEL_W = 500, GAP = 8;
const CURVE = `M10 ${CELL_H - 14} C 45 8, 85 ${CELL_H}, ${CELL_W - 10} 16`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 13, weight = 400, fill = INK, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
// One stroke along the cell curve. dash: "16_4" style string in style px, or null for solid.
const line = ({ color, width, dash = null, opacity = 1, cap = 'butt', d = CURVE }) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width * S}" stroke-opacity="${opacity}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash.split('_').map((n) => n * S).join(' ')}"` : ''}/>`;

// rows: [{ title, sub, draw(bg) -> svg strokes }]; groups: [{ title, bgs: [keys], variant }]
function sheet(file, heading, note, rows, groups, LABEL_W = 500) {
  const cols = groups.flatMap((g) => g.bgs.map((b) => ({ g, b })));
  const W = LABEL_W + cols.length * (CELL_W + GAP) + groups.length * 12 + 10;
  const top = 92;
  const H = top + rows.length * (CELL_H + GAP) + 30;
  let x = LABEL_W, out = '';
  for (const g of groups) {
    out += text(x + (g.bgs.length * (CELL_W + GAP) - GAP) / 2, top - 30, g.title, 14, 700, INK, 'middle');
    for (const b of g.bgs) {
      out += text(x + CELL_W / 2, top - 10, BGS[b].name, 12, 400, MUTED, 'middle');
      rows.forEach((r, i) => {
        const y = top + i * (CELL_H + GAP);
        out += `<g transform="translate(${x} ${y})"><rect width="${CELL_W}" height="${CELL_H}" rx="4" fill="${BGS[b].color}"/>${r.draw(BGS[b], g.variant)}</g>`;
      });
      x += CELL_W + GAP;
    }
    x += 12;
  }
  rows.forEach((r, i) => {
    const y = top + i * (CELL_H + GAP);
    out += text(10, y + 22, r.title, 13, 700) + text(10, y + 40, r.sub, 11, 400, MUTED);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="#ffffff"/>${text(10, 26, heading, 17, 700)}${text(10, 46, note, 12, 400, MUTED)}${out}</svg>`;
  writeFileSync(new URL(file, import.meta.url), svg);
  console.error(`mockups/${file}`);
}

// ---------- 1. The OsmAnd Motorcycle style as coded ----------
const P = {
  piste: (n) => (n ? '#cc9966' : '#996600'),
  chemin: (n) => (n ? '#00bb55' : '#008800'),
  sentier: (n) => (n ? '#cccccc' : '#000000'),
  interdit: (n) => (n ? '#cc4f4f' : '#ff3333'),
};
const TRACK_W = 2.5, PATH_W = 1.75, TRACK_DASH = '16_4', PATH_DOTS = '5_5';
const plugin = [
  { title: 'Asphalt track', sub: 'surface=asphalt · TH 0.1%, CH 5.4%',
    draw: (b) => line({ color: '#333333', width: 4 + 1.2, opacity: 0.55 }) + line({ color: b.night ? '#aaaaaa' : '#ffffff', width: 4 }) },
  { title: 'Brown solid: "carrossable"', sub: 'grade1/2, gravel, compacted, paved, concrete, smoothness=bad · TH 1.8%, CH 39.8%',
    draw: (b) => line({ color: P.piste(b.night), width: TRACK_W }) },
  { title: 'Brown dashed: "carrossable grossier"', sub: 'grade3, pebblestone · TH 0.6%, CH 22.2%',
    draw: (b) => line({ color: P.piste(b.night), width: TRACK_W, dash: TRACK_DASH }) },
  { title: 'Green solid: "selon météo"', sub: 'grade4, smoothness=very_bad · TH 0.7%, CH 9.7%',
    draw: (b) => line({ color: P.chemin(b.night), width: TRACK_W }) },
  { title: 'Green dashed: bare ground', sub: 'grade5, smoothness horrible/very_horrible, sand, mud, grass · TH 0.7%, CH 7.4%',
    draw: (b) => line({ color: P.chemin(b.night), width: TRACK_W, dash: TRACK_DASH }) },
  { title: 'Green dashed: no information', sub: 'no tag, or unpaved, dirt, ground, earth (in no list) · TH 96.1%, CH 15.5%',
    draw: (b) => line({ color: P.chemin(b.night), width: TRACK_W, dash: TRACK_DASH }) },
  { title: '  same, option "cacher chemin sans info"', sub: 'the option drops the dashes, it hides nothing',
    draw: (b) => line({ color: P.chemin(b.night), width: TRACK_W }) },
  { title: 'Black dots: impassable track', sub: 'smoothness=impassable, mtb:scale 4 to 6 · under 0.1%',
    draw: (b) => line({ color: P.sentier(b.night), width: PATH_W, dash: PATH_DOTS }) },
  { title: 'Path (also with motorcycle=yes)', sub: 'highway=path, bridleway: no rule for motorcycle=yes',
    draw: (b) => line({ color: P.sentier(b.night), width: PATH_W, dash: PATH_DOTS }) },
  { title: 'Closed to motorcycles', sub: 'motorcycle, motor_vehicle, vehicle, access = no, private, agricultural...',
    draw: (b) => line({ color: P.interdit(b.night), width: TRACK_W, dash: TRACK_DASH }) },
  { title: 'Unpaved minor road, repainted', sub: 'unclassified with ground, dirt, earth, unpaved: track green and width',
    draw: (b) => line({ color: P.chemin(b.night), width: TRACK_W }) },
];
sheet('tracks-enduro-plugin.svg', 'OsmAnd Motorcycle style (enduro.render.xml): tracks and paths at z15, from the code',
  'Brown = material added (easy), green = bare earth (harder); dashed = looser. TH / CH: share of track km in Thailand / Switzerland (2026-11-13).',
  plugin, [{ title: 'As coded', bgs: ['land', 'forest', 'night'] }]);

// ---------- 2. Best practice: dashes only, colour only, both ----------
// Ramp: rougher = more contrast with the land (darker by day, brighter by night). Paved tracks a neutral grey.
const RAMP = {
  day: { paved: '#bcb3aa', unpaved: '#b0773a', offroad: '#7d3416', specialized: '#2e1a12' },
  night: { paved: '#5a5754', unpaved: '#9c6a3a', offroad: '#f0925e', specialized: '#f3dcc4' },
};
const ONE = { day: '#996600', night: '#cc9966' }; // dashes only: one track colour (the style's $piste)
const RHYTHM = { paved: null, unpaved: '11_3', offroad: '4_4.5', specialized: '2_4' }; // shared ladder 22/6, 8/9 at 2 x; specialized short
const HIKE = { day: '#5d6b80', night: '#9aa8bd' };
const track = (level, width = TRACK_W, opacity = 1) => (b, v) => {
  const t = b.night ? 'night' : 'day';
  const color = v === 'dashes' ? ONE[t] : RAMP[t][level];
  const dash = v === 'colour' ? null : RHYTHM[level];
  return line({ color, width, dash, opacity });
};
// Roads in style 4 (Dashed casing), light tan fill on white Unpaved roads (js/style-spec.js, minor and dark.minor).
const road = (off) => (b) => {
  const fill = b.night ? (off ? '#776856' : '#655949') : (off ? '#cca979' : '#e2cfb8');
  const casing = b.night ? '#a9a9ad' : (off ? '#6f6f6f' : '#8f8f8f');
  return line({ color: casing, width: 7, dash: '11_3' }) + line({ color: fill, width: 5.6 });
};
const best = [
  { title: 'Paved track', sub: 'paved surface, or grade1 without surface · TH 0.7%, CH 14.8%', draw: track('paved') },
  { title: 'Unpaved track (default)', sub: 'everything else, incl. surface=unpaved and no tags · TH 98.0%, CH 71.0%', draw: track('unpaved') },
  { title: 'Off-road track', sub: 'smoothness very_bad/horrible, grade4 to 7, mud, rock, 4wd_only · TH 1.2%, CH 14.1%', draw: track('offroad') },
  { title: 'Specialized track', sub: 'smoothness very_horrible/impassable, grade8 · TH 0.1%, CH 0.1%', draw: track('specialized') },
  { title: 'Moto path (Unpaved)', sub: 'path with motorcycle=yes: track ramp at path width', draw: track('unpaved', PATH_W) },
  { title: 'Moto path (Off-road)', sub: 'same, with Off-road evidence', draw: track('offroad', PATH_W) },
  { title: 'Hiking path', sub: 'path without motorcycle access: a cool colour, never on the ramp',
    draw: (b) => line({ color: HIKE[b.night ? 'night' : 'day'], width: PATH_W, dash: '0.1_3', cap: 'round' }) },
  { title: 'Closed Unpaved track', sub: 'motorcycle, motor_vehicle or access no, private...: faded',
    draw: track('unpaved', TRACK_W, 0.35) },
  { title: 'Unpaved minor road (reference)', sub: 'style 4, light tan fill: stays a road, wider, with an outline', draw: road(false) },
  { title: 'Off-road minor road (reference)', sub: 'style 4, darker tan', draw: road(true) },
];
sheet('tracks-best-practice.svg', 'Tracks for the enduro fork: dashes only, colour only, or both (proposal)',
  'C codes roughness twice: a lightness ramp (rougher = more contrast with the land) and the shared dash ladder. TH / CH: track km per level of our classifier.',
  best, [
    { title: 'A. Dashes only', bgs: ['land', 'forest', 'night'], variant: 'dashes' },
    { title: 'B. Colour only', bgs: ['land', 'forest', 'night'], variant: 'colour' },
    { title: 'C. Both (proposal)', bgs: ['land', 'forest', 'night'], variant: 'both' },
  ]);

// Luminance contrast of the ramp: each step against the land and against the next step.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => p - q); return (y + 0.05) / (x + 0.05); };
for (const [t, bgs] of [['day', ['land', 'forest']], ['night', ['night']]]) {
  const steps = Object.entries(RAMP[t]);
  for (const b of bgs) console.error(`${t} on ${b}: ` + steps.map(([k, c]) => `${k} ${cr(c, BGS[b].color).toFixed(2)}`).join(', '));
  console.error(`${t} steps: ` + steps.slice(1).map(([k, c], i) => `${steps[i][0]}->${k} ${cr(c, steps[i][1]).toFixed(2)}`).join(', '));
}

// ---------- 3. Scheme D: solid tracks, colour = roughness, dashes = single track, red = closed ----------
// Three surface looks for the whole map (Julien, 2026-11-13): white = paved (a narrow road), brown = unpaved,
// dark brown = off-road (very_horrible and grade8 included; no separate Specialized colour). The ramp stays away
// from red (red = closed). By night rougher = brighter.
// Access rule (Julien, 2026-11-13): red = someone said no, dots = nobody said yes. A path is rideable only with
// motorcycle yes, designated or permissive (the OSM default for a path is no motor vehicles); every other path,
// tagged or not, is thin grey dots, as is anything smoothness=impassable.
// Vehicle ladder (Julien, 2026-11-13): the Off-road mark of the article is split in two for the fork, since smoothness
// is a vehicle ladder: Unpaved = nothing says it is rough (bad or better, grade2/3, any surface incl. unpaved, or no
// tag); High clearance = very_bad, grade4, rock, 4wd_only=recommended; 4WD = horrible, very_horrible, grade5 to 8,
// mud, 4wd_only yes or extreme. Darker = needs more vehicle; by night brighter = needs more vehicle.
const RAMP_D = {
  day: { unpaved: '#b0773a', high: '#74481f', fourwd: '#2b190c' },
  night: { unpaved: '#9c6a3a', high: '#d1a068', fourwd: '#f7e3c6' },
};
const PAVED_TRACK = { day: { fill: '#ffffff', casing: '#9a9a9a' }, night: { fill: '#4a4a4e', casing: '#8a8a8e' } };
const CLOSED = { day: '#e07878', night: '#c86060' }; // thin and pale, so closed ways recede (bright red with cross bars dropped)
const DOTS = { day: '#6b6b6b', night: '#a8a8a8' }; // every path nobody said you may ride
const SINGLE = '7_3'; // single track: one dash rhythm for every level, colour says the roughness
const rampD = (b, level) => RAMP_D[b.night ? 'night' : 'day'][level];
const paved = (b) => { const p = PAVED_TRACK[b.night ? 'night' : 'day']; return line({ color: p.casing, width: TRACK_W + 1.2 }) + line({ color: p.fill, width: TRACK_W }); };
const dots = (b, opacity = 1) => line({ color: DOTS[b.night ? 'night' : 'day'], width: 1.4, dash: '0.1_2.6', cap: 'round', opacity });
const closed = (dash = null) => (b) => line({ color: CLOSED[b.night ? 'night' : 'day'], width: 1.4, dash });
// Survey mode (a rendering property, off by default): a track or rideable single track with no information about
// its condition (no tracktype, no smoothness, and no surface or only surface=unpaved) is faded, so what needs a
// visit stands out. Shares measured 2026-11-13: tracks TH 94.3%, CH 15.3%; moto paths TH 79.0%, CH 9.5%.
// Paths with no access answer (no tag, or access/motorcycle=unknown) fade too (Julien, 2026-11-13): unknown access
// is a survey question as much as unknown condition. Impassable keeps its dots: it is an answer.
const SURVEY_FADE = 0.25;
const op = (v) => (v === 'survey' ? SURVEY_FADE : 1);
const solid = [
  { title: 'Paved track', sub: 'paved surface, or grade1 without surface: a narrow white road · TH 0.7%, CH 14.8%', draw: paved },
  { title: 'Unpaved track, condition tagged', sub: 'gravel, compacted, dirt..., grade2, grade3, smoothness bad or better · TH 3.7%, CH 55.7%', draw: (b) => line({ color: rampD(b, 'unpaved'), width: TRACK_W }) },
  { title: 'Unpaved track, condition untagged', sub: 'no tag, or only surface=unpaved: same look; faded in survey mode · TH 94.3%, CH 15.3%', draw: (b, v) => line({ color: rampD(b, 'unpaved'), width: TRACK_W, opacity: op(v) }) },
  { title: 'High-clearance track', sub: 'smoothness=very_bad, grade4, rock, 4wd_only=recommended: a pickup passes · TH 0.7%, CH 8.6%', draw: (b) => line({ color: rampD(b, 'high'), width: TRACK_W }) },
  { title: '4WD track', sub: 'smoothness horrible or very_horrible, grade5 to 8, mud, 4wd_only yes or extreme · TH 0.6%, CH 5.6%', draw: (b) => line({ color: rampD(b, 'fourwd'), width: TRACK_W }) },
  { title: 'Rideable path (motorcycle=yes), condition tagged', sub: 'motorcycle yes, designated or permissive: a dashed single track, too narrow for four wheels', draw: (b) => line({ color: rampD(b, 'unpaved'), width: PATH_W, dash: SINGLE }) },
  { title: 'Rideable path, condition untagged', sub: 'motorcycle=yes but no tag or only surface=unpaved: same look; faded in survey mode · TH 79.0%, CH 9.5%', draw: (b, v) => line({ color: rampD(b, 'unpaved'), width: PATH_W, dash: SINGLE, opacity: op(v) }) },
  { title: 'Rideable path, high clearance', sub: 'motorcycle=yes with very_bad, grade4, rock', draw: (b) => line({ color: rampD(b, 'high'), width: PATH_W, dash: SINGLE }) },
  { title: 'Rideable path, 4WD level', sub: 'motorcycle=yes with horrible or worse, grade5, mud', draw: (b) => line({ color: rampD(b, 'fourwd'), width: PATH_W, dash: SINGLE }) },
  { title: 'Path, no access answer', sub: 'no motorcycle, motor_vehicle, vehicle or access tag, or unknown (85% of Thai path km): dots; faded in survey mode', draw: (b, v) => dots(b, op(v)) },
  { title: 'Impassable (track or path)', sub: 'smoothness=impassable: no wheeled vehicle, the same dots, not faded (an answer)', draw: (b) => dots(b) },
  { title: 'Closed track', sub: 'motorcycle, motor_vehicle, vehicle or access no, private, agricultural, forestry: thin pale red · CH 13.3%, TH 0.2% of track km', draw: closed() },
  { title: 'Closed path', sub: 'same on a path, keeps the single-track dashes · CH 3.6%, TH 1.8% of path km', draw: closed(SINGLE) },
];
sheet('tracks-solid.svg', 'Scheme D: solid tracks, colour = vehicle needed (white, brown, dark brown, near black), dashes = single track, pale red = closed',
  'Tracks are the main network for an off-road audience, so they get the continuous line. Access: red = someone said no, dots = nobody said yes. Survey mode fades what has no answer: condition on tracks and rideable paths, access on paths. TH / CH: share of km.',
  solid, [
    { title: 'D. Default', bgs: ['land', 'forest', 'night'] },
    { title: 'Survey mode (toggle)', bgs: ['land', 'forest', 'night'], variant: 'survey' },
  ], 640);
for (const [t, bgs] of [['day', ['land', 'forest']], ['night', ['night']]]) {
  const steps = Object.entries(RAMP_D[t]);
  for (const b of bgs) console.error(`D ${t} on ${b}: ` + steps.map(([k, c]) => `${k} ${cr(c, BGS[b].color).toFixed(2)}`).join(', '));
  console.error(`D ${t} steps: ` + steps.slice(1).map(([k, c], i) => `${steps[i][0]}->${k} ${cr(c, steps[i][1]).toFixed(2)}`).join(', '));
}

// ---------- 4. Unpaved and Off-road roads in the fork: five versions, each with an Unpaved track branching off ----------
// Class colours from js/style-spec.js (OSM Carto palette). Widths in style px, approximate: z15 and z13.
const CLASSES = [
  { key: 'minor', name: 'White (unclassified)', w15: 4.5, w13: 2 },
  { key: 'secondary', name: 'Yellow (secondary)', w15: 6, w13: 3 },
  { key: 'primary', name: 'Orange (primary)', w15: 6.5, w13: 3.2 },
  { key: 'trunk', name: 'Red (trunk)', w15: 7, w13: 3.5 },
];
const BRANCH = `M62 31 C 78 40, 96 ${CELL_H - 8}, ${CELL_W - 12} ${CELL_H - 7}`;
const CASING_D = { unpaved: '#8a5a2b', offroad: '#3d2511' }; // brown casing of the tint version
const roadD = (cls, level, w, z13) => (b, v) => {
  const c = SPEC.classes[cls.key];
  const ramp = RAMP_D.day[level];  // roads sheet: unpaved or offroad only
  const tint = level === 'offroad' ? c.offTint : c.lowTint;
  const casing = c.tintCasing ?? c.casing;
  const track = line({ color: RAMP_D.day.unpaved, width: z13 ? 1.5 : TRACK_W, d: BRANCH });
  let r;
  if (level === 'paved') r = line({ color: c.casing, width: w + 1.2 }) + line({ color: c.fill, width: w });
  else if (v === 'brownfill') r = line({ color: casing, width: w + 2 }) + line({ color: ramp, width: w });
  else if (v === 'core') r = line({ color: casing, width: w + 1.2 }) + line({ color: c.fill, width: w }) + line({ color: ramp, width: w * 0.5 });
  else if (v === 'tint') r = line({ color: CASING_D[level], width: w + 2 }) + line({ color: tint, width: w });
  else if (v === 'dashedfill') {
    // Style 3: dashes in a 60% band; below 6 px on screen the plain tint takes over.
    r = line({ color: c.casing, width: w + 1.2 }) + (w * S < 6 ? line({ color: tint, width: w })
      : line({ color: c.fill, width: w }) + line({ color: level === 'offroad' ? c.offDash : c.dash, width: w * 0.6, dash: `${(3.6 * w).toFixed(1)}_${(0.98 * w).toFixed(1)}` }));
  } else r = line({ color: level === 'offroad' ? '#555555' : casing, width: w + 1.6, dash: '11_3' }) + line({ color: level === 'offroad' ? c.offTint : (cls.key === 'minor' ? c.lowTint : c.fill), width: w });
  return track + r;
};
const roads = CLASSES.flatMap((cls) => [
  { title: `${cls.name}, Paved`, sub: 'reference, z15', draw: roadD(cls, 'paved', cls.w15) },
  { title: `${cls.name}, Unpaved`, sub: 'z15', draw: roadD(cls, 'unpaved', cls.w15) },
  { title: `${cls.name}, Off-road`, sub: 'z15', draw: roadD(cls, 'offroad', cls.w15) },
  { title: `${cls.name}, Unpaved`, sub: 'z13 widths', draw: roadD(cls, 'unpaved', cls.w13, true) },
]);
sheet('roads-fork.svg', 'Unpaved and Off-road roads in the fork: five versions, with an Unpaved track (solid brown) branching off',
  'Not in the article. 4 and 5 are the article styles 3 and 4 (approximate; exact in the demo). Light mode only.',
  roads, [
    { title: '1. Brown fill, class casing', bgs: ['land', 'forest'], variant: 'brownfill' },
    { title: '2. Brown core, class edges', bgs: ['land', 'forest'], variant: 'core' },
    { title: '3. Class tint, brown casing', bgs: ['land', 'forest'], variant: 'tint' },
    { title: '4. Dashed fill (style 3)', bgs: ['land', 'forest'], variant: 'dashedfill' },
    { title: '5. Dashed casing (style 4)', bgs: ['land', 'forest'], variant: 'dashedcasing' },
  ], 250);

// ---------- 5. Ramp options: is the three-step dirt ramp easy to tell apart on its own? ----------
// A: the ramp of scheme D. B: wider steps (lighter and warmer Unpaved, pure black 4WD). C: the middle step shifted
// to rust (same lightness as A's), so each level has a look of its own and not only a place in the order.
const RAMPS = {
  A: { title: 'A. Scheme D ramp', day: RAMP_D.day, night: RAMP_D.night },
  B: { title: 'B. Wider steps', day: { unpaved: '#c48a40', high: '#6b3f16', fourwd: '#000000' }, night: { unpaved: '#a06c38', high: '#dcae72', fourwd: '#ffffff' } },
  C: { title: 'C. Rust middle step', day: { unpaved: '#b0773a', high: '#8c3a10', fourwd: '#2b190c' }, night: { unpaved: '#9c6a3a', high: '#ec9a66', fourwd: '#f7e3c6' } },
};
const rampRow = (level, title, sub) => ({ title, sub, draw: (b, v) => line({ color: RAMPS[v][b.night ? 'night' : 'day'][level], width: TRACK_W }) });
sheet('tracks-ramp-options.svg', 'Dirt ramp options for scheme D: the same three levels, three colour sets',
  'Each cell on its own: can the level be named without a neighbour to compare with? Contrast figures printed by the script.',
  [rampRow('unpaved', 'Unpaved', 'nothing says it is rough'), rampRow('high', 'High clearance', 'very_bad, grade4, rock'), rampRow('fourwd', '4WD', 'horrible or worse, grade5, mud')],
  Object.entries(RAMPS).map(([k, r]) => ({ title: r.title, bgs: ['land', 'forest', 'night'], variant: k })), 260);
for (const [k, r] of Object.entries(RAMPS)) for (const [t, bgs] of [['day', ['land', 'forest']], ['night', ['night']]]) {
  const steps = Object.entries(r[t]);
  for (const b of bgs) console.error(`${k} ${t} on ${b}: ` + steps.map(([l, c]) => `${l} ${cr(c, BGS[b].color).toFixed(2)}`).join(', '));
  console.error(`${k} ${t} steps: ` + steps.slice(1).map(([l, c], i) => `${steps[i][0]}->${l} ${cr(c, steps[i][1]).toFixed(2)}`).join(', '));
}

// ---------- 6. Roads in the fork with the vehicle ladder (version 3: class tint fill, brown casing) ----------
// Fill keeps the class hue (the class stays readable), casing takes the track ramp colour of the level, so a road
// and a track of the same level share their colour. Unpaved = lowTint, High clearance = offTint, 4WD = offTint
// darkened 20%. Night from js/style-spec.js dark classes.
const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const ROAD_LEVELS = ['paved', 'unpaved', 'high', 'fourwd'];
const LEVEL_NAME = { paved: 'Paved', unpaved: 'Unpaved', high: 'High clearance', fourwd: '4WD' };
const roadV3 = (cls, level, w) => (b) => {
  const t = b.night ? 'night' : 'day';
  const c = b.night ? SPEC.dark.classes[cls.key] : SPEC.classes[cls.key];
  const track = line({ color: RAMP_D[t].unpaved, width: TRACK_W, d: BRANCH });
  if (level === 'paved') return track + line({ color: c.casing, width: w + 1.2 }) + line({ color: c.fill, width: w });
  const fill = level === 'unpaved' ? c.lowTint : level === 'high' ? c.offTint : mix(c.offTint, b.night ? '#ffffff' : '#000000', 0.2);
  return track + line({ color: RAMP_D[t][level], width: w + 2 }) + line({ color: fill, width: w });
};
const roadsV3 = CLASSES.flatMap((cls) => ROAD_LEVELS.map((level) => ({
  title: `${cls.name}, ${LEVEL_NAME[level]}`, sub: level === 'paved' ? 'reference' : 'class tint fill, casing in the track colour of the level',
  draw: roadV3(cls, level, cls.w15),
})));
sheet('roads-fork-ladder.svg', 'Fork roads, vehicle ladder (version 3, z15)',
  'Not in the article. Class tint fill; casing in the track colour of the level. Branch: an Unpaved track.',
  roadsV3, [{ title: 'Version 3, four levels', bgs: ['land', 'forest', 'night'] }], 250);

// ---------- 7. Unpaved on coloured roads: stronger versions of version 3 ----------
// cur: as roads-fork-ladder. wide: brown casing 1.75 px a side (was 1). wide+tint: same, fill mixed 35% toward the
// Unpaved track brown, so the fill itself turns earthy while keeping its class hue.
const roadUnpaved = (cls, level, w) => (b, v) => {
  const t = b.night ? 'night' : 'day';
  const c = b.night ? SPEC.dark.classes[cls.key] : SPEC.classes[cls.key];
  const track = line({ color: RAMP_D[t].unpaved, width: TRACK_W, d: BRANCH });
  if (level === 'paved') return track + line({ color: c.casing, width: w + 1.2 }) + line({ color: c.fill, width: w });
  const casingW = v === 'cur' ? w + 2 : w + 3.5;
  let fill = level === 'unpaved' ? c.lowTint : c.offTint;
  if (v === 'tint') fill = mix(level === 'unpaved' ? c.fill : c.offTint, RAMP_D[t].unpaved, level === 'unpaved' ? 0.35 : 0.25);
  return track + line({ color: RAMP_D[t][level], width: casingW }) + line({ color: fill, width: w });
};
const strongRows = CLASSES.filter((c) => c.key !== 'minor').flatMap((cls) => ['paved', 'unpaved', 'high'].map((level) => ({
  title: `${cls.name}, ${LEVEL_NAME[level]}`, sub: level === 'paved' ? 'reference' : 'z15', draw: roadUnpaved(cls, level, cls.w15),
})));
sheet('roads-fork-unpaved-strength.svg', 'Unpaved on coloured roads: three strengths (fork, z15)',
  'Not in the article. Current = version 3 as drawn; wide = brown casing 1.75 px a side; wide + tint = fill mixed 35% toward the track brown.',
  strongRows, [
    { title: 'Current', bgs: ['land', 'forest'], variant: 'cur' },
    { title: 'Wide casing', bgs: ['land', 'forest'], variant: 'wide' },
    { title: 'Wide casing + earthy fill', bgs: ['land', 'forest', 'night'], variant: 'tint' },
  ], 250);

// ---------- 8. Grain as the vehicle signal on roads (Julien's idea, 2026-11-13) ----------
// idea: one dirt tint for Unpaved, sparse grain for High clearance, dense grain for 4WD.
// all: grain on every dirt level, density = vehicle (sparse, dense, dense and dark).
// Grain drawn with an SVG mask: dots clipped to the road; dot colour from the class grainDot (js/style-spec.js).
let gid = 0;
const grain = (w, step, r, color, opacity = 1, d = CURVE, cw = CELL_W, ch = CELL_H) => {
  const id = `g${gid++}`;
  return `<defs><pattern id="${id}p" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">` +
    `<circle cx="${step / 2}" cy="${step / 2}" r="${r}" fill="${color}" fill-opacity="${opacity}"/></pattern>` +
    `<mask id="${id}m"><path d="${d}" fill="none" stroke="#fff" stroke-width="${w * S}"/></mask></defs>` +
    `<rect width="${cw}" height="${ch}" fill="url(#${id}p)" mask="url(#${id}m)"/>`;
};
const SPARSE = [5.5, 0.85], DENSE = [3.6, 0.85];
const roadGrain = (cls, level, w) => (b, v) => {
  const t = b.night ? 'night' : 'day';
  const c = b.night ? SPEC.dark.classes[cls.key] : SPEC.classes[cls.key];
  const track = line({ color: RAMP_D[t].unpaved, width: TRACK_W, d: BRANCH });
  const casing = line({ color: c.casing, width: w + 1.2 });
  if (level === 'paved') return track + casing + line({ color: c.fill, width: w });
  const fill = line({ color: c.lowTint, width: w });
  const dot = c.grainDot;
  let g = '';
  if (v === 'idea') g = level === 'high' ? grain(w, ...SPARSE, dot) : level === 'fourwd' ? grain(w, ...DENSE, dot) : '';
  else g = level === 'unpaved' ? grain(w, ...SPARSE, dot, 0.8) : level === 'high' ? grain(w, ...DENSE, dot, 0.8) : grain(w, 3.0, 1.05, b.night ? '#ffffff' : '#000000');
  return track + casing + fill + g;
};
const grainRows = CLASSES.flatMap((cls) => ROAD_LEVELS.map((level) => ({
  title: `${cls.name}, ${LEVEL_NAME[level]}`, sub: level === 'paved' ? 'reference' : 'z15', draw: roadGrain(cls, level, cls.w15),
})));
sheet('roads-fork-grain.svg', 'Grain as the vehicle signal on fork roads (z15)',
  'Not in the article. Class casing and a dirt tint on every dirt level. Idea: grain only from High clearance. All: grain on every dirt level, denser = more vehicle.',
  grainRows, [
    { title: 'Idea: tint, sparse, dense', bgs: ['land', 'forest'], variant: 'idea' },
    { title: 'All dirt grained', bgs: ['land', 'forest', 'night'], variant: 'all' },
  ], 250);

// ---------- 9. Road + track pairings for the fork: one scene per option (2026-11-13) ----------
// Tracks are the same in every option (scheme D: solid, colour = vehicle; dashed = single track; grey dots = path).
// Only the road signal changes. Scene: primary road paved | Unpaved | Off-road (high clearance), an Unpaved white road,
// an Unpaved and an Off-road track, a single track and a hiking path.
const SW = 360, SH = 160;
const SP = {
  pPaved: 'M0 40 L120 40', pUnp: 'M120 40 L240 40', pOff: 'M240 40 L360 40',
  white: 'M80 40 L80 160',
  tUnp: 'M175 40 C 190 90, 225 115, 255 160',
  tOff: 'M300 40 C 305 80, 325 110, 360 125',
  single: 'M80 105 C 115 112, 135 132, 160 160',
  hike: 'M0 125 C 25 115, 55 108, 80 105',
};
const ln = (d, o) => line({ ...o, d });
const roadOpt = (opt, key, level, d, w) => {
  const c = SPEC.classes[key];
  const ramp = RAMP_D.day[level === 'offroad' ? 'high' : 'unpaved'];
  const casingW = w + 1.2;
  if (level === 'paved') return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w });
  const off = level === 'offroad';
  const tint = off ? c.offTint : c.lowTint;
  switch (opt) {
    case 'grain': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: tint, width: w }) +
      grain(w, off ? 3.6 : 5.5, 0.85, c.grainDot, 0.85, d, SW, SH);
    case 'tint': return ln(d, { color: ramp, width: w + 2 }) + ln(d, { color: tint, width: w });
    case 'casing': return ln(d, { color: ramp, width: w + 1.8, dash: '11_3' }) + ln(d, { color: key === 'minor' ? tint : (off ? c.offTint : c.fill), width: w });
    case 'centre': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: off ? c.offTint : (key === 'minor' ? c.fill : c.fill), width: w }) + ln(d, { color: ramp, width: 1.3 });
    case 'dfill': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w }) +
      ln(d, { color: off ? c.offDash : c.dash, width: w * 0.6, dash: `${(3.6 * w).toFixed(1)}_${(0.98 * w).toFixed(1)}` });
    case 'tfull': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w }) +
      ln(d, { color: ramp, width: w, dash: `${(3.6 * w).toFixed(1)}_${(0.98 * w).toFixed(1)}` });
    case 'tband': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w }) +
      ln(d, { color: ramp, width: w * 0.6, dash: `${(3.6 * w).toFixed(1)}_${(0.98 * w).toFixed(1)}` });
    case 'sband': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w }) +
      ln(d, { color: ramp, width: w * 0.6 });
    case 'dfull': return ln(d, { color: c.casing, width: casingW }) + ln(d, { color: c.fill, width: w }) +
      ln(d, { color: off ? c.offDash : c.fullDash, width: w, dash: `${(3.6 * w).toFixed(1)}_${(0.98 * w).toFixed(1)}` });
  }
};
const scene = (opt) => (b) => {
  const day = 'day';
  const t = (d, level, dash = null, w = TRACK_W) => ln(d, { color: RAMP_D[day][level], width: w, dash });
  return t(SP.tUnp, 'unpaved') + t(SP.tOff, 'high') + t(SP.single, 'unpaved', SINGLE, PATH_W) +
    ln(SP.hike, { color: DOTS.day, width: 1.4, dash: '0.1_2.6', cap: 'round' }) +
    roadOpt(opt, 'minor', 'unpaved', SP.white, 4.5) +
    roadOpt(opt, 'primary', 'paved', SP.pPaved, 6.5) + roadOpt(opt, 'primary', 'unpaved', SP.pUnp, 6.5) + roadOpt(opt, 'primary', 'offroad', SP.pOff, 6.5);
};
const OPTIONS = [
  ['grain', '1. Grain fill', 'roads: class tint + dot grain (denser = Off-road). Needs textures: official OsmAnd style only'],
  ['centre', '2. Brown centre line', 'roads: class fill + thin solid brown line, the track colour inside the road. Plugin OK'],
  ['tint', '3. Class tint, brown casing', 'roads: tinted fill, casing in the track colour. Plugin OK; weak on orange and red'],
  ['casing', '4. Dashed casing', 'roads: dashed outline in the track colour. Plugin OK; dashes on roads only'],
  ['dfill', '5. Dashed fill', 'roads: article style 3, dashes in a 60% band. Plugin OK; busiest'],
  ['dfull', '6. Dashed fill, full width', 'roads: article style 5, dashes across the whole road (as Americana). Plugin OK'],
  ['tfull', '7. Dashed fill, full width, track colour', 'roads: as 6, blocks in the track brown (dark brown Off-road). Plugin OK'],
  ['tband', '8. Dashed fill, 60% band, track colour', 'roads: as 5, band in the track brown, class colour kept along both edges. Plugin OK'],
  ['sband', '9. Solid 60% band, track colour', 'roads: a continuous brown band inside the class fill, class colour along both edges; no dashes. Plugin OK'],
];
{
  const LW = 300, top = 70, gap = 10;
  const H = top + OPTIONS.length * (SH + gap) + 20, W = LW + 2 * (SW + gap) + 10;
  let out = text(10, 26, 'Road and track pairings for the fork (z15): same tracks, nine road signals', 17, 700) +
    text(10, 46, 'Primary: paved | Unpaved | Off-road. White road Unpaved. Tracks solid (brown Unpaved, dark brown Off-road), single track dashed, hiking path dots.', 12, 400, MUTED);
  ['land', 'forest'].forEach((bg, j) => { out += text(LW + j * (SW + gap) + SW / 2, top - 6, BGS[bg].name, 12, 400, MUTED, 'middle'); });
  OPTIONS.forEach(([k, title, sub], i) => {
    const y = top + i * (SH + gap);
    out += text(10, y + 24, title, 14, 700) + `<foreignObject x="10" y="${y + 32}" width="${LW - 20}" height="80"><div xmlns="http://www.w3.org/1999/xhtml" style="font:12px Helvetica,Arial,sans-serif;color:${MUTED}">${esc(sub)}</div></foreignObject>`;
    ['land', 'forest'].forEach((bg, j) => {
      out += `<g transform="translate(${LW + j * (SW + gap)} ${y})"><rect width="${SW}" height="${SH}" rx="4" fill="${BGS[bg].color}"/>${scene(k)(BGS[bg])}</g>`;
    });
  });
  writeFileSync(new URL('pairings-fork.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error('mockups/pairings-fork.svg');
}

// ---------- 10. Solid track-colour band on roads: band width test (2026-11-13) ----------
// Row 9 of pairings-fork with white Unpaved roads on the tan fill (article style 4), at three band widths, z15 and z13.
const ZW = { z15: { primary: 6.5, white: 4.5, track: TRACK_W, path: PATH_W }, z13: { primary: 3.2, white: 2, track: 1.5, path: 1 } };
const bandRoad = (key, level, d, w, ratio) => {
  const c = SPEC.classes[key];
  if (level === 'paved') return ln(d, { color: c.casing, width: w + 1.2 }) + ln(d, { color: c.fill, width: w });
  const ramp = RAMP_D.day[level === 'offroad' ? 'high' : 'unpaved'];
  const fill = key === 'minor' ? (level === 'offroad' ? c.offTint : c.lowTint) : c.fill;
  return ln(d, { color: c.casing, width: w + 1.2 }) + ln(d, { color: fill, width: w }) + ln(d, { color: ramp, width: Math.max(w * ratio, 0.8) });
};
const bandScene = (ratio, z) => () => {
  const W = ZW[z];
  const t = (d, level, dash = null, w = W.track) => ln(d, { color: RAMP_D.day[level], width: w, dash });
  return t(SP.tUnp, 'unpaved') + t(SP.tOff, 'high') + t(SP.single, 'unpaved', SINGLE, W.path) +
    ln(SP.hike, { color: DOTS.day, width: z === 'z13' ? 1 : 1.4, dash: '0.1_2.6', cap: 'round' }) +
    bandRoad('minor', 'unpaved', SP.white, W.white, ratio) +
    bandRoad('primary', 'paved', SP.pPaved, W.primary, ratio) + bandRoad('primary', 'unpaved', SP.pUnp, W.primary, ratio) + bandRoad('primary', 'offroad', SP.pOff, W.primary, ratio);
};
{
  const RATIOS = [[0.3, '30% band'], [0.45, '45% band'], [0.6, '60% band']];
  const COLS = [['z15', 'land', 'z15, land'], ['z15', 'forest', 'z15, forest'], ['z13', 'land', 'z13 widths, land']];
  const LW = 220, top = 70, gap = 10;
  const H = top + RATIOS.length * (SH + gap) + 20, W = LW + COLS.length * (SW + gap) + 10;
  let out = text(10, 26, 'Solid band in the track colour: band width, z15 and z13 (white Unpaved roads on the tan fill)', 17, 700) +
    text(10, 46, 'Primary: paved | Unpaved | Off-road. Band = share of the road fill width; minimum 0.8 px. Same tracks as pairings-fork.', 12, 400, MUTED);
  COLS.forEach(([, , label], j) => { out += text(LW + j * (SW + gap) + SW / 2, top - 6, label, 12, 400, MUTED, 'middle'); });
  RATIOS.forEach(([r, label], i) => {
    const y = top + i * (SH + gap);
    out += text(10, y + 24, label, 14, 700);
    COLS.forEach(([z, bg], j) => {
      out += `<g transform="translate(${LW + j * (SW + gap)} ${y})"><rect width="${SW}" height="${SH}" rx="4" fill="${BGS[bg].color}"/>${bandScene(r, z)()}</g>`;
    });
  });
  writeFileSync(new URL('band-width.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error('mockups/band-width.svg');
}

// ---------- 11. Fixed band: band = track width at that zoom, capped at 60% of the road fill, 40% on white roads (2026-11-13) ----------
// One row per class (trunk, primary, unclassified): paved | Unpaved | Off-road, with an Unpaved and an Off-road track
// leaving from the matching part, so the band can be seen continuing into the track.
{
  const ROWS = [['trunk', 'Trunk (red)', { z15: 7, z13: 3.5 }], ['primary', 'Primary (orange)', { z15: 6.5, z13: 3.2 }], ['minor', 'Unclassified (white)', { z15: 4.5, z13: 2 }]];
  const COLS = [['z15', 'land', 'z15, land'], ['z15', 'forest', 'z15, forest'], ['z13', 'land', 'z13, land']];
  const TW = { z15: TRACK_W, z13: 1.5 };
  const RD = { paved: 'M0 50 L120 50', unp: 'M120 50 L240 50', off: 'M240 50 L360 50', tUnp: 'M180 50 C 195 100, 225 125, 255 160', tOff: 'M300 50 C 305 95, 330 120, 360 135' };
  const CAP = (key) => (key === 'minor' ? 0.4 : 0.6); // white roads: wider tan edges, so the road does not read as a track
  const band = (w, z, key) => Math.max(Math.min(TW[z], CAP(key) * w), 0.8);
  const roadPart = (key, level, d, w, z) => {
    const c = SPEC.classes[key];
    if (level === 'paved') return ln(d, { color: c.casing, width: w + 1.2 }) + ln(d, { color: c.fill, width: w });
    const ramp = RAMP_D.day[level === 'offroad' ? 'high' : 'unpaved'];
    // White roads keep their white fill (Julien, 2026-11-13): white edges against the brown core keep the road a road.
    return ln(d, { color: c.casing, width: w + 1.2 }) + ln(d, { color: c.fill, width: w }) + ln(d, { color: ramp, width: band(w, z, key) });
  };
  const cell = (key, widths, z) => {
    const w = widths[z];
    return ln(RD.tUnp, { color: RAMP_D.day.unpaved, width: TW[z] }) + ln(RD.tOff, { color: RAMP_D.day.high, width: TW[z] }) +
      roadPart(key, 'paved', RD.paved, w, z) + roadPart(key, 'unpaved', RD.unp, w, z) + roadPart(key, 'offroad', RD.off, w, z);
  };
  const LW = 260, top = 70, gap = 10;
  const H = top + ROWS.length * (SH + gap) + 20, W = LW + COLS.length * (SW + gap) + 10;
  let out = text(10, 26, 'Fixed band: the track width inside the road, capped at 60% of the fill (40% on white roads)', 17, 700) +
    text(10, 46, 'Paved | Unpaved | Off-road, with an Unpaved and an Off-road track leaving each part. Band: z15 2.5 px, z13 1.5 px (track widths), max 60% of fill (40% on white roads), min 0.8 px.', 12, 400, MUTED);
  COLS.forEach(([, , label], j) => { out += text(LW + j * (SW + gap) + SW / 2, top - 6, label, 12, 400, MUTED, 'middle'); });
  ROWS.forEach(([key, label, widths], i) => {
    const y = top + i * (SH + gap);
    out += text(10, y + 24, label, 14, 700) + text(10, y + 44, `band ${COLS.map(([z]) => z).filter((z, k, a) => a.indexOf(z) === k).map((z) => `${z} ${band(widths[z], z, key).toFixed(1)}/${widths[z]} px`).join(', ')}`, 11, 400, MUTED);
    COLS.forEach(([z, bg], j) => {
      out += `<g transform="translate(${LW + j * (SW + gap)} ${y})"><rect width="${SW}" height="${SH}" rx="4" fill="${BGS[bg].color}"/>${cell(key, widths, z)}</g>`;
    });
  });
  writeFileSync(new URL('band-fixed.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error('mockups/band-fixed.svg');
}

// ---------- 12. Fixed band vs percentage band (2026-11-13) ----------
// Same scene as band-fixed. Fixed: track width, cap 60% (40% white). Percentage: share of the fill, white roads at most 40%.
{
  const ROWS = [['trunk', 'Trunk (red)', { z15: 7, z13: 3.5 }], ['primary', 'Primary (orange)', { z15: 6.5, z13: 3.2 }], ['minor', 'Unclassified (white)', { z15: 4.5, z13: 2 }]];
  const TW = { z15: TRACK_W, z13: 1.5 };
  const COLS = [['fixed', 'z15', 'Fixed (track width), z15'], [0.4, 'z15', '40% of fill, z15'], [0.5, 'z15', '50% of fill, z15'], [0.5, 'z13', '50% of fill, z13']];
  const RD = { paved: 'M0 50 L120 50', unp: 'M120 50 L240 50', off: 'M240 50 L360 50', tUnp: 'M180 50 C 195 100, 225 125, 255 160', tOff: 'M300 50 C 305 95, 330 120, 360 135' };
  const band = (mode, w, z, key) => {
    const cap = key === 'minor' ? 0.4 : 0.6;
    const v = mode === 'fixed' ? Math.min(TW[z], cap * w) : Math.min(mode, key === 'minor' ? 0.4 : 1) * w;
    return Math.max(v, 0.8);
  };
  const part = (key, level, d, w, z, mode) => {
    const c = SPEC.classes[key];
    const base = ln(d, { color: c.casing, width: w + 1.2 }) + ln(d, { color: c.fill, width: w });
    if (level === 'paved') return base;
    return base + ln(d, { color: RAMP_D.day[level === 'offroad' ? 'high' : 'unpaved'], width: band(mode, w, z, key) });
  };
  const LW = 240, top = 70, gap = 10;
  const H = top + ROWS.length * (SH + gap) + 20, W = LW + COLS.length * (SW + gap) + 10;
  let out = text(10, 26, 'Band inside the road: fixed track width vs a share of the fill', 17, 700) +
    text(10, 46, 'Paved | Unpaved | Off-road, tracks leaving each part. White roads capped at 40% in every column; minimum 0.8 px.', 12, 400, MUTED);
  COLS.forEach(([, , label], j) => { out += text(LW + j * (SW + gap) + SW / 2, top - 6, label, 12, 400, MUTED, 'middle'); });
  ROWS.forEach(([key, label, widths], i) => {
    const y = top + i * (SH + gap);
    out += text(10, y + 24, label, 14, 700);
    COLS.forEach(([mode, z], j) => {
      const w = widths[z];
      out += text(10, y + 44 + j * 16, `${COLS[j][2]}: ${band(mode, w, z, key).toFixed(1)}/${w} px`, 11, 400, MUTED);
      const cell = ln(RD.tUnp, { color: RAMP_D.day.unpaved, width: TW[z] }) + ln(RD.tOff, { color: RAMP_D.day.high, width: TW[z] }) +
        part(key, 'paved', RD.paved, w, z, mode) + part(key, 'unpaved', RD.unp, w, z, mode) + part(key, 'offroad', RD.off, w, z, mode);
      out += `<g transform="translate(${LW + j * (SW + gap)} ${y})"><rect width="${SW}" height="${SH}" rx="4" fill="${BGS.land.color}"/>${cell}</g>`;
    });
  });
  writeFileSync(new URL('band-percent.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error('mockups/band-percent.svg');
}
