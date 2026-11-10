// Comparison grid: every app at the same spot, cropped to the paved/unpaved transition and labelled with
// the A0 result (does it show unpaved on main roads, and does it keep the class colour).
// Usage: node examples/comparison-grid.ts [spot ...]   (default: all six; needs ImageMagick 7 `magick`)
// Reads examples/screenshots/<spot>/<app>.png, writes examples/screenshots/<spot>-grid.jpg.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SPOTS = ['namibia', 'bolivia', 'nepal', 'iceland', 'australia', 'alberta'];

// From A-providers.md A0 (screenshots 2026-11-09).
type Result = 'yes' | 'lost' | 'partly' | 'no';
const RESULT: Record<string, Result> = {
  americana: 'yes', 'osm-carto': 'yes', 'osmand-web': 'yes', dmd2: 'yes',
  humanitarian: 'lost', ridewithgps: 'lost',
  cyclosm: 'partly', tracestrack: 'partly',
};
const LABEL: Record<Result, [string, string]> = {
  yes: ['Unpaved shown, class kept', '#2e7d32'],
  lost: ['Unpaved shown, class lost', '#c77700'],
  partly: ['Some roads only', '#7a6a00'],
  no: ['No difference', '#777777'],
};
const ORDER: Result[] = ['yes', 'lost', 'partly', 'no'];

const dir = new URL('./screenshots/', import.meta.url).pathname;
const spots = process.argv.slice(2).length ? process.argv.slice(2) : SPOTS;
for (const spot of spots) {
  const apps = readdirSync(join(dir, spot)).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4))
    .sort((a, b) => ORDER.indexOf(RESULT[a] ?? 'no') - ORDER.indexOf(RESULT[b] ?? 'no') || a.localeCompare(b));
  const tmp = mkdtempSync(join(tmpdir(), 'grid-'));
  const tiles = apps.map((app, i) => {
    const [text, colour] = LABEL[RESULT[app] ?? 'no'];
    const out = join(tmp, `${String(i).padStart(2, '0')}.png`);
    // Centre half of the 1200x800 screenshot: the spot is the map centre.
    execFileSync('magick', [join(dir, spot, `${app}.png`), '-gravity', 'center', '-crop', '50%x50%+0+0', '+repage',
      '-background', colour, '-gravity', 'north', '-splice', '0x34', '-fill', 'white', '-font', 'Helvetica-Bold',
      '-pointsize', '20', '-annotate', '+0+6', `${app}: ${text}`, out]);
    return out;
  });
  const grid = join(dir, `${spot}-grid.jpg`);
  execFileSync('magick', ['montage', ...tiles, '-tile', '5x', '-geometry', '+6+6', '-background', 'white', '-quality', '85', grid]);
  rmSync(tmp, { recursive: true });
  console.log(`${spot}: ${apps.length} apps -> ${grid}`);
}
