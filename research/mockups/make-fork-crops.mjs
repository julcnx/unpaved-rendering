// Real-data crops for the OsmAnd fork (todo "Tracks rendering", 2026-11-19): scheme D tracks and paths with the
// solid band on Unpaved roads (E-tracks.md 6.4), drawn from the real tags of the track-round views
// (examples/track-spots.md), so roads and tracks are seen meeting at junctions.
// Geometry: pbf/<country>-ways.geojsonseq (Geofabrik 2026-11-12, highways only: no landuse, water or buildings).
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
];

// ---------- Scheme D (values from make-track-mockups.mjs, day only) ----------
const LAND = '#f2efe9', INK = '#222', MUTED = '#666';
const RAMP = { unpaved: '#b0773a', high: '#74481f', fourwd: '#2b190c' };
const PAVED_TRACK = { fill: '#ffffff', casing: '#9a9a9a' };
const DOTS = '#6b6b6b';
const TRACK_W = 2.5, PATH_W = 1.75, SINGLE = '7 3';
// Closed-way styles to compare (todo Low priority, closed tracks and paths): the scheme D thin pale red; crimson at
// track width (closed-track.png A); Julien's light pale red dashed, with a long dash for tracks so it differs from
// the single-track 7/3 (closed paths keep 7/3).
const CLOSED = {
  thin: { title: 'Closed: thin pale red (scheme D)', track: { color: '#e07878', width: 1.4 }, path: { color: '#e07878', width: 1.4, dash: SINGLE } },
  crimson: { title: 'Closed: crimson, track width', track: { color: '#a3245a', width: TRACK_W }, path: { color: '#a3245a', width: PATH_W, dash: SINGLE } },
  dashed: { title: 'Closed: pale red, long dashes', track: { color: '#e07878', width: TRACK_W, dash: '14 4' }, path: { color: '#e07878', width: PATH_W, dash: SINGLE } },
  // Julien, 2026-11-19: closed ways greyed out, not red. One rule: brown = you may ride it, grey = you may not.
  // Closed track: light warm grey, solid, track width (apart from the paved-track casing #9a9a9a and the dots #6b6b6b).
  // Closed path: the same grey dots as a path nobody said yes to.
  grey: { title: 'Closed: grey (Julien, 2026-11-19)', track: { color: '#c4bdb4', width: TRACK_W }, path: { color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' } },
};
// Road widths at z15 in dp; tertiary and below use the white class.
const ROAD = {
  trunk: ['trunk', 7], primary: ['primary', 6.5], secondary: ['secondary', 6],
  tertiary: ['minor', 5.5], unclassified: ['minor', 4.5], residential: ['minor', 4],
};
const RANK = ['residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk'];

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
const NO = new Set(['no', 'private', 'agricultural', 'forestry', 'destination']);
const YES = new Set(['yes', 'designated', 'permissive']);
function access(t) {
  for (const k of ['motorcycle', 'motor_vehicle', 'vehicle', 'access']) {
    const v = t[k];
    if (!v || v === 'unknown') continue;
    return NO.has(v) ? 'no' : YES.has(v) ? 'yes' : 'other';
  }
  return null;
}
// One look per way: { kind, level } with kind road | track | single | dots | closedTrack | closedPath | skip.
function look(t) {
  const h = t.highway;
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
  if (['path', 'footway', 'bridleway', 'cycleway'].includes(h)) {
    if (t.smoothness === 'impassable') return { kind: 'dots', level: 'impassable' };
    const a = access(t);
    if (a === 'no') return { kind: 'closedPath' };
    if (a === 'yes') return { kind: 'single', level: vehicle(t) };
    return { kind: 'dots', level: 'no answer' };
  }
  return { kind: 'skip' };
}

// ---------- Geometry ----------
const px = (lon) => ((lon + 180) / 360) * 256 * 2 ** Z;
const py = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2) * 256 * 2 ** Z; };
const M_PER_PX = (lat) => (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** Z);

async function load(country, views) {
  const boxes = views.map((v) => {
    const x0 = px(v.lon) - CW / 2, y0 = py(v.lat) - CH / 2;
    return { v, x0, y0, ways: [] };
  });
  const rl = createInterface({ input: createReadStream(new URL(`../pbf/${country}-ways.geojsonseq`, import.meta.url)), crlfDelay: Infinity });
  for await (const raw of rl) {
    const line = raw.replace(/^\x1e/, '');
    if (!line) continue;
    const f = JSON.parse(line);
    if (f.geometry?.type !== 'LineString') continue;
    const pts = f.geometry.coordinates.map(([lon, lat]) => [px(lon), py(lat)]);
    for (const b of boxes) {
      const local = pts.map(([x, y]) => [x - b.x0, y - b.y0]);
      if (local.some(([x, y]) => x > -20 && x < CW + 20 && y > -20 && y < CH + 20)) b.ways.push({ tags: f.properties, pts: local });
    }
  }
  return boxes;
}

// Length inside the crop, in metres, per look (clipped by sampling each segment).
function lengthInside(pts, lat) {
  let m = 0;
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
    for (let k = 0; k < n; k++) {
      const x = a[0] + ((b[0] - a[0]) * (k + 0.5)) / n, y = a[1] + ((b[1] - a[1]) * (k + 0.5)) / n;
      if (x >= 0 && x <= CW && y >= 0 && y <= CH) m += Math.hypot(b[0] - a[0], b[1] - a[1]) / n;
    }
  }
  return m * M_PER_PX(lat);
}

// ---------- Drawing ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, size = 13, weight = 400, fill = INK) =>
  `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const d = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
const stroke = (pts, { color, width, dash = null, cap = null }) =>
  `<path d="${d(pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="${cap ?? (dash ? 'butt' : 'round')}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

function drawCrop(ways, closed) {
  const L = { dots: [], closed: [], single: [], pavedCasing: [], pavedFill: [], track: [], casing: [], fill: [], band: [] };
  const roads = [];
  for (const w of ways) {
    const k = w.look;
    if (k.kind === 'dots') L.dots.push(stroke(w.pts, { color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' }));
    else if (k.kind === 'closedTrack') L.closed.push(stroke(w.pts, closed.track));
    else if (k.kind === 'closedPath') L.closed.push(stroke(w.pts, closed.path));
    else if (k.kind === 'single') L.single.push(stroke(w.pts, { color: k.level === 'paved' ? PAVED_TRACK.casing : RAMP[k.level], width: PATH_W, dash: SINGLE }));
    else if (k.kind === 'track' && k.level === 'paved') {
      L.pavedCasing.push(stroke(w.pts, { color: PAVED_TRACK.casing, width: TRACK_W + 1.2 }));
      L.pavedFill.push(stroke(w.pts, { color: PAVED_TRACK.fill, width: TRACK_W }));
    } else if (k.kind === 'track') L.track.push(stroke(w.pts, { color: RAMP[k.level], width: TRACK_W }));
    else if (k.kind === 'road') roads.push(w);
  }
  // Roads: all casings, then fills and bands from the lowest class up, so junctions join cleanly.
  roads.sort((a, b) => RANK.indexOf(a.tags.highway) - RANK.indexOf(b.tags.highway));
  for (const w of roads) {
    const [cls, width] = ROAD[w.tags.highway];
    const c = SPEC.classes[cls];
    L.casing.push(stroke(w.pts, { color: c.casing, width: width + 1.2 }));
  }
  for (const w of roads) {
    const [cls, width] = ROAD[w.tags.highway];
    const c = SPEC.classes[cls];
    L.fill.push(stroke(w.pts, { color: c.fill, width }));
    if (w.look.level !== 'paved') L.fill.push(stroke(w.pts, { color: RAMP[w.look.level], width: Math.max(width * (cls === 'minor' ? 0.4 : 0.6), 0.8) }));
  }
  return `<rect width="${CW}" height="${CH}" fill="${LAND}"/>` + Object.values(L).map((a) => a.join('')).join('');
}

// Legend swatches (60 dp lines).
const sw = (parts) => parts.map((o) => stroke([[0, 0], [60, 0]], o)).join('');
function legend(closed) {
  const c = SPEC.classes;
  return [
    ['Coloured road: paved | Unpaved', sw([{ color: c.primary.casing, width: 7.7 }, { color: c.primary.fill, width: 6.5 }]), sw([{ color: c.primary.casing, width: 7.7 }, { color: c.primary.fill, width: 6.5 }, { color: RAMP.unpaved, width: 3.9 }])],
    ['White road: paved | Unpaved', sw([{ color: c.minor.casing, width: 5.7 }, { color: c.minor.fill, width: 4.5 }]), sw([{ color: c.minor.casing, width: 5.7 }, { color: c.minor.fill, width: 4.5 }, { color: RAMP.unpaved, width: 1.8 }])],
    ['Track: paved | Unpaved', sw([{ color: PAVED_TRACK.casing, width: TRACK_W + 1.2 }, { color: PAVED_TRACK.fill, width: TRACK_W }]), sw([{ color: RAMP.unpaved, width: TRACK_W }])],
    ['Track: high clearance | 4WD', sw([{ color: RAMP.high, width: TRACK_W }]), sw([{ color: RAMP.fourwd, width: TRACK_W }])],
    ['Single track (motorcycle=yes) | path, nobody said yes', sw([{ color: RAMP.unpaved, width: PATH_W, dash: SINGLE }]), sw([{ color: DOTS, width: 1.4, dash: '0.1 2.6', cap: 'round' }])],
    ['Closed: track | path', sw([closed.track]), sw([closed.path])],
  ];
}

function sheet(file, heading, note, panels) {
  const LW = 330, top = 64, gap = 14;
  const W = LW + panels.length * (CW + gap) + 6, H = top + 24 + CH + 14;
  let out = text(10, 26, heading, 17, 700) + text(10, 46, note, 12, 400, MUTED);
  panels.forEach((p, j) => {
    const x = LW + j * (CW + gap);
    out += text(x, top + 14, p.title, 13, 700) +
      `<g transform="translate(${x} ${top + 24})"><clipPath id="c${j}"><rect width="${CW}" height="${CH}" rx="4"/></clipPath><g clip-path="url(#c${j})">${p.svg}</g></g>`;
  });
  // Legend for the first panel's closed style; the closed row repeats for each panel style.
  const rows = legend(panels[0].closed);
  rows.forEach(([label, a, b], i) => {
    const y = top + 40 + i * 44;
    out += `<rect x="6" y="${y - 12}" width="146" height="24" rx="3" fill="${LAND}"/>` +
      `<g transform="translate(12 ${y})">${a}</g><g transform="translate(86 ${y})">${b}</g>` +
      `<foreignObject x="160" y="${y - 14}" width="${LW - 170}" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:12px Helvetica,Arial,sans-serif;color:${INK}">${esc(label)}</div></foreignObject>`;
  });
  let y = top + 40 + rows.length * 44;
  if (panels.length > 1) {
    panels.slice(1).forEach((p) => {
      out += `<rect x="6" y="${y - 12}" width="146" height="24" rx="3" fill="${LAND}"/><g transform="translate(12 ${y})">${sw([p.closed.track])}</g><g transform="translate(86 ${y})">${sw([p.closed.path])}</g>` +
        text(160, y + 4, `Closed, ${p.key}: track | path`, 12);
      y += 44;
    });
  }
  out += `<foreignObject x="6" y="${y}" width="${LW - 16}" height="${H - y - 10}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:11px Helvetica,Arial,sans-serif;color:${MUTED};line-height:1.4">${panels[0].stats}</div></foreignObject>`;
  writeFileSync(new URL(file, import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>${out}</svg>`);
  console.error(`mockups/${file}`);
}

// ---------- Run ----------
const NAMES = {
  'road paved': 'Paved road', 'road unpaved': 'Unpaved road', 'road high': 'High-clearance road', 'road fourwd': '4WD road',
  'track paved': 'Paved track', 'track unpaved': 'Unpaved track', 'track high': 'High-clearance track', 'track fourwd': '4WD track',
  'single unpaved': 'Single track', 'single high': 'Single track, high clearance', 'single fourwd': 'Single track, 4WD', 'single paved': 'Single track, paved',
  'dots no answer': 'Path, nobody said yes', 'dots impassable': 'Impassable', closedTrack: 'Closed track', closedPath: 'Closed path',
};
for (const country of [...new Set(VIEWS.map((v) => v.country))]) {
  const boxes = await load(country, VIEWS.filter((v) => v.country === country));
  for (const { v, ways } of boxes) {
    const km = {};
    for (const w of ways) {
      w.look = look(w.tags);
      if (w.look.kind === 'skip') continue;
      const key = w.look.level ? `${w.look.kind} ${w.look.level}` : w.look.kind;
      km[key] = (km[key] ?? 0) + lengthInside(w.pts, v.lat) / 1000;
    }
    const rows = Object.entries(km).filter(([, k]) => k >= 0.05).sort((a, b) => b[1] - a[1]);
    const trackKm = rows.filter(([k]) => k.startsWith('track') || k === 'closedTrack').reduce((s, [, k]) => s + k, 0);
    const closedShare = trackKm ? (100 * (km.closedTrack ?? 0)) / trackKm : 0;
    console.error(`${v.name}: ` + rows.map(([k, n]) => `${NAMES[k] ?? k} ${n.toFixed(1)}`).join(', ') + `; closed ${closedShare.toFixed(1)}% of track km`);
    const stats = `<b>In this crop</b> (km): ` + rows.map(([k, n]) => `${esc(NAMES[k] ?? k)} ${n.toFixed(1)}`).join(', ') +
      `. Closed: ${closedShare.toFixed(1)}% of track km.`;
    const panels = (v.closedVariants ?? ['thin']).map((key) => ({ key, title: v.closedVariants ? CLOSED[key].title : `${v.name}, z15`, closed: CLOSED[key], svg: drawCrop(ways, CLOSED[key]), stats }));
    sheet(`fork-crop-${v.name}.svg`,
      `Fork, real data: ${v.name} at z15 (${v.note})`,
      `Scheme D tracks and paths with the solid band on Unpaved roads (E-tracks 6.4), from the tags of the Geofabrik 2026-11-12 extract. ${CW} x ${CH} dp around ${v.lat}, ${v.lon}; highways only, no landuse. Light mode.`,
      panels);
  }
}
