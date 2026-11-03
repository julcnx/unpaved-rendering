#!/bin/bash
# Country border as GeoJSON, from the complete OSM relation (OSM API), not from the extract:
# Geofabrik extracts can miss border ways at sea, which makes the polygon impossible to build.
# Relation ids: stats/country-relations.txt. Borders are cached in borders/<ISO>.geojson.
# Usage: stats/boundary.sh <extract.osm.pbf, unused> <ISO 3166-1 alpha-2 code> <out.geojson>

set -eo pipefail
cd "$(dirname "$0")/.."
ISO="$2"; OUT="$3"
CACHE="borders/$ISO.geojson"

if [ ! -s "$CACHE" ]; then
  REL=$(awk -v c="$ISO" '$1 == c { print $2 }' stats/country-relations.txt)
  [ -n "$REL" ] || { echo "no relation id for $ISO in stats/country-relations.txt" >&2; exit 1; }
  if [ "$REL" = "-" ]; then
    # No country relation (Antarctica): everything south of 60°S, the Antarctic Treaty area.
    mkdir -p borders
    echo '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"id":"south of 60S"},"geometry":{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,-60],[-180,-60],[-180,-90]]]}}]}' > "$CACHE"
  else
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  mkdir -p borders
  # The API rate-limits large downloads ("try again in N seconds"): wait and retry.
  for attempt in 1 2 3 4 5 6; do
    curl -sf -A "unpaved-rendering/0.1 (osm user julcnx)" -o "$TMP/r.osm" "https://api.openstreetmap.org/api/0.6/relation/$REL/full" && break
    [ "$attempt" = 6 ] && { echo "OSM API download failed for r$REL" >&2; exit 1; }
    echo "OSM API busy for r$REL, retrying in 60 s" >&2; sleep 60
  done
  osmium export "$TMP/r.osm" -f geojsonseq --geometry-types=polygon -u type_id -o "$TMP/r.geojsonseq" --overwrite 2>/dev/null
  # Area id of a relation is a<2 * relation id + 1>.
  node -e '
const fs = require("fs");
const [rel, src, out] = process.argv.slice(1);
const id = `a${2 * Number(rel) + 1}`;
const f = fs.readFileSync(src, "utf8").split("\n").filter(Boolean)
  .map((l) => JSON.parse(l.replace(/^\x1e/, ""))).find((f) => f.id === id);
if (!f) { console.error(`could not build a polygon for relation r${rel}`); process.exit(1); }
fs.writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features: [{ type: "Feature", properties: { id: `r${rel}`, name: f.properties.name }, geometry: f.geometry }] }));
' "$REL" "$TMP/r.geojsonseq" "$CACHE"
  echo "border r$REL cached in $CACHE" >&2
  fi
fi

[ -z "$OUT" ] || cp "$CACHE" "$OUT"
