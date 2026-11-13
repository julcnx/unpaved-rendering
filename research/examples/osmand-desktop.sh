#!/bin/bash
# OsmAnd desktop renders of the Thai track views, the Pai view and Namibia C38 at Namutoni, with ~/Workspaces/OSM/osmand-render.
# Usage: examples/osmand-desktop.sh   (maps/ there needs Thailand_asia_2.obf and Namibia_africa_2.obf from download.osmand.net)
# Writes examples/screenshots/track-<view>[-z14]/, pai-z<zoom>/ and namibia[-z14]/, as osmand-desktop-<style>.png.
# Styles: default, offroad, offroad-integrity (Off-road with "Road surface integrity" on), enduro (Motorcycle).
set -e
HERE=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
RENDER=${OSMAND_RENDER:-$HOME/Workspaces/OSM/osmand-render}
TMP=$(mktemp -d)
GPX=$TMP/views.gpx

VIEWS="chiangrai:20.0259:99.678:Thailand_asia_2 thailand-1:7.83617:98.31665:Thailand_asia_2 thailand-2:9.54117:99.97559:Thailand_asia_2 thailand-3:20.33948:99.74487:Thailand_asia_2 pai:19.540403:98.548539:Thailand_asia_2 namibia:-18.81068:16.9415:Namibia_africa_2"
STYLES="default:default: offroad:offroad: offroad-integrity:offroad:surfaceIntegrity=true enduro:enduro-desktop:"

echo '<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="osmand-desktop" xmlns="http://www.topografix.com/GPX/1/1">' > "$GPX"
for v in $VIEWS; do
  IFS=: read -r view lat lon map <<< "$v"
  for zoom in 14 15; do
    for s in $STYLES; do
      IFS=: read -r label style props <<< "$s"
      echo "<wpt lat=\"$lat\" lon=\"$lon\"><name>$view@$zoom@$label</name><extensions><maps>$map</maps><zoom>$zoom</zoom><width>1200</width><height>800</height><renderingName>$style</renderingName>${props:+<renderingProperties>$props</renderingProperties>}</extensions></wpt>" >> "$GPX"
    done
  done
done
echo '</gpx>' >> "$GPX"

"$RENDER/render.sh" "$GPX" "$TMP/out"

for f in "$TMP"/out/*.png; do
  IFS=@ read -r view zoom label <<< "$(basename "$f" .png)"
  if [ "$view" = pai ]; then dir=pai-z$zoom
  elif [ "$view" = namibia ]; then dir=namibia${zoom/15/}; dir=${dir/14/-z14}
  elif [ "$zoom" = 15 ]; then dir=track-$view
  else dir=track-$view-z$zoom; fi
  mkdir -p "$HERE/screenshots/$dir"
  mv "$f" "$HERE/screenshots/$dir/osmand-desktop-$label.png"
done
rm -r "$TMP"
