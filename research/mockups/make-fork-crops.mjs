// Real-data crops for the OsmAnd fork (todo "Tracks rendering", 2026-11-19): scheme D tracks and paths with the
// solid band on Unpaved roads (E-tracks.md 6.4), drawn from the real tags of the track-round views
// (examples/track-spots.md), so roads and tracks are seen meeting at junctions.
// Geometry: pbf/<country>-ways.geojsonseq (Geofabrik 2026-11-12, highways only: no landuse, water or buildings), plus
// pbf/<country>-service.geojsonseq for highway=service (2026-11-19, same extract):
//   osmium tags-filter -o pbf/<c>-service.osm.pbf pbf/<c>-latest.osm.pbf w/highway=service
//   osmium export -f geojsonseq --geometry-types=linestring -a type,id -o pbf/<c>-service.geojsonseq pbf/<c>-service.osm.pbf
// Each crop is CW x CH dp of a z15 view (256 px tiles) around the view centre; PNG at 2 x (a phone at density 2).
// Widths in dp are the estimates of make-track-mockups.mjs (not OsmAnd's own).
// Usage (from research/): node mockups/make-fork-crops.mjs && node mockups/svg2png.mjs mockups/fork-crop-*.svg
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import SPEC from '../../js/style-spec.js';
import { classifyDetailed } from '../../js/classify.js';

const Z = 15, CW = 900, CH = 600;
const VIEWS = [
  { country: 'thailand', name: 'chiangrai', lat: 20.0259, lon: 99.678, note: 'moto paths and untagged tracks', landCheck: true, ladderCheck: true },
  { country: 'thailand', name: 'thailand-1', lat: 7.83617, lon: 98.31665, note: 'every track grade, paved tracks, closed network', closedVariants: ['dashed', 'grey'], hivis: true, rampCheck: true, landCheck: true, ladderCheck: true, easyCheck: true },
  // thailand-3: 2.5 km of Unpaved and 3.4 km of Off-road trunk to secondary in the track round, for the main-road
  // designs (2026-11-20).
  { country: 'thailand', name: 'thailand-3', lat: 20.33948, lon: 99.74487, note: 'unpaved main roads', landCheck: true, mainCheck: true, noFocus: true },
  // switzerland-2: the most closed track km of the three Swiss views (18.5%, against 11.5% and 3.9%), many paved tracks.
  { country: 'switzerland', name: 'switzerland-2', lat: 46.85643, lon: 7.03125, note: 'closed-way density, paved tracks', closedVariants: ['thin', 'crimson', 'dashed', 'grey'], landCheck: true, ladderCheck: true },
  // switzerland-1: 55 km of paths in the crop, the density check for grey dashed paths (2026-11-19).
  { country: 'switzerland', name: 'switzerland-1', lat: 47.69867, lon: 8.62427, note: 'path density', closedVariants: ['greyDots', 'grey', 'greyThin'], hivis: true, landCheck: true, easyCheck: true },
  // Same centre at z16: driveways appear (grey), the rest as at z15 (widths kept at their z15 values).
  { country: 'switzerland', name: 'switzerland-1-z16', z: 16, lat: 47.69867, lon: 8.62427, note: 'driveways from z16', closedVariants: ['grey'], noFocus: true },
];

// ---------- Scheme D (values from make-track-mockups.mjs, day only) ----------
const LAND = '#f2efe9', INK = '#222', MUTED = '#666';
// easy (2026-11-20): confirmed for a city car, a lighter tan. high: the earlier middle step, kept for the comparison sheets.
const RAMP = { easy: '#c8a070', unpaved: '#b0773a', high: '#74481f', fourwd: '#2b190c' };
const PAVED_TRACK = { fill: '#ffffff', casing: '#9a9a9a' };
const DOTS = '#6b6b6b', GREY = '#c4bdb4';
const TRACK_W = 2.5, PATH_W = 1.75, SINGLE = '7 3';
// Closed-way styles to compare (todo Low priority, closed tracks and paths): the scheme D thin pale red; crimson at
// track width (closed-track.png A); Julien's light pale red dashed, with a long dash for tracks so it differs from
// the single-track 7/3 (closed paths keep 7/3).
const CLOSED = {
  thin: { title: 'Closed: thin pale red (scheme D)', track: { color: '#e07878', width: 1.4 }, path: { color: '#e07878', width: 1.4, dash: SINGLE } },
  crimson: { title: 'Closed: crimson, track width', track: { color: '#a3245a', width: TRACK_W }, path: { color: '#a3245a', width: PATH_W, dash: SINGLE } },
  dashed: { title: 'Closed: pale red, long dashes', track: { color: '#e07878', width: TRACK_W, dash: '14 4' }, path: { color: '#e07878', width: PATH_W, dash: SINGLE } },
  // Julien, 2026-11-19: closed ways greyed out, not red. Then (same day) paths dashed grey instead of dotted: the pattern
  // says the kind of way (solid = double track, dashed = single track), the colour says whether you may ride it
  // (brown by vehicle needed, grey = you may not). One grey, light and warm, for every way you may not ride: closed
  // tracks, closed paths, paths nobody said yes to, and impassable ways. No dots left in the scheme.
  grey: { title: 'Grey: solid tracks, dashed paths (Julien, 2026-11-19)', track: { color: GREY, width: TRACK_W }, path: { color: GREY, width: PATH_W, dash: SINGLE } },
  greyThin: { title: 'Grey, paths thinner (1.4 dp)', track: { color: GREY, width: TRACK_W }, path: { color: GREY, width: 1.4, dash: SINGLE } },
  // The first grey version (earlier on 2026-11-19): closed and unanswered paths as dark grey dots.
  greyDots: { title: 'Grey, paths as dots (first grey version)', track: { color: GREY, width: TRACK_W }, path: { color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' } },
};
// Road widths at z15 in dp; tertiary and below use the white class.
const ROAD = {
  trunk: ['trunk', 7], primary: ['primary', 6.5], secondary: ['secondary', 6],
  tertiary: ['minor', 5.5], unclassified: ['minor', 4.5], residential: ['minor', 4], service: ['minor', 3],
};
// Casing of white roads by class (Julien, 2026-11-19: casing B, #8f8f8f at 1 dp a side; unclassified darker than
// the minor roads). Tertiary goes with unclassified (Claude's reading). Paved tracks take the residential grey.
const MINOR_CASING = { tertiary: '#6f6f6f', unclassified: '#6f6f6f', residential: '#8f8f8f', service: '#a8a8a8' };
const MINOR_CASING_ROAD = { tertiary: '#4f4f4f', unclassified: '#4f4f4f', residential: '#6f6f6f', service: '#8f8f8f' }; // Road riding focus
// highway=service (Julien, 2026-11-19): often private, so faded by default. Driveways, parking aisles and drive-throughs
// are left out at z15 (OSM Carto shows them from z16). Service roads with a "no" access answer are grey like any way
// you may not ride.
const SERVICE_OPACITY = 0.45, SERVICE_SKIP = new Set(['driveway', 'parking_aisle', 'drive-through']);
const RANK = ['service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk'];

// Vehicle ladder (E-tracks 6.4): smoothness, then tracktype, then surface; 4wd_only as a minimum.
const LADDER = ['unpaved', 'high', 'fourwd'];
function vehicle(t) {
  let v = 'unpaved';
  const s = { very_bad: 'high', horrible: 'fourwd', very_horrible: 'fourwd' }[t.smoothness];
  const g = { grade4: 'high', grade5: 'fourwd', grade6: 'fourwd', grade7: 'fourwd', grade8: 'fourwd' }[t.tracktype];
  const surf = (t.surface ?? '').split(';').map((x) => x.trim());
  if (t.smoothness && ['excellent', 'good', 'intermediate', 'bad', 'very_bad', 'horrible', 'very_horrible'].includes(t.smoothness)) v = s ?? 'unpaved';
  else if (t.tracktype && /^grade[1-8]$/.test(t.tracktype)) v = g ?? 'unpaved';
  else if (surf.includes('mud')) v = 'fourwd';
  else if (surf.includes('rock')) v = 'high';
  const min = { recommended: 'high', yes: 'fourwd', extreme: 'fourwd' }[t['4wd_only']];
  if (min && LADDER.indexOf(min) > LADDER.indexOf(v)) v = min;
  return v;
}
// Confirmed ladder (Julien, 2026-11-20), the default since then: Easy = confirmed for a city car (smoothness
// excellent to bad, or tracktype grade1 or grade2, or surface compacted or fine_gravel), drawn lighter; High clearance
// merges into the default brown with every dirt way whose condition is not confirmed (surface=unpaved, no tag,
// gravel, very_bad, grade3, grade4, rock); 4WD unchanged. Same precedence: smoothness, then tracktype, then surface;
// 4wd_only as a minimum. Why: at Chiang Rai two unclassified roads tagged very_bad were drawn dark next to the
// untagged tracks branching off them, as if the road were the hard part; now only confirmed-easy and 4WD stand out.
let LADDER_MODE = 'confirmed';
function vehicleConfirmed(t) {
  const surf = (t.surface ?? '').split(';').map((x) => x.trim());
  let v;
  if (['excellent', 'good', 'intermediate', 'bad'].includes(t.smoothness)) v = 'easy';
  else if (['very_bad'].includes(t.smoothness)) v = 'unpaved';
  else if (['horrible', 'very_horrible'].includes(t.smoothness)) v = 'fourwd';
  else if (['grade1', 'grade2'].includes(t.tracktype)) v = 'easy';
  else if (['grade3', 'grade4'].includes(t.tracktype)) v = 'unpaved';
  else if (/^grade[5-8]$/.test(t.tracktype ?? '')) v = 'fourwd';
  else if (surf.includes('mud')) v = 'fourwd';
  else if (surf.length && surf.every((x) => ['compacted', 'fine_gravel'].includes(x))) v = 'easy';
  else v = 'unpaved';
  const order = ['easy', 'unpaved', 'fourwd'];
  const min = { recommended: 'unpaved', yes: 'fourwd', extreme: 'fourwd' }[t['4wd_only']];
  if (min && order.indexOf(min) > order.indexOf(v)) v = min;
  return v;
}
const vehicleNow = (t) => (LADDER_MODE === 'confirmed' ? vehicleConfirmed(t) : vehicle(t));
// Access: first of motorcycle, motor_vehicle, vehicle, access that answers (unknown is no answer).
// destination is not a no (Julien, 2026-11-19): common on residential streets, and OsmAnd routes it to reach a place
// on it. Same rule for roads, tracks and paths.
const NO = new Set(['no', 'private', 'agricultural', 'forestry']);
const YES = new Set(['yes', 'designated', 'permissive']);
function access(t) {
  for (const k of ['motorcycle', 'motor_vehicle', 'vehicle', 'access']) {
    const v = t[k];
    if (!v || v === 'unknown') continue;
    return NO.has(v) ? 'no' : YES.has(v) ? 'yes' : 'other';
  }
  return null;
}
// One look per way: { kind, level } with kind road | track | single | dots | closedTrack | closedPath | closedRoad | skip.
function look(t, z = Z) {
  const h = t.highway;
  if (h === 'service') {
    // Driveways lead to a private house or plot: grey from z16 (hidden at z15, too dense). Parking aisles and
    // drive-throughs from z16, faded like other service roads.
    if (SERVICE_SKIP.has(t.service) && z < 16) return { kind: 'skip' };
    if (t.service === 'driveway') return { kind: 'closedRoad' };
  }
  if (ROAD[h] && access(t) === 'no') return { kind: 'closedRoad' }; // closed roads grey (Julien, 2026-11-19)
  if (ROAD[h]) {
    const d = classifyDetailed(t);
    return { kind: 'road', level: d.base === 'paved' ? 'paved' : vehicleNow(t) };
  }
  if (h === 'track') {
    if (t.smoothness === 'impassable') return { kind: 'dots', level: 'impassable' };
    if (access(t) === 'no') return { kind: 'closedTrack' };
    // smoothness=very_horrible: only a bike, ATV or tractor gets through, so drawn as a single track in the 4WD
    // colour (Julien, 2026-11-19; the article classifier's "specialized: could be drawn as a path").
    if (t.smoothness === 'very_horrible') return { kind: 'single', level: 'fourwd' };
    const d = classifyDetailed(t);
    return { kind: 'track', level: d.base === 'paved' ? 'paved' : vehicleNow(t) };
  }
  // Footways and cycleways hidden in every focus (Julien, 2026-11-19): a motorbike may never ride them, and in towns
  // they are dense clutter beside the roads. A motorcycle yes still makes them a single track.
  if (['footway', 'cycleway'].includes(h)) return access(t) === 'yes' ? { kind: 'single', level: vehicleNow(t) } : { kind: 'skip' };
  if (['path', 'bridleway'].includes(h)) {
    if (t.smoothness === 'impassable') return { kind: 'dots', level: 'impassable' };
    const a = access(t);
    if (a === 'no') return { kind: 'closedPath' };
    if (a === 'yes') return { kind: 'single', level: vehicleNow(t) };
    return { kind: 'dots', level: 'no answer' };
  }
  return { kind: 'skip' };
}

// ---------- Geometry ----------
const px = (lon, z = Z) => ((lon + 180) / 360) * 256 * 2 ** z;
const py = (lat, z = Z) => { const r = (lat * Math.PI) / 180; return ((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * 256 * 2 ** z; };
const M_PER_PX = (lat, z = Z) => (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** z);

async function load(country, views) {
  const boxes = views.map((v) => {
    const z = v.z ?? Z;
    const x0 = px(v.lon, z) - CW / 2, y0 = py(v.lat, z) - CH / 2;
    return { v, x0, y0, k: 2 ** (z - Z), ways: [] };
  });
  for (const file of [`${country}-ways`, `${country}-service`]) {
  const rl = createInterface({ input: createReadStream(new URL(`../pbf/${file}.geojsonseq`, import.meta.url)), crlfDelay: Infinity });
  for await (const raw of rl) {
    const line = raw.replace(/^\x1e/, '');
    if (!line) continue;
    const f = JSON.parse(line);
    if (f.geometry?.type !== 'LineString') continue;
    const pts = f.geometry.coordinates.map(([lon, lat]) => [px(lon), py(lat)]);
    for (const b of boxes) {
      const local = pts.map(([x, y]) => [x * b.k - b.x0, y * b.k - b.y0]);
      if (local.some(([x, y]) => x > -20 && x < CW + 20 && y > -20 && y < CH + 20)) b.ways.push({ tags: f.properties, pts: local });
    }
  }
  }
  return boxes;
}

// Length inside the crop, in metres, per look (clipped by sampling each segment).
function lengthInside(pts, lat, z = Z) {
  let m = 0;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
    for (let k = 0; k < n; k++) {
      const x = a[0] + ((b[0] - a[0]) * (k + 0.5)) / n, y = a[1] + ((b[1] - a[1]) * (k + 0.5)) / n;
      if (x >= 0 && x <= CW && y >= 0 && y <= CH) m += Math.hypot(b[0] - a[0], b[1] - a[1]) / n;
    }
  }
  return m * M_PER_PX(lat, z);
}

// ---------- Drawing ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 13, weight = 400, fill = INK) =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const d = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
const stroke = (pts, { color, width, dash = null, cap = null }) =>
  `<path d="${d(pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="${cap ?? (dash ? 'butt' : 'round')}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

// Riding focus (proposal, 2026-11-19): one OsmAnd rendering property with three values. The colour ramp stays the
// same; only the emphasis changes. null = scheme D as drawn above (the Trail riding look without symbols).
//   road: paved leads (darker casing on white roads and paved tracks); the dirt band and dirt tracks fade;
//         single tracks and paths hidden.
//   adventure (and 4WD): dirt roads lead (wider band); every double track kept with the full vehicle ladder, a
//         little thinner than roads; single tracks and paths hidden (no four-wheeler or heavy bike uses them).
//   trail: scheme D, single tracks stronger (dirtbike:scale symbols: documented only, not drawn).
const FOCUS = {
  // Road riding: dirt tracks and closed tracks hidden, not grey (grey = you may not ride it, false for a dirt track);
  // paved tracks kept as narrow roads (Julien, 2026-11-19).
  // The dirt band on roads stays at full strength (Julien, 2026-11-19): on a road day it is the warning that the road
  // turns to dirt.
  road: { title: 'Road riding: paved leads, dirt band as a warning, no dirt tracks, no paths', dirtTracks: false, paths: false, pavedCasing: MINOR_CASING_ROAD },
  adventure: { title: 'Adventure riding (and 4WD): dirt roads lead, all double tracks, no single tracks', band: [0.5, 0.5], trackW: 2, paths: false }, // band 75% -> 50% (Julien, 2026-11-20: class hard to see)
  // dirtbike:scale symbols: not rendered for now (Julien, 2026-11-19), documented in E-tracks 6.4 only. Set
  // symbols: true and pass SYMBOL_LEGEND to the focus sheet to draw them again.
  // Trail riding: paved roads softer (60%), the brown band on dirt roads at full strength (Julien, 2026-11-19).
  trail: { title: 'Trail riding: single tracks stronger, paved roads at 60%', singleW: 2.2, symbols: false, pavedRoadOpacity: 0.6 },
};
// dirtbike:scale symbols (trail focus), drawn with dashes only so core-legacy can draw them too, black on a white
// halo (a second, wider line with the same dashes). Count and length carry the level, no colour and no shape (dots
// and squares could not be told apart at 4 dp, Julien 2026-11-19): 0-1 one dot, 2 two dots, 3 three dots,
// 4-5 a bar. Every 48 dp.
const SYM_S = 4.2, SYM_H = 6.8, SYM_GAP = 6, SYM_BAR = 10, SYM_STEP = 48;
function symbols(pts, scale) {
  const n = +scale;
  const parts = n >= 4 ? [SYM_BAR] : Array(Math.max(n, 1)).fill(0.01);
  const used = parts.reduce((t, x) => t + x, 0) + (parts.length - 1) * SYM_GAP;
  const mark = parts.flatMap((x, i) => (i < parts.length - 1 ? [x, SYM_GAP - (n >= 4 ? 0 : 0.01)] : [x, SYM_STEP - used])).map((x) => +x.toFixed(2)).join(' ');
  const pd = d(pts);
  return `<path d="${pd}" fill="none" stroke="#fff" stroke-width="${SYM_H}" stroke-dasharray="${mark}" stroke-linecap="round"/>` +
    `<path d="${pd}" fill="none" stroke="#222" stroke-width="${SYM_S}" stroke-dasharray="${mark}" stroke-linecap="round"/>`;
}

// Road casing variants (Julien, 2026-11-19: road strokes too soft). white: casing colour of white roads and paved
// tracks (a paved track is a narrow road, so it follows); extra: casing width added to the fill (both sides).
const BADGE = { current: 'Now', darker: 'A', wider: 'B', strong: 'C', thin: 'Thin red', crimson: 'Crimson', dashed: 'Red dashes', grey: 'Grey', greyThin: 'Grey 1.4', greyDots: 'Grey dots', road: 'Road', adventure: 'Adventure', trail: 'Trail' };
const CASINGS = {
  current: { title: 'Current: #bbbbbb, 0.6 dp a side (OSM Carto)', white: null, extra: 1.2 },
  darker: { title: 'A. Darker: #8f8f8f, 0.6 dp a side', white: '#8f8f8f', extra: 1.2 },
  wider: { title: 'B. Darker and wider: #8f8f8f, 1 dp a side', white: '#8f8f8f', extra: 2 },
  strong: { title: 'C. Strong: #6f6f6f, 1 dp a side', white: '#6f6f6f', extra: 2 },
  // The fork default (2026-11-19): B, with the white-road hierarchy of MINOR_CASING.
  fork: { title: 'Fork: B with the class hierarchy', white: null, extra: 2, hierarchy: true },
};

// High-visibility palette (2026-11-19, after the Garmin and DMD2 review): the OSM Carto fills are pastel (secondary
// 1.06, primary 1.20, trunk 1.54 contrast against the land), so the class reads only from its thin casing. Saturated
// fills as on the AdvOSM Garmin maps, every line 1.5 x wider, a dark edge around the dirt band inside coloured roads
// (brown on orange or red is weak), road numbers in shields. Tertiary and below stay white.
const HIVIS = {
  // Band edge: a neutral dark grey, not the 4WD near-black, so an Unpaved band in a coloured road does not read as
  // 4WD (2026-11-19, from the colour rating).
  widthK: 1.5, bandEdge: '#3d3d3d', shields: true,
  classes: {
    trunk: { ...SPEC.classes.trunk, fill: '#e8503a', casing: '#8e2414' },
    primary: { ...SPEC.classes.primary, fill: '#f39c26', casing: '#94560b' },
    secondary: { ...SPEC.classes.secondary, fill: '#f4e04a', casing: '#7d7206' },
  },
};
// High vis 2 (2026-11-19, after mockups/score-readability.py): the red trunk #e8503a and the brown Unpaved track were
// almost the same colour for red-green colour-blind riders (Delta E 7.5), and primary and secondary close for
// tritanopia (15.2). Crimson-rose trunk, deeper orange primary. Score 6.7 -> 8.2 (AdvOSM 9.1).
const HIVIS2 = {
  ...HIVIS,
  // Band 40% on every class (Julien, 2026-11-20: at 60% the class colour hardly showed on main roads); about a track's
  // width on main roads at 1.5 x. Easy as a shape: white track with brown edges, thin centre line on roads.
  band: [0.4, 0.4], easyShape: true,
  // Main roads (Julien, 2026-11-20): the inner band only, no casing change (a casing change is hard to see on a
  // class colour): Easy a thin brown centre line, Unpaved the band with a thick dark edge, 4WD a near-black band.
  main: 'centre',
  land: '#fbfaf6', // the proposed near-white land (Julien, 2026-11-19: kept over the Motorcycle plugin's, easier to read)
  classes: {
    trunk: { ...SPEC.classes.trunk, fill: '#d6336c', casing: '#7a1236' },
    primary: { ...SPEC.classes.primary, fill: '#ef8a1f', casing: '#8a4a08' },
    secondary: HIVIS.classes.secondary,
  },
};
// Rust middle step (2026-11-19, from the colour rating): High clearance in a deep rust instead of dark brown, so the
// middle level has a look of its own and not only a place in the order. #7a3a14 rather than ramp option C's
// #8c3a10, which came closer to the Unpaved brown for colour-blind riders (Delta E 18.6 against 23.1).
const HIVIS2_RUST = { ...HIVIS2, ramp: { ...RAMP, high: '#7a3a14' } };

// The fork default since 2026-11-19 (Julien): High vis 2. Pass null for the OSM Carto based palette.
const DEFAULT_P = HIVIS2;

// Road number shields: one per ref, at the middle of its longest way in the crop, at least 260 dp apart for the
// same ref. trunk to tertiary only.
function shields(roads, K) {
  const placed = [];
  let out = '';
  const ranked = roads.filter((w) => w.tags.ref && ['trunk', 'primary', 'secondary', 'tertiary'].includes(w.tags.highway))
    .map((w) => { let len = 0; for (let i = 1; i < w.pts.length; i++) len += Math.hypot(w.pts[i][0] - w.pts[i - 1][0], w.pts[i][1] - w.pts[i - 1][1]); return { w, len }; })
    .sort((a, b) => b.len - a.len);
  for (const { w, len } of ranked) {
    let acc = 0, mid = w.pts[0];
    for (let i = 1; i < w.pts.length; i++) {
      const d = Math.hypot(w.pts[i][0] - w.pts[i - 1][0], w.pts[i][1] - w.pts[i - 1][1]);
      if (acc + d >= len / 2) { const t = (len / 2 - acc) / d; mid = [w.pts[i - 1][0] + t * (w.pts[i][0] - w.pts[i - 1][0]), w.pts[i - 1][1] + t * (w.pts[i][1] - w.pts[i - 1][1])]; break; }
      acc += d;
    }
    const ref = w.tags.ref.split(';')[0].trim();
    if (mid[0] < 30 || mid[0] > CW - 30 || mid[1] < 20 || mid[1] > CH - 20) continue;
    if (placed.some((p) => (p.ref === ref && Math.hypot(p.x - mid[0], p.y - mid[1]) < 260) || Math.hypot(p.x - mid[0], p.y - mid[1]) < 40)) continue;
    placed.push({ ref, x: mid[0], y: mid[1] });
    const fs = 9 * K, h = fs + 7, wdt = ref.length * fs * 0.62 + 10;
    out += `<rect x="${(mid[0] - wdt / 2).toFixed(1)}" y="${(mid[1] - h / 2).toFixed(1)}" width="${wdt.toFixed(1)}" height="${h}" rx="3" fill="#fff" stroke="#222" stroke-width="1.5"/>` +
      `<text x="${mid[0].toFixed(1)}" y="${(mid[1] + fs * 0.36).toFixed(1)}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="700" fill="#222" text-anchor="middle">${esc(ref)}</text>`;
  }
  return out;
}

function drawCrop(ways, closed, focus = null, cas = CASINGS.fork, P = DEFAULT_P, under = null) {
  // P: palette override (HIVIS below): saturated class colours, every width x widthK, dark edge on the dirt band
  // inside coloured roads, ref shields. null = the OSM Carto based palette.
  const K = P?.widthK ?? 1;
  const st = (pts, o) => stroke(pts, { ...o, width: o.width * K, dash: o.dash && o.cap !== 'round' ? o.dash.split(' ').map((n) => +n * K).join(' ') : o.dash });
  const R = P?.ramp ?? RAMP;
  const C = (cls) => P?.classes?.[cls] ?? SPEC.classes[cls];
  const F = focus ? FOCUS[focus] : {};
  const paths = F.paths ?? true, trackW = F.trackW ?? TRACK_W, singleW = F.singleW ?? PATH_W;
  const tOp = F.trackOpacity ?? 1, bOp = F.bandOpacity ?? 1;
  const op = (o) => (o < 1 ? `<g opacity="${o}">` : '<g>');
  // Layer order. Smooth tracks above rough ones at junctions (Julien, 2026-11-20): 4WD, then Unpaved, then Easy and
  // paved tracks (casing, then fill), so the way a car can take stays continuous where a rough track joins it.
  const L = { service: [], closedRoad: [], dots: [], closed: [], single: [], track4wd: [], track: [], pavedCasing: [], pavedFill: [], casing: [], fill: [], bandEdge: [], band: [], sym: [] };
  const roads = [];
  for (const w of ways) {
    const k = w.look;
    const greyStyle = closed.track.color === GREY;
    const dirt = F.dirtTracks ?? true;
    if (k.kind === 'closedRoad') { L.closedRoad.push(st(w.pts, { color: GREY, width: ROAD[w.tags.highway][1] })); continue; }
    if (!dirt && (k.kind === 'closedTrack' || (k.kind === 'track' && k.level !== 'paved') || (k.kind === 'dots' && w.tags.highway === 'track'))) continue;
    if (k.kind === 'dots' && greyStyle && w.tags.highway === 'track') L.closed.push(st(w.pts, closed.track));
    else if (k.kind === 'dots' && greyStyle) { if (paths) L.dots.push(st(w.pts, closed.path)); }
    else if (k.kind === 'dots') { if (paths) L.dots.push(st(w.pts, { color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' })); }
    else if (k.kind === 'closedTrack') L.closed.push(st(w.pts, closed.track));
    else if (k.kind === 'closedPath') { if (paths) L.closed.push(st(w.pts, closed.path)); }
    // Single tracks: Easy drawn as Unpaved when Easy is a shape (a dashed white core would not read).
    // Paved single track (Julien, 2026-11-20): white dashes with grey edges, like a paved track but dashed, so it no
    // longer looks like the grey dashes of a path you may not ride.
    else if (k.kind === 'single' && k.level === 'paved') { if (paths) L.single.push(st(w.pts, { color: MINOR_CASING.residential, width: singleW + 2, dash: SINGLE }) + st(w.pts, { color: '#ffffff', width: singleW, dash: SINGLE })); }
    else if (k.kind === 'single') { if (paths) L.single.push(st(w.pts, { color: R[k.level === 'easy' && P?.easyShape ? 'unpaved' : k.level], width: singleW, dash: SINGLE })); }
    else if (k.kind === 'track' && k.level === 'paved') {
      L.pavedCasing.push(st(w.pts, { color: F.pavedCasing?.residential ?? cas.white ?? (cas.hierarchy ? MINOR_CASING.residential : PAVED_TRACK.casing), width: trackW + cas.extra }));
      L.pavedFill.push(st(w.pts, { color: PAVED_TRACK.fill, width: trackW }));
    } else if (k.kind === 'track' && k.level === 'easy' && P?.easyShape) {
      // Easy by shape (Julien, 2026-11-20): a track is drawn like a narrow road, dirt always inside. Easy = the paved
      // track (white, grey edges) with a thin brown centre line, the same mark as on Easy roads; Unpaved = all brown
      // (the band fills the track); 4WD = all near black.
      // easyStyle: v1 brown edges on tracks (centre line on roads); v2 grey edges + brown centre line on both;
      // v3 (default since 2026-11-20, Julien) brown edges on both: more brown = rougher (edges, then the whole middle).
      const es = P.easyStyle ?? 'v3';
      if (es === 'v2') {
        L.pavedCasing.push(st(w.pts, { color: cas.white ?? (cas.hierarchy ? MINOR_CASING.residential : PAVED_TRACK.casing), width: trackW + cas.extra }));
        L.pavedFill.push(st(w.pts, { color: PAVED_TRACK.fill, width: trackW }) + st(w.pts, { color: R.unpaved, width: 1 }));
      } else {
        L.pavedCasing.push(st(w.pts, { color: R.unpaved, width: trackW + cas.extra }));
        L.pavedFill.push(st(w.pts, { color: PAVED_TRACK.fill, width: trackW }));
      }
    } else if (k.kind === 'track') L[k.level === 'fourwd' ? 'track4wd' : 'track'].push(st(w.pts, { color: R[k.level], width: trackW }));
    else if (k.kind === 'road') roads.push(w);
    if (F.symbols && /^[0-5]$/.test(w.tags['dirtbike:scale'] ?? '') && k.kind !== 'skip') L.sym.push(symbols(w.pts, w.tags['dirtbike:scale']));
  }
  // Roads: all casings, then fills and bands from the lowest class up, so junctions join cleanly.
  roads.sort((a, b) => RANK.indexOf(a.tags.highway) - RANK.indexOf(b.tags.highway));
  // Main roads (trunk, primary, secondary), P.main (2026-11-20): 'band' = the 40% band; 'centre' = Easy a thin
  // centre line, Unpaved the band with a thicker dark edge, 4WD a near-black band; a number t = Julien's idea, the
  // class fill tinted to t (share of the class colour, the rest white) with a brown casing, near black for 4WD;
  // Easy keeps the full fill with the brown casing.
  const mainStyle = P?.main ?? 'band';
  const mainDirt = (w, cls) => cls !== 'minor' && w.look.level !== 'paved';
  const casingOf = (w, cls, c) => {
    const h = w.tags.highway;
    if (typeof mainStyle === 'number' && mainDirt(w, cls)) return w.look.level === 'fourwd' ? R.fourwd : R.unpaved;
    if (cls !== 'minor') return c.casing;
    if (F.pavedCasing && w.look.level === 'paved') return F.pavedCasing[h];
    return cas.white ?? (cas.hierarchy ? MINOR_CASING[h] : c.casing);
  };
  const [bandMain, bandWhite] = F.band ?? P?.band ?? [0.6, 0.4];
  // Fill, band edge and band of one road, returned apart: every fill is drawn before every band edge, and every edge
  // before every band, so the next way's fill does not cut the band at each joint (gaps seen by Julien, 2026-11-19).
  const fillOf = (w, cls, c, width) => {
    const r = { fill: st(w.pts, { color: c.fill, width }), edge: '', band: '' };
    if (typeof mainStyle === 'number' && mainDirt(w, cls)) {
      if (w.look.level !== 'easy') r.fill = st(w.pts, { color: mix(c.fill, '#ffffff', 1 - mainStyle), width });
      return r;
    }
    // Main-road variants (Julien, 2026-11-20, after the overview): 'plain' = 'centre' without the dark edge;
    // 'shade' = the marks in a darker shade of the class colour (35% toward black), 4WD near black; 'light' = a pale
    // band (75% toward white), car-friendly a pale centre line, 4WD near black.
    if (['plain', 'shade', 'light'].includes(mainStyle) && mainDirt(w, cls)) {
      const fade = (x) => (bOp < 1 ? `<g opacity="${bOp}">${x}</g>` : x);
      const lv = w.look.level;
      const col = lv === 'fourwd' ? R.fourwd : mainStyle === 'shade' ? mix(c.fill, '#000000', 0.35) : mainStyle === 'light' ? mix(c.fill, '#ffffff', 0.75) : R.unpaved;
      r.band = fade(st(w.pts, { color: col, width: lv === 'easy' ? 1.2 : Math.max(width * bandMain, 0.8) }));
      return r;
    }
    if (mainStyle === 'centre' && mainDirt(w, cls)) {
      const fade = (x) => (bOp < 1 ? `<g opacity="${bOp}">${x}</g>` : x);
      if (w.look.level === 'easy') {
        r.edge = fade(st(w.pts, { color: P.bandEdge ?? '#3d3d3d', width: 2.2 }));
        r.band = fade(st(w.pts, { color: R.unpaved, width: 1.2 }));
      } else {
        const bw = Math.max(width * bandMain, 0.8);
        r.edge = fade(st(w.pts, { color: P.bandEdge ?? '#3d3d3d', width: bw + 2 }));
        r.band = fade(st(w.pts, { color: R[w.look.level], width: bw }));
      }
      return r;
    }
    if (w.look.level !== 'paved') {
      const easyLine = w.look.level === 'easy' && P?.easyShape;
      // Easy roads: a thin brown centre line (1 dp), no edge, so the road reads closest to a paved one.
      const bw = easyLine ? 1 : Math.max(width * (cls === 'minor' ? bandWhite : bandMain), 0.8);
      const fade = (x) => (bOp < 1 ? `<g opacity="${bOp}">${x}</g>` : x);
      if (easyLine && (P.easyStyle ?? 'v3') === 'v3') {
        // Easy road, v3: thin brown lines just inside the casing (1 dp each side), class fill between them.
        r.fill = st(w.pts, { color: R.unpaved, width }) + st(w.pts, { color: c.fill, width: Math.max(width - 2, 0.8) });
        return r;
      }
      if (easyLine) { r.band = fade(st(w.pts, { color: R.unpaved, width: bw })); return r; }
      r.band = fade(st(w.pts, { color: R[w.look.level], width: bw }));
      if (P?.bandEdge && cls !== 'minor') r.edge = fade(st(w.pts, { color: P.bandEdge, width: bw + 1.2 }));
    }
    return r;
  };
  const layered = (parts) => ['fill', 'edge', 'band'].map((k) => parts.map((p) => p[k]).join('')).join('');
  // Service roads: their own faded group under the other roads (casing, then fill).
  const service = roads.filter((w) => w.tags.highway === 'service'), main = roads.filter((w) => w.tags.highway !== 'service');
  if (service.length) {
    const sc = service.map((w) => st(w.pts, { color: casingOf(w, 'minor', C('minor')), width: ROAD.service[1] + cas.extra })).join('');
    const sf = layered(service.map((w) => fillOf(w, 'minor', C('minor'), ROAD.service[1])));
    L.service.push(`<g opacity="${SERVICE_OPACITY}">${sc}${sf}</g>`);
  }
  // Trail riding: paved roads in their own group at reduced opacity, under the dirt roads.
  const soft = F.pavedRoadOpacity ? main.filter((w) => w.look.level === 'paved') : [];
  const full = F.pavedRoadOpacity ? main.filter((w) => w.look.level !== 'paved') : main;
  if (soft.length) {
    const sc = soft.map((w) => { const [cls, width] = ROAD[w.tags.highway]; return st(w.pts, { color: casingOf(w, cls, C(cls)), width: width + cas.extra }); }).join('');
    const sf = layered(soft.map((w) => { const [cls, width] = ROAD[w.tags.highway]; return fillOf(w, cls, C(cls), width); }));
    L.service.push(`<g opacity="${F.pavedRoadOpacity}">${sc}${sf}</g>`);
  }
  for (const w of full) {
    const [cls, width] = ROAD[w.tags.highway];
    L.casing.push(st(w.pts, { color: casingOf(w, cls, C(cls)), width: width + cas.extra }));
  }
  for (const w of full) {
    const [cls, width] = ROAD[w.tags.highway];
    const r = fillOf(w, cls, C(cls), width);
    L.fill.push(r.fill); L.bandEdge.push(r.edge); L.band.push(r.band);
  }
  if (P?.shields) L.sym.push(shields(full, K));
  const out = Object.entries(L).map(([key, a]) => (['track4wd', 'track', 'single', 'dots', 'closed'].includes(key) ? op(tOp) : '<g>') + a.join('') + '</g>');
  return (under ?? `<rect width="${CW}" height="${CH}" fill="${P?.land ?? LAND}"/>`) + out.join('');
}

// Legend swatches (60 dp lines).
const sw = (parts) => parts.map((o) => stroke([[0, 0], [60, 0]], o)).join('');
function legend(closed) {
  const c = { ...SPEC.classes, ...(DEFAULT_P?.classes ?? {}) }; // swatch colours of the default palette
  return [
    ['Coloured road: paved | Unpaved', sw([{ color: c.primary.casing, width: 8.5 }, { color: c.primary.fill, width: 6.5 }]), sw([{ color: c.primary.casing, width: 8.5 }, { color: c.primary.fill, width: 6.5 }, { color: RAMP.unpaved, width: 3.9 }])],
    ['Unclassified: paved | Unpaved', sw([{ color: MINOR_CASING.unclassified, width: 6.5 }, { color: c.minor.fill, width: 4.5 }]), sw([{ color: MINOR_CASING.unclassified, width: 6.5 }, { color: c.minor.fill, width: 4.5 }, { color: RAMP.unpaved, width: 1.8 }])],
    ['Residential | service (faded)', sw([{ color: MINOR_CASING.residential, width: 6 }, { color: c.minor.fill, width: 4 }]), `<g opacity="${SERVICE_OPACITY}">${sw([{ color: MINOR_CASING.service, width: 5 }, { color: c.minor.fill, width: 3 }])}</g>`],
    ['Track: paved | Unpaved', sw([{ color: MINOR_CASING.residential, width: TRACK_W + 2 }, { color: PAVED_TRACK.fill, width: TRACK_W }]), sw([{ color: RAMP.unpaved, width: TRACK_W }])],
    ['Track: car friendly | 4WD', sw([{ color: RAMP.unpaved, width: TRACK_W + 2 }, { color: '#ffffff', width: TRACK_W }]), sw([{ color: RAMP.fourwd, width: TRACK_W }])],
    ...(closed.track.color === GREY
      ? [['Single track (motorcycle=yes)', sw([{ color: RAMP.unpaved, width: PATH_W, dash: SINGLE }]), ''],
         ['You may not ride it: track | path', sw([closed.track]), sw([closed.path])],
         ['Closed road | driveway (z16+)', sw([{ color: GREY, width: 4.5 }]), sw([{ color: GREY, width: 3 }])]]
      : [['Single track (motorcycle=yes) | path, nobody said yes', sw([{ color: RAMP.unpaved, width: PATH_W, dash: SINGLE }]), sw([{ color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' }])],
         ['Closed: track | path', sw([closed.track]), sw([closed.path])]]),
  ];
}

function sheet(file, heading, note, panels, extra = '') {
  // Panels in a grid, two per row when there are more than two, each with a large badge (A, B, Road...) so the
  // variant can be named when the sheet is viewed shrunk (Julien, 2026-11-19: no letters visible).
  const LW = 330, top = 64, gap = 14, PH = 30 + CH + gap;
  const cols = panels.length > 2 ? 2 : panels.length, nrows = Math.ceil(panels.length / cols);
  const W = LW + cols * (CW + gap) + 6, H = Math.max(top + nrows * PH + 4, top + 24 + CH + 14);
  let out = text(10, 26, heading, 17, 700) + text(10, 46, note, 12, 400, MUTED);
  panels.forEach((p, j) => {
    const x = LW + (j % cols) * (CW + gap), y0 = top + Math.floor(j / cols) * PH;
    const badge = p.badge ? `<rect x="10" y="10" width="${24 + p.badge.length * 23}" height="48" rx="6" fill="#222" fill-opacity="0.85"/>` +
      `<text x="21" y="46" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">${esc(p.badge)}</text>` : '';
    out += text(x, y0 + 18, p.title, 16, 700) +
      `<g transform="translate(${x} ${y0 + 30})"><clipPath id="c${j}"><rect width="${CW}" height="${CH}" rx="4"/></clipPath><g clip-path="url(#c${j})">${p.svg}</g>${badge}</g>`;
  });
  // Legend for the first panel's closed style; the closed row repeats for each panel style.
  const rows = legend(panels[0].closed);
  rows.forEach(([label, a, b], i) => {
    const y = top + 40 + i * 44;
    out += `<rect x="6" y="${y - 12}" width="146" height="24" rx="3" fill="${LAND}"/>` +
      `<g transform="translate(12 ${y})">${a}</g><g transform="translate(86 ${y})">${b}</g>` +
      `<foreignObject x="160" y="${y - 14}" width="${LW - 170}" height="44"><div xmlns="http://www.w3.org/1999/xhtml" style="font:12px Helvetica,Arial,sans-serif;color:${INK}">${esc(label)}</div></foreignObject>`;
  });
  let y = top + 40 + rows.length * 44;
  if (panels.length > 1) {
    panels.slice(1).filter((p) => p.closed !== panels[0].closed).forEach((p) => {
      out += `<rect x="6" y="${y - 12}" width="146" height="24" rx="3" fill="${LAND}"/><g transform="translate(12 ${y})">${sw([p.closed.track])}</g><g transform="translate(86 ${y})">${sw([p.closed.path])}</g>` +
        text(160, y + 4, `Closed, ${p.key}: track | path`, 12);
      y += 44;
    });
  }
  if (extra) { out += `<g transform="translate(0 ${y - 10})">${extra.svg}</g>`; y += extra.h; }
  out += `<foreignObject x="6" y="${y}" width="${LW - 16}" height="${H - y - 10}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:11px Helvetica,Arial,sans-serif;color:${MUTED};line-height:1.4">${panels[0].stats}</div></foreignObject>`;
  writeFileSync(new URL(file, import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error(`mockups/${file}`);
}

// dirtbike:scale legend: symbols on a sample single track (no real tags: none in these views, and the Thai ones
// in the extract are not to be shown, see the todo).
const SYMBOL_LEGEND = (() => {
  const rows = [['0', '0-1: one dot'], ['2', '2: two dots'], ['3', '3: three dots'], ['5', '4-5: a bar']];
  let svg = text(10, 0, 'Trail riding: dirtbike:scale (sample line)', 12, 700);
  rows.forEach(([v, label], i) => {
    const y = 22 + i * 30, pts = [[12, y], [140, y]];
    svg += `<rect x="6" y="${y - 12}" width="146" height="24" rx="3" fill="${LAND}"/>` + stroke(pts, { color: RAMP.unpaved, width: 2.2, dash: SINGLE }) +
      symbols([[12 + 14, y], [140, y]], v) + text(160, y + 4, label, 12);
  });
  return { svg, h: 22 + rows.length * 30 + 10 };
})();

// Contrast against the land (WCAG luminance ratio; 3 is the usual floor for lines that must be seen).
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).reduce((t, c, i) => t + c * [0.2126, 0.7152, 0.0722][i], 0);
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => p - q); return (y + 0.05) / (x + 0.05); };
const CONTRAST = (() => {
  const rows = [
    ['Trunk fill', SPEC.classes.trunk.fill, HIVIS.classes.trunk.fill], ['Primary fill', SPEC.classes.primary.fill, HIVIS.classes.primary.fill],
    ['Secondary fill', SPEC.classes.secondary.fill, HIVIS.classes.secondary.fill], ['Trunk casing', SPEC.classes.trunk.casing, HIVIS.classes.trunk.casing],
    ['Primary casing', SPEC.classes.primary.casing, HIVIS.classes.primary.casing], ['Secondary casing', SPEC.classes.secondary.casing, HIVIS.classes.secondary.casing],
    ['Unclassified casing', MINOR_CASING.unclassified, MINOR_CASING.unclassified], ['Residential casing', MINOR_CASING.residential, MINOR_CASING.residential],
    ['Unpaved brown', RAMP.unpaved, RAMP.unpaved], ['Grey (may not ride)', GREY, GREY],
  ];
  let svg = text(10, 0, 'Contrast against the land: now | high vis', 12, 700);
  rows.forEach(([n, a, b], i) => {
    const y = 20 + i * 18;
    svg += `<rect x="10" y="${y - 10}" width="12" height="12" fill="${a}"/><rect x="26" y="${y - 10}" width="12" height="12" fill="${b}"/>` +
      text(46, y, `${n}: ${cr(a, LAND).toFixed(2)} | ${cr(b, LAND).toFixed(2)}`, 11, 400, INK);
  });
  return { svg, h: 20 + rows.length * 18 + 14 };
})();

// ---------- Landcover (E-tracks 6.5, 2026-11-19) ----------
// pbf/land-<view>.geojsonseq: landuse, natural, waterway and leisure=park around each view (osmium extract -b, then
// tags-filter and export from the Geofabrik 2026-11-12 files). Areas from their polygons only; rivers and streams as
// lines. Three backgrounds: OSM Carto, the OsmAnd Motorcycle plugin (enduro.render.xml f0676ed) and the proposal.
const LANDS = {
  carto: { title: 'OSM Carto', land: '#f2efe9', forest: '#add19e', scrub: '#c8d7ab', grass: '#cdebb0', farmland: '#eef0d5', residential: '#e0dfdf', water: '#aad3df', sand: '#f5e9c6', rock: '#eee5dc' },
  moto: { title: 'OsmAnd Motorcycle plugin', land: '#f9f9ef', forest: '#dce6d0', scrub: '#e9efd9', grass: '#e3f6e3', farmland: null, residential: null, water: '#80b0ff', sand: null, rock: null },
  proposal: { title: 'Proposal: near-white land, pale forest', land: '#fbfaf6', forest: '#e2ebd8', scrub: '#edf3e4', grass: '#edf3e4', farmland: null, residential: '#f1f0ed', water: '#9cc3ea', sand: '#f6f1e2', rock: '#efeeeb' },
  // sand (2026-11-20): pale, not Carto's yellow, so the tan Easy track stays readable on deserts and beaches
  // (contrast 2.13 against 1.99 on #f5e9c6). rock: a light neutral grey.
};
const LAND_CLASS = (p) => {
  const t = (k, ...v) => v.includes(p[k]);
  if (t('landuse', 'forest') || t('natural', 'wood')) return 'forest';
  if (t('natural', 'sand', 'beach')) return 'sand';
  if (t('natural', 'bare_rock', 'scree', 'shingle')) return 'rock';
  if (t('natural', 'scrub', 'heath')) return 'scrub';
  if (t('landuse', 'grass', 'meadow') || t('natural', 'grassland') || t('leisure', 'park')) return 'grass';
  if (t('landuse', 'farmland', 'orchard', 'vineyard', 'plantation')) return 'farmland';
  if (t('landuse', 'residential', 'commercial', 'industrial', 'retail')) return 'residential';
  if (t('natural', 'water') || t('waterway', 'riverbank') || t('landuse', 'reservoir', 'basin')) return 'water';
  return null;
};
const LAND_ORDER = ['farmland', 'residential', 'sand', 'rock', 'grass', 'scrub', 'forest', 'water'];
function loadLand(v) {
  const f = new URL(`../pbf/land-${v.name}.geojsonseq`, import.meta.url);
  if (!existsSync(f)) return null;
  const z = v.z ?? Z, x0 = px(v.lon, z) - CW / 2, y0 = py(v.lat, z) - CH / 2;
  const P = ([lon, lat]) => [px(lon, z) - x0, py(lat, z) - y0];
  const areas = [], lines = [];
  for (const raw of readFileSync(f, 'utf8').split('\n')) {
    const line = raw.replace(/^\x1e/, '');
    if (!line) continue;
    const ft = JSON.parse(line), g = ft.geometry, p = ft.properties;
    if (g?.type === 'MultiPolygon' || g?.type === 'Polygon') {
      const cls = LAND_CLASS(p);
      if (!cls) continue;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      const dd = polys.map((poly) => poly.map((ring) => 'M' + ring.map((c) => P(c).map((n) => n.toFixed(1)).join(' ')).join('L') + 'Z').join('')).join('');
      areas.push({ cls, d: dd });
    } else if (g?.type === 'LineString' && ['river', 'stream', 'canal'].includes(p.waterway)) {
      lines.push({ w: p.waterway === 'stream' ? 1.2 : 2.5, pts: g.coordinates.map(P) });
    }
  }
  return { areas, lines };
}
function drawLand(land, pal) {
  let out = `<rect width="${CW}" height="${CH}" fill="${pal.land}"/>`;
  for (const cls of LAND_ORDER) {
    if (!pal[cls]) continue;
    out += land.areas.filter((a) => a.cls === cls).map((a) => `<path d="${a.d}" fill="${pal[cls]}" fill-rule="evenodd"/>`).join('');
  }
  out += land.lines.map((l) => stroke(l.pts, { color: pal.water, width: l.w })).join('');
  return out;
}

const mix = (hex, to, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + parseInt(to.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');

// ---------- Run ----------
const NAMES = {
  'road paved': 'Paved road', 'road easy': 'Car-friendly road', 'track easy': 'Car-friendly track', 'single easy': 'Single track, car friendly', 'road unpaved': 'Unpaved road', 'road high': 'High-clearance road', 'road fourwd': '4WD road',
  'track paved': 'Paved track', 'track unpaved': 'Unpaved track', 'track high': 'High-clearance track', 'track fourwd': '4WD track',
  'single unpaved': 'Single track', 'single high': 'Single track, high clearance', 'single fourwd': 'Single track, 4WD', 'single paved': 'Single track, paved',
  'dots no answer': 'Path, nobody said yes', 'dots impassable': 'Impassable', service: 'Service road (faded)', 'service closed': 'Service road, private or no (grey)', closedTrack: 'Closed track', closedPath: 'Closed path', closedRoad: 'Closed road (grey)', driveway: 'Driveway (grey)',
};
for (const country of [...new Set(VIEWS.map((v) => v.country))]) {
  const boxes = await load(country, VIEWS.filter((v) => v.country === country));
  for (const { v, ways } of boxes) {
    const km = {};
    for (const w of ways) {
      LADDER_MODE = 'ladder3'; w.look3 = look(w.tags, v.z ?? Z); LADDER_MODE = 'confirmed';
      w.look = look(w.tags, v.z ?? Z);
      if (w.look.kind === 'skip') continue;
      const key = w.tags.service === 'driveway' ? 'driveway' : w.tags.highway === 'service' ? (w.look.kind === 'closedRoad' ? 'service closed' : 'service') : w.look.level ? `${w.look.kind} ${w.look.level}` : w.look.kind;
      km[key] = (km[key] ?? 0) + lengthInside(w.pts, v.lat, v.z ?? Z) / 1000;
    }
    const rows = Object.entries(km).filter(([, k]) => k >= 0.05).sort((a, b) => b[1] - a[1]);
    const trackKm = rows.filter(([k]) => k.startsWith('track') || k === 'closedTrack').reduce((s, [, k]) => s + k, 0);
    const closedShare = trackKm ? (100 * (km.closedTrack ?? 0)) / trackKm : 0;
    console.error(`${v.name}: ` + rows.map(([k, n]) => `${NAMES[k] ?? k} ${n.toFixed(1)}`).join(', ') + `; closed ${closedShare.toFixed(1)}% of track km`);
    const stats = `<b>In this crop</b> (km): ` + rows.map(([k, n]) => `${esc(NAMES[k] ?? k)} ${n.toFixed(1)}`).join(', ') +
      `. Closed: ${closedShare.toFixed(1)}% of track km.`;
    const panels = (v.closedVariants ?? ['thin']).map((key) => ({ key, badge: v.closedVariants ? BADGE[key] : null, title: v.closedVariants ? CLOSED[key].title : `${v.name}, z${v.z ?? Z}`, closed: CLOSED[key], svg: drawCrop(ways, CLOSED[key]), stats }));
    sheet(`fork-crop-${v.name}.svg`,
      `Fork, real data: ${v.name} at z${v.z ?? Z} (${v.note})`,
      `Scheme D tracks and paths with the solid band on Unpaved roads (E-tracks 6.4), from the tags of the Geofabrik 2026-11-12 extract. ${CW} x ${CH} dp around ${v.lat}, ${v.lon}; highways only, no landuse. Light mode.`,
      panels);
    // Riding focus sheets: the same crop three ways, closed ways grey.
    if (v.hivis) {
      const hp = [
        { key: 'now', badge: 'Carto', title: 'Before: OSM Carto based palette, z15 widths', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, null), stats },
        { key: 'hivis', badge: 'High vis', title: 'High visibility: saturated fills, 1.5 x widths, dark band edge, road numbers', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, HIVIS), stats },
        { key: 'hivis2', badge: 'High vis 2', title: 'High vis 2 (the fork default): crimson-rose trunk, deeper orange, colour-blind safe', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, HIVIS2), stats },
      ];
      sheet(`fork-hivis-${v.name}.svg`, `Fork, high visibility: ${v.name} at z${v.z ?? Z}`,
        'For a handlebar screen in sunlight and older eyes (Julien, 2026-11-19), after the AdvOSM Garmin and DMD2 review. Contrast of each colour against the land in the legend column.',
        hp, CONTRAST);
    }
    const land = v.landCheck ? loadLand(v) : null;
    if (land) {
      const lp = Object.entries(LANDS).map(([k, pal]) => ({ key: k, badge: { carto: 'Carto', moto: 'Moto', proposal: 'Proposal' }[k], title: pal.title,
        closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, DEFAULT_P, drawLand(land, pal)), stats }));
      sheet(`fork-land-${v.name}.svg`, `Fork, land colours: ${v.name} at z${v.z ?? Z}`,
        `High vis 2 over three backgrounds, with the landcover of the Geofabrik 2026-11-12 extract (${land.areas.length} areas). Farmland not drawn in Moto and Proposal (as the plugin).`, lp);
    }
    if (v.ladderCheck) {
      const old = ways.map((w) => ({ ...w, look: w.look3 }));
      const lp2 = [
        { key: 'ladder3', badge: 'Before', title: 'Before: Unpaved, High clearance (dark brown), 4WD', closed: CLOSED.grey, svg: drawCrop(old, CLOSED.grey, null, CASINGS.fork, DEFAULT_P, land ? drawLand(land, LANDS.proposal) : null), stats },
        { key: 'confirmed', badge: 'Confirmed', title: 'Confirmed ladder: Easy (tan, confirmed for a car), not confirmed (brown), 4WD', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, DEFAULT_P, land ? drawLand(land, LANDS.proposal) : null), stats },
      ];
      sheet(`fork-ladder-${v.name}.svg`, `Fork, condition ladder: ${v.name} at z${v.z ?? Z}`,
        'Julien, 2026-11-20: High clearance drawn like every unconfirmed dirt way; a lighter tan where a city car is confirmed (smoothness bad or better, grade1 or 2, compacted, fine_gravel).', lp2);
    }
    if (v.mainCheck) {
      const mv = [['centre', 'Now', 'Now (B): brown band with thick dark edge', 'centre'], ['plain', 'a', 'a: brown band, no edge', 'plain'],
        ['shade', 'b', 'b: darker shade of the class colour', 'shade'], ['light', 'c', 'c: light band', 'light']];
      const mp = mv.map(([key, badge, title, m]) => ({ key, badge, title, closed: CLOSED.grey,
        svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, { ...DEFAULT_P, main: m }, land ? drawLand(land, LANDS.proposal) : null), stats }));
      sheet(`fork-main-${v.name}.svg`, `Fork, unpaved main roads: ${v.name} at z${v.z ?? Z}`,
        'Main roads: four ways to mark Car friendly, Unpaved and 4WD (Julien, 2026-11-20). Tracks and white roads as adopted (brown edges).', mp);
    }
    if (v.easyCheck && land) {
      const vs = [['v1', 'v1', 'v1: tracks brown edges, roads brown centre line'], ['v2', 'v2', 'v2: grey edges and brown centre line on both'], ['v3', 'v3', 'v3: brown edges on both (more brown = rougher)']];
      const sp = vs.map(([key, badge, title]) => ({ key, badge, title, closed: CLOSED.grey,
        svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, { ...DEFAULT_P, easyStyle: key }, drawLand(land, LANDS.proposal)), stats }));
      sheet(`fork-easyshape-${v.name}.svg`, `Fork, Easy shape: ${v.name} at z${v.z ?? Z}`,
        'Easy = confirmed for a city car. Three ways to draw it as a shape (Julien, 2026-11-20). Unpaved: solid brown track, brown band in roads; 4WD near black.', sp);
    }
    if (v.easyCheck) {
      // Easy level by hue (Julien, 2026-11-20: the tan is only a lighter brown, it needs a hue of its own). Green and
      // olive fail for red-green colour blindness against the brown (Delta E 6 and 2), teal against the grey casings.
      const ev = [['tan', 'Tan', 'Tan #c8a070 (lighter brown)', '#c8a070'], ['blue', 'Blue', 'Slate blue #4a6fb0', '#4a6fb0'], ['purple', 'Purple', 'Purple #8a5aa8', '#8a5aa8'], ['mauve', 'Mauve', 'Mauve #9c74b8 (same weight as the brown)', '#9c74b8']];
      const ep = ev.map(([key, badge, title, c]) => ({ key, badge, title, closed: CLOSED.grey,
        svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, { ...DEFAULT_P, easyShape: false, band: [0.6, 0.4], ramp: { ...RAMP, easy: c } }, land ? drawLand(land, LANDS.proposal) : null), stats }));
      sheet(`fork-easy-${v.name}.svg`, `Fork, Easy level hue: ${v.name} at z${v.z ?? Z}`,
        'Easy = confirmed for a city car (smoothness bad or better, grade1 or 2, compacted, fine_gravel). Same map, three colours for that level.', ep);
    }
    if (v.rampCheck) {
      const rp = [
        { key: 'ramp', badge: 'Brown', title: 'Current ramp: brown, dark brown, near black', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey), stats },
        { key: 'rust', badge: 'Rust', title: 'Rust middle step: High clearance #7a3a14', closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS.fork, HIVIS2_RUST), stats },
      ];
      sheet(`fork-ramp-${v.name}.svg`, `Fork, track ramp: ${v.name} at z15`,
        'Can a lone High-clearance track be named at a glance? Same map, two middle steps. High vis 2, band edge neutral grey, very_horrible tracks as single tracks.', rp);
    }
    if (v.noFocus) continue;
    const fpanels = Object.keys(FOCUS).map((f) => ({ key: f, badge: BADGE[f], title: FOCUS[f].title, closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, f), stats }));
    sheet(`fork-focus-${v.name}.svg`,
      `Fork, riding focus: ${v.name} at z15 (${v.note})`,
      `One rendering property, three values (proposal). Same tags, same colours; only the emphasis changes. Closed ways grey.`,
      fpanels);
    if (v.casingCheck) {
      const cpanels = Object.keys(CASINGS).map((k) => ({ key: k, badge: BADGE[k], title: CASINGS[k].title, closed: CLOSED.grey, svg: drawCrop(ways, CLOSED.grey, null, CASINGS[k]), stats }));
      sheet(`fork-casing-${v.name}.svg`, `Fork, road casing: ${v.name} at z15`,
        'Road strokes too soft (Julien, 2026-11-19): four casings. White roads and paved tracks take the grey; coloured roads keep their class casing, at the same width. Scheme D, grey for every way you may not ride.',
        cpanels);
    }
  }
}
