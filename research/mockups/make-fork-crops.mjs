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
import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import SPEC from '../../js/style-spec.js';
import { classifyDetailed } from '../../js/classify.js';

const Z = 15, CW = 900, CH = 600;
const VIEWS = [
  { country: 'thailand', name: 'chiangrai', lat: 20.0259, lon: 99.678, note: 'moto paths and untagged tracks' },
  { country: 'thailand', name: 'thailand-1', lat: 7.83617, lon: 98.31665, note: 'every track grade, paved tracks, closed network', closedVariants: ['dashed', 'grey'] },
  // switzerland-2: the most closed track km of the three Swiss views (18.5%, against 11.5% and 3.9%), many paved tracks.
  { country: 'switzerland', name: 'switzerland-2', lat: 46.85643, lon: 7.03125, note: 'closed-way density, paved tracks', closedVariants: ['thin', 'crimson', 'dashed', 'grey'] },
  // switzerland-1: 55 km of paths in the crop, the density check for grey dashed paths (2026-11-19).
  { country: 'switzerland', name: 'switzerland-1', lat: 47.69867, lon: 8.62427, note: 'path density', closedVariants: ['greyDots', 'grey', 'greyThin'] },
  // Same centre at z16: driveways appear (grey), the rest as at z15 (widths kept at their z15 values).
  { country: 'switzerland', name: 'switzerland-1-z16', z: 16, lat: 47.69867, lon: 8.62427, note: 'driveways from z16', closedVariants: ['grey'], noFocus: true },
];

// ---------- Scheme D (values from make-track-mockups.mjs, day only) ----------
const LAND = '#f2efe9', INK = '#222', MUTED = '#666';
const RAMP = { unpaved: '#b0773a', high: '#74481f', fourwd: '#2b190c' };
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
    return { kind: 'road', level: d.base === 'paved' ? 'paved' : vehicle(t) };
  }
  if (h === 'track') {
    if (t.smoothness === 'impassable') return { kind: 'dots', level: 'impassable' };
    if (access(t) === 'no') return { kind: 'closedTrack' };
    const d = classifyDetailed(t);
    return { kind: 'track', level: d.base === 'paved' ? 'paved' : vehicle(t) };
  }
  // Footways and cycleways hidden in every focus (Julien, 2026-11-19): a motorbike may never ride them, and in towns
  // they are dense clutter beside the roads. A motorcycle yes still makes them a single track.
  if (['footway', 'cycleway'].includes(h)) return access(t) === 'yes' ? { kind: 'single', level: vehicle(t) } : { kind: 'skip' };
  if (['path', 'bridleway'].includes(h)) {
    if (t.smoothness === 'impassable') return { kind: 'dots', level: 'impassable' };
    const a = access(t);
    if (a === 'no') return { kind: 'closedPath' };
    if (a === 'yes') return { kind: 'single', level: vehicle(t) };
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
  adventure: { title: 'Adventure riding (and 4WD): dirt roads lead, all double tracks, no single tracks', band: [0.75, 0.55], trackW: 2, paths: false },
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

function drawCrop(ways, closed, focus = null, cas = CASINGS.fork) {
  const F = focus ? FOCUS[focus] : {};
  const paths = F.paths ?? true, trackW = F.trackW ?? TRACK_W, singleW = F.singleW ?? PATH_W;
  const tOp = F.trackOpacity ?? 1, bOp = F.bandOpacity ?? 1;
  const op = (o) => (o < 1 ? `<g opacity="${o}">` : '<g>');
  const L = { service: [], closedRoad: [], dots: [], closed: [], single: [], pavedCasing: [], pavedFill: [], track: [], casing: [], fill: [], band: [], sym: [] };
  const roads = [];
  for (const w of ways) {
    const k = w.look;
    const greyStyle = closed.track.color === GREY;
    const dirt = F.dirtTracks ?? true;
    if (k.kind === 'closedRoad') { L.closedRoad.push(stroke(w.pts, { color: GREY, width: ROAD[w.tags.highway][1] })); continue; }
    if (!dirt && (k.kind === 'closedTrack' || (k.kind === 'track' && k.level !== 'paved') || (k.kind === 'dots' && w.tags.highway === 'track'))) continue;
    if (k.kind === 'dots' && greyStyle && w.tags.highway === 'track') L.closed.push(stroke(w.pts, closed.track));
    else if (k.kind === 'dots' && greyStyle) { if (paths) L.dots.push(stroke(w.pts, closed.path)); }
    else if (k.kind === 'dots') { if (paths) L.dots.push(stroke(w.pts, { color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' })); }
    else if (k.kind === 'closedTrack') L.closed.push(stroke(w.pts, closed.track));
    else if (k.kind === 'closedPath') { if (paths) L.closed.push(stroke(w.pts, closed.path)); }
    else if (k.kind === 'single') { if (paths) L.single.push(stroke(w.pts, { color: k.level === 'paved' ? PAVED_TRACK.casing : RAMP[k.level], width: singleW, dash: SINGLE })); }
    else if (k.kind === 'track' && k.level === 'paved') {
      L.pavedCasing.push(stroke(w.pts, { color: F.pavedCasing?.residential ?? cas.white ?? (cas.hierarchy ? MINOR_CASING.residential : PAVED_TRACK.casing), width: trackW + cas.extra }));
      L.pavedFill.push(stroke(w.pts, { color: PAVED_TRACK.fill, width: trackW }));
    } else if (k.kind === 'track') L.track.push(stroke(w.pts, { color: RAMP[k.level], width: trackW }));
    else if (k.kind === 'road') roads.push(w);
    if (F.symbols && /^[0-5]$/.test(w.tags['dirtbike:scale'] ?? '') && k.kind !== 'skip') L.sym.push(symbols(w.pts, w.tags['dirtbike:scale']));
  }
  // Roads: all casings, then fills and bands from the lowest class up, so junctions join cleanly.
  roads.sort((a, b) => RANK.indexOf(a.tags.highway) - RANK.indexOf(b.tags.highway));
  const casingOf = (w, cls, c) => {
    const h = w.tags.highway;
    if (cls !== 'minor') return c.casing;
    if (F.pavedCasing && w.look.level === 'paved') return F.pavedCasing[h];
    return cas.white ?? (cas.hierarchy ? MINOR_CASING[h] : c.casing);
  };
  const [bandMain, bandWhite] = F.band ?? [0.6, 0.4];
  const fillOf = (w, cls, c, width) => {
    let f = stroke(w.pts, { color: c.fill, width });
    if (w.look.level !== 'paved') {
      const band = stroke(w.pts, { color: RAMP[w.look.level], width: Math.max(width * (cls === 'minor' ? bandWhite : bandMain), 0.8) });
      // Faded band: the road fill shows through, drawn as its own fill + band so the fade does not reach the casing.
      f += bOp < 1 ? `<g opacity="${bOp}">${band}</g>` : band;
    }
    return f;
  };
  // Service roads: their own faded group under the other roads (casing, then fill).
  const service = roads.filter((w) => w.tags.highway === 'service'), main = roads.filter((w) => w.tags.highway !== 'service');
  if (service.length) {
    const sc = service.map((w) => stroke(w.pts, { color: casingOf(w, 'minor', SPEC.classes.minor), width: ROAD.service[1] + cas.extra })).join('');
    const sf = service.map((w) => fillOf(w, 'minor', SPEC.classes.minor, ROAD.service[1])).join('');
    L.service.push(`<g opacity="${SERVICE_OPACITY}">${sc}${sf}</g>`);
  }
  // Trail riding: paved roads in their own group at reduced opacity, under the dirt roads.
  const soft = F.pavedRoadOpacity ? main.filter((w) => w.look.level === 'paved') : [];
  const full = F.pavedRoadOpacity ? main.filter((w) => w.look.level !== 'paved') : main;
  if (soft.length) {
    const sc = soft.map((w) => { const [cls, width] = ROAD[w.tags.highway]; return stroke(w.pts, { color: casingOf(w, cls, SPEC.classes[cls]), width: width + cas.extra }); }).join('');
    const sf = soft.map((w) => { const [cls, width] = ROAD[w.tags.highway]; return fillOf(w, cls, SPEC.classes[cls], width); }).join('');
    L.service.push(`<g opacity="${F.pavedRoadOpacity}">${sc}${sf}</g>`);
  }
  for (const w of full) {
    const [cls, width] = ROAD[w.tags.highway];
    L.casing.push(stroke(w.pts, { color: casingOf(w, cls, SPEC.classes[cls]), width: width + cas.extra }));
  }
  for (const w of full) {
    const [cls, width] = ROAD[w.tags.highway];
    L.fill.push(fillOf(w, cls, SPEC.classes[cls], width));
  }
  const out = Object.entries(L).map(([key, a]) => (['track', 'single', 'dots', 'closed'].includes(key) ? op(tOp) : '<g>') + a.join('') + '</g>');
  return `<rect width="${CW}" height="${CH}" fill="${LAND}"/>` + out.join('');
}

// Legend swatches (60 dp lines).
const sw = (parts) => parts.map((o) => stroke([[0, 0], [60, 0]], o)).join('');
function legend(closed) {
  const c = SPEC.classes;
  return [
    ['Coloured road: paved | Unpaved', sw([{ color: c.primary.casing, width: 8.5 }, { color: c.primary.fill, width: 6.5 }]), sw([{ color: c.primary.casing, width: 8.5 }, { color: c.primary.fill, width: 6.5 }, { color: RAMP.unpaved, width: 3.9 }])],
    ['Unclassified: paved | Unpaved', sw([{ color: MINOR_CASING.unclassified, width: 6.5 }, { color: c.minor.fill, width: 4.5 }]), sw([{ color: MINOR_CASING.unclassified, width: 6.5 }, { color: c.minor.fill, width: 4.5 }, { color: RAMP.unpaved, width: 1.8 }])],
    ['Residential | service (faded)', sw([{ color: MINOR_CASING.residential, width: 6 }, { color: c.minor.fill, width: 4 }]), `<g opacity="${SERVICE_OPACITY}">${sw([{ color: MINOR_CASING.service, width: 5 }, { color: c.minor.fill, width: 3 }])}</g>`],
    ['Track: paved | Unpaved', sw([{ color: MINOR_CASING.residential, width: TRACK_W + 2 }, { color: PAVED_TRACK.fill, width: TRACK_W }]), sw([{ color: RAMP.unpaved, width: TRACK_W }])],
    ['Track: high clearance | 4WD', sw([{ color: RAMP.high, width: TRACK_W }]), sw([{ color: RAMP.fourwd, width: TRACK_W }])],
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

// ---------- Run ----------
const NAMES = {
  'road paved': 'Paved road', 'road unpaved': 'Unpaved road', 'road high': 'High-clearance road', 'road fourwd': '4WD road',
  'track paved': 'Paved track', 'track unpaved': 'Unpaved track', 'track high': 'High-clearance track', 'track fourwd': '4WD track',
  'single unpaved': 'Single track', 'single high': 'Single track, high clearance', 'single fourwd': 'Single track, 4WD', 'single paved': 'Single track, paved',
  'dots no answer': 'Path, nobody said yes', 'dots impassable': 'Impassable', service: 'Service road (faded)', 'service closed': 'Service road, private or no (grey)', closedTrack: 'Closed track', closedPath: 'Closed path', closedRoad: 'Closed road (grey)', driveway: 'Driveway (grey)',
};
for (const country of [...new Set(VIEWS.map((v) => v.country))]) {
  const boxes = await load(country, VIEWS.filter((v) => v.country === country));
  for (const { v, ways } of boxes) {
    const km = {};
    for (const w of ways) {
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
