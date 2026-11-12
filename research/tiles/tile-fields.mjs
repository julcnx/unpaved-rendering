// List the attributes of road layers in saved vector tiles (no dependencies).
// Usage: node research/tiles/tile-fields.mjs <dir|file.mvt>... [--all] (--all: every layer, not just road-like ones)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

function reader(buf) {
  let p = 0;
  const varint = () => { let r = 0n, s = 0n, b; do { b = buf[p++]; r |= BigInt(b & 0x7f) << s; s += 7n; } while (b & 0x80); return r; };
  return {
    end: () => p >= buf.length,
    field() {
      const k = Number(varint()), t = k & 7, f = k >> 3;
      if (t === 0) return [f, varint()];
      if (t === 1) { const v = buf.readDoubleLE(p); p += 8; return [f, v]; }
      if (t === 2) { const n = Number(varint()); const v = buf.subarray(p, p + n); p += n; return [f, v]; }
      if (t === 5) { const v = buf.readFloatLE(p); p += 4; return [f, v]; }
      throw new Error('wire type ' + t);
    },
  };
}
const packed = (b) => { const out = [];
  let v = 0n, s = 0n; for (const byte of b) { v |= BigInt(byte & 0x7f) << s; s += 7n; if (!(byte & 0x80)) { out.push(Number(v)); v = 0n; s = 0n; } } return out; };
function value(b) {
  const r = reader(b); const [f, v] = r.field();
  if (f === 1) return v.toString();
  if (f === 6) { const n = v; return String((n >> 1n) ^ -(n & 1n)); }
  if (f === 7) return String(v !== 0n);
  return String(v);
}
function decode(buf) {
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  const layers = {};
  const r = reader(buf);
  while (!r.end()) {
    const [f, lb] = r.field(); if (f !== 3) continue;
    const lr = reader(lb); let name = '', keys = [], vals = [], feats = [];
    while (!lr.end()) { const [lf, v] = lr.field(); if (lf === 1) name = v.toString(); else if (lf === 2) feats.push(v); else if (lf === 3) keys.push(v.toString()); else if (lf === 4) vals.push(value(v)); }
    layers[name] = feats.map((fb) => { const fr = reader(fb); const props = {}; while (!fr.end()) { const [ff, v] = fr.field(); if (ff === 2) { const t = packed(v); for (let i = 0; i < t.length; i += 2) props[keys[t[i]]] = vals[t[i + 1]]; } } return props; });
  }
  return layers;
}
const all = process.argv.includes('--all');
const files = process.argv.slice(2).filter((a, i, v) => !a.startsWith('--') && v[i - 1] !== '--pair').flatMap((a) => statSync(a).isDirectory() ? readdirSync(a).filter((f) => f.endsWith('.mvt')).map((f) => `${a}/${f}`) : [a]);
const stats = new Map();
for (const f of files) {
  let layers; try { layers = decode(readFileSync(f)); } catch (e) { console.error(f, e.message); continue; }
  for (const [l, feats] of Object.entries(layers)) {
    if (!all && !/road|transport|street|way|highway|line/i.test(l)) continue;
    for (const p of feats) for (const [k, v] of Object.entries(p)) {
      if (/^name|^ref$/.test(k)) continue;
      const key = `${l}.${k}`; if (!stats.has(key)) stats.set(key, new Map());
      const m = stats.get(key); m.set(v, (m.get(v) || 0) + 1);
    }
  }
}
for (const [k, m] of [...stats].sort()) console.log(`${k}: ${[...m].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([v, n]) => `${v}(${n})`).join(', ')}`);
// --pair a,b: count value pairs of two fields (for example class,surface)
const pi = process.argv.indexOf('--pair');
if (pi > 0) {
  const [a, b] = process.argv[pi + 1].split(','); const c = new Map();
  for (const f of files) { let L; try { L = decode(readFileSync(f)); } catch { continue; } for (const feats of Object.values(L)) for (const p of feats) if (a in p) { const k = `${p[a]} / ${p[b] ?? '-'}`; c.set(k, (c.get(k) || 0) + 1); } }
  console.log(`-- ${a} / ${b}:`, [...c].sort().map(([k, n]) => `${k} (${n})`).join('; '));
}
