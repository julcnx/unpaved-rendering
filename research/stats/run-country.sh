#!/bin/bash
# Road drivability stats for one country.
# Usage: stats/run-country.sh <code> <extract.osm.pbf> <country-boundary.geojson> [country name]
# Writes stats/results/<code>.json and stats/combos/<code>.json (km per tag combination).
# Intermediate files go to work/ and are always deleted.

set -eo pipefail
cd "$(dirname "$0")/.."

CODE="$1"; PBF="$2"; BOUNDARY="$3"; NAME="${4:-}"
WORK="work/$CODE"
mkdir -p "$WORK" stats/results stats/combos
trap 'rm -rf "$WORK"' EXIT

DATE=$(osmium fileinfo -g header.option.osmosis_replication_timestamp "$PBF" | cut -c1-10)
DATE_SOURCE=header
if [ -z "$DATE" ]; then
  DATE=$(osmium fileinfo -e -g data.timestamp.last "$PBF" | cut -c1-10)
  DATE_SOURCE=newest_object
fi

# Record the border relation id when the boundary comes from stats/boundary.sh.
BOUNDARY_ID=$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1])).features?.[0]?.properties?.id ?? ""' "$BOUNDARY")
BOUNDARY_LABEL="${BOUNDARY_ID:-$BOUNDARY}"

osmium tags-filter "$PBF" w/highway=motorway,trunk,primary,secondary,tertiary,unclassified,residential \
  -o "$WORK/roads.osm.pbf" --overwrite
# "simple" keeps only nodes inside the border, so cross-border ways are cut, not counted twice.
osmium extract --polygon="$BOUNDARY" --strategy=simple "$WORK/roads.osm.pbf" \
  -o "$WORK/clipped.osm.pbf" --overwrite
osmium export -f geojsonseq -u type_id --geometry-types=linestring "$WORK/clipped.osm.pbf" \
  | OSMIUM_VERSION=$(osmium --version | head -1) SOURCE_PBF=$(basename "$PBF") BOUNDARY="$BOUNDARY_LABEL" \
    DATA_DATE_SOURCE="$DATE_SOURCE" COMBOS_OUT="$WORK/combos.json" node stats/road-stats.ts "$CODE" "$DATE" "$NAME" > "$WORK/result.json"
# Only complete results are moved into place, so an interrupted run never looks finished.
mv "$WORK/combos.json" "stats/combos/$CODE.json"
mv "$WORK/result.json" "stats/results/$CODE.json"

echo "wrote stats/results/$CODE.json (data $DATE from $DATE_SOURCE)"
