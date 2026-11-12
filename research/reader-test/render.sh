#!/bin/sh
# Renders the reader test shots and builds the pictures. From the repo root, with the repo served on :8765
# (python3 -m http.server 8765). Run pick-roads.mjs first if the frames or roads changed.
# Every place in every style (the web page rotates them), phone frame (W x H in pick-roads.mjs) at 2x pixels,
# reader view (no tracks, no thin roads, two levels), Carto land background.
set -e
cd "$(dirname "$0")/../.."
SIZE=400x520
node -e '
const l = JSON.parse(require("fs").readFileSync("research/reader-test/labels.json"));
for (const [s, v] of Object.entries(l)) console.log(s, v.zoom, v.center.join(","));' | while read spot z c; do
  node scripts/shots.mjs --spots "$spot" --bgs land --zooms "$z" --size $SIZE --dpr 2 --center "$c" \
    --attribution --reader --out shots/reader-test
done
# Closing question: one place, every style, no numbers. Namibia: C38 changes from asphalt to gravel in the strip.
for style in grain centre-line dashed-fill dashed-casing dashed-fill-full; do
  node scripts/shots.mjs --spots namibia --styles "$style" --bgs land --zooms 16 --size 400x240 --dpr 2 \
    --center -18.8107,16.9415 --attribution --reader --out shots/reader-test/tmp
  mv "shots/reader-test/tmp/namibia-$style-land-z16.png" "shots/reader-test/clarity-$style.png"
done
python3 research/reader-test/make-images.py
