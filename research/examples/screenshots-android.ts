// Screenshots of the verified screenshot spots in Android map apps, on a phone connected over USB (USB debugging on).
// Usage: node examples/screenshots-android.ts [spot ...]   (spots: namibia, bolivia, nepal)
// APPS="osmand organic-maps" limits the run to some apps. WAIT=15000 waits longer for the map to draw.
// Writes examples/screenshots/<spot>/<app>-android.png. Offline maps for each country must be downloaded in each app first.
// The phone must be unlocked. Apps that are not installed are skipped.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

const ADB = `${homedir()}/Library/Android/sdk/platform-tools/adb`;
const ZOOM = 15;

const SPOTS: Record<string, [number, number]> = {
  namibia: [-18.81068, 16.9415],
  bolivia: [-14.87824, -64.99758],
  nepal: [28.80567, 83.76673],
};

// Known package names per app, Play Store and F-Droid builds. The first one installed is used.
const APPS: Record<string, string[]> = {
  osmand: ['net.osmand.plus', 'net.osmand'],
  'organic-maps': ['app.organicmaps', 'app.organicmaps.web'],
  comaps: ['app.comaps', 'app.comaps.google', 'app.comaps.fdroid'],
  'guru-maps': ['com.bodunov.galileo', 'com.bodunov.GalileoPro'],
  'maps-me': ['com.mapswithme.maps.pro'],
};

const adb = (...args: string[]) => execFileSync(ADB, args, { maxBuffer: 64 * 1024 * 1024 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const devices = adb('devices').toString().split('\n').slice(1).filter((l) => l.endsWith('\tdevice'));
if (devices.length !== 1) throw new Error(`need exactly one phone connected, found ${devices.length} (check USB debugging)`);

const installed = new Set(adb('shell', 'pm', 'list', 'packages').toString().split('\n').map((l) => l.replace('package:', '').trim()));
const only = process.env.APPS?.split(/\s+/).filter(Boolean);
const wait = Number(process.env.WAIT ?? 10000);
const apps = Object.entries(APPS).flatMap(([name, pkgs]) => {
  if (only && !only.includes(name)) return [];
  const pkg = pkgs.find((p) => installed.has(p));
  if (!pkg) console.error(`${name}: not installed, skipped`);
  return pkg ? [[name, pkg] as const] : [];
});

const args = process.argv.slice(2);
for (const spot of args.length ? args : Object.keys(SPOTS)) {
  const [la, lo] = SPOTS[spot];
  const dir = new URL(`./screenshots/${spot}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  for (const [name, pkg] of apps) {
    try {
      adb('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP');
      // A fresh start, so the app handles the geo: link instead of showing its last screen.
      adb('shell', 'am', 'force-stop', pkg);
      const out = adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW',
        '-d', `'geo:${la},${lo}?z=${ZOOM}'`, '-p', pkg).toString();
      if (/Error|unable to resolve/i.test(out)) throw new Error(`does not open geo: links (${out.trim().split('\n').pop()})`);
      await sleep(wait);
      writeFileSync(new URL(`${name}-android.png`, dir), adb('exec-out', 'screencap', '-p'));
      console.error(`${spot} ${name}: ok`);
    } catch (e: any) {
      console.error(`${spot} ${name}: ${e.message.split('\n')[0]}`);
    }
  }
}
