// For each OSM test way, find the vector tile line that runs along it and print that line's surface fields.
// Usage: node research/tiles/tile-match.mjs <tile.mvt> <z> <x> <y> <test-ways.json> <spot>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const [file, z, tx, ty, waysFile, spot] = process.argv.slice(2);
let buf = readFileSync(file);
if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);

function reader(b) {
  let p = 0;
  const varint = () => { let r = 0, s = 1, x; do { x = b[p++]; r += (x & 0x7f) * s; s *= 128; } while (x & 0x80); return r; };
  return { end: () => p >= b.length, field() { const k = varint(), t = k & 7, f = Math.floor(k / 8);
    if (t === 0) return [f, varint()]; if (t === 1) { p += 8; return [f, null]; } if (t === 5) { p += 4; return [f, null]; }
    const n = varint(); const v = b.subarray(p, p + n); p += n; return [f, v]; } };
}
const varints = (b) => { const o = []; let v = 0, s = 1; for (const x of b) { v += (x & 0x7f) * s; s *= 128; if (!(x & 0x80)) { o.push(v); v = 0; s = 1; } } return o; };
const zz = (n) => (n % 2 ? -(n + 1) / 2 : n / 2);
function value(b) { const [f, v] = reader(b).field(); return f === 1 ? v.toString() : f === 6 ? String(zz(v)) : f === 7 ? String(!!v) : String(v); }

// Lines in lon/lat
const lines = [];
const r = reader(buf);
while (!r.end()) {
  const [f, lb] = r.field(); if (f !== 3) continue;
  const lr = reader(lb); let name = '', ext = 4096; const keys = [], vals = [], feats = [];
  while (!lr.end()) { const [lf, v] = lr.field(); if (lf === 1) name = v.toString(); else if (lf === 2) feats.push(v); else if (lf === 3) keys.push(v.toString()); else if (lf === 4) vals.push(value(v)); else if (lf === 5) ext = v; }
  for (const fb of feats) {
    const fr = reader(fb); const props = {}; let type = 0, geom = [];
    while (!fr.end()) { const [ff, v] = fr.field(); if (ff === 2) { const t = varints(v); for (let i = 0; i < t.length; i += 2) props[keys[t[i]]] = vals[t[i + 1]]; } else if (ff === 3) type = v; else if (ff === 4) geom = varints(v); }
    if (type !== 2 || /name|label/.test(name)) continue;
    let x = 0, y = 0; const pts = [];
    for (let i = 0; i < geom.length;) { const c = geom[i++], id = c & 7, n = c >> 3; if (id === 7) continue; for (let k = 0; k < n; k++) { x += zz(geom[i++]); y += zz(geom[i++]);
      const N = 2 ** +z, lon = ((+tx + x / ext) / N) * 360 - 180, my = Math.PI * (1 - (2 * (+ty + y / ext)) / N); pts.push([lon, (Math.atan(Math.sinh(my)) * 180) / Math.PI]); } }
    lines.push({ layer: name, props, pts });
  }
}
const m = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180), (a[1] - b[1]) * 110540);
const distToLine = (p, pts) => { let best = Infinity; for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]]; for (let t = 0; t <= 1; t += 0.05) best = Math.min(best, m(p, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])); } return best; };
for (const w of JSON.parse(readFileSync(waysFile)).filter((w) => w.spot === spot)) {
  // Score each tile line by the median distance of the way's vertices to it
  const scored = lines.map((l) => { const d = w.coords.map((c) => distToLine(c, l.pts)).sort((a, b) => a - b); return [d[Math.floor(d.length / 2)], l]; }).sort((a, b) => a[0] - b[0]);
  const [d, l] = scored[0] || [Infinity, null];
  const keep = l ? Object.entries(l.props).filter(([k]) => /class|highway|surface|tracktype|smooth/.test(k)).map(([k, v]) => `${k}=${v}`).join(' ') : '';
  console.log(`w${w.id} ${w.highway} surface=${w.surface} -> ${d < 15 ? `${l.layer}: ${keep}` : 'no tile line within 15 m'} (${Math.round(d)} m)`);
}
