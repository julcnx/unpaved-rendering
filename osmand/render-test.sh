#!/bin/bash
# Renders test.gpx with overland.render.xml through ~/Workspaces/OSM/osmand-render. Usage: ./render-test.sh [output dir]
set -e
cd "$(dirname "$0")"; HERE=$PWD; OR=${OSMAND_RENDER:-$HOME/Workspaces/OSM/osmand-render}; OUT=${1:-$HERE/out}
python3 make-overland.py; python3 test.gpx.py; mkdir -p "$OUT" "$HERE/out/.styles"; S=$HERE/out/.styles
ln -sf "$OR/styles/default.render.xml" "$S/"; ln -sf "$HERE/overland.render.xml" "$S/"; ln -sfn "$OR/mapcreator-nightly/fonts" "$S/fonts"
cd "$S"; MC=$OR/mapcreator-nightly
"$OR/jdk-arm64/Contents/Home/bin/java" -Djava.awt.headless=true -Xmx3g -cp "$MC/OsmAndMapCreator.jar:$MC/lib/*:$OR/icons" net.osmand.swing.OsmAndImageRendering \
  -native="$OR/native-arm64/libosmand.dylib" -obfFiles="$OR/maps" -stylesPath="$S/" -gpxFile="$HERE/test.gpx" -output="$OUT" 2>&1 | grep -iE "error|exception" || true
