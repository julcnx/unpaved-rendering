#!/bin/bash
# Run every country in stats/countries.txt: download, border, stats, delete download.
# Countries with a result in stats/results/ are skipped, so the run can be restarted.
# Usage: stats/run-all.sh, or ONLY="tl kh" stats/run-all.sh for some countries.
# Ctrl-C stops cleanly; run again to continue.

cd "$(dirname "$0")/.."
mkdir -p pbf work stats/results

LINES=()
while IFS= read -r line; do LINES+=("$line"); done < <(grep -v -e '^#' -e '^$' stats/countries.txt)

trap 'echo; echo "interrupted, run again to continue"; rm -f pbf/*.part; exit 130' INT
FAILED=()

pbf_valid() { [ -s "$1" ] && osmium fileinfo -e -g data.count.ways "$1" >/dev/null 2>&1; }

for i in "${!LINES[@]}"; do
  read -r path iso name <<< "${LINES[$i]}"
  read -r next_path _ <<< "${LINES[$((i + 1))]:-}"
  code=$(echo "$iso" | tr 'A-Z' 'a-z')
  pbf="pbf/$(basename "$path")-latest.osm.pbf"

  n="[$((i + 1))/${#LINES[@]}]"
  if [ -n "$ONLY" ] && [[ " $ONLY " != *" $code "* ]]; then
    continue
  elif [ -f "stats/results/$code.json" ]; then
    echo "$(date +%H:%M) $n skip $code ($name): result exists"
  else
    echo "$(date +%H:%M) $n start $code ($name)"
    if ! pbf_valid "$pbf"; then
      rm -f "$pbf"
      echo "downloading $path"
      curl -fL --progress-bar -o "$pbf.part" "https://download.geofabrik.de/$path-latest.osm.pbf" && mv "$pbf.part" "$pbf"
    fi
    if pbf_valid "$pbf" \
      && stats/boundary.sh "$pbf" "$iso" "work/$code-border.geojson" \
      && stats/run-country.sh "$code" "$pbf" "work/$code-border.geojson" "$name"; then
      echo "$(date +%H:%M) $n done $code"
    else
      echo "$(date +%H:%M) $n FAILED $code ($name)"
      FAILED+=("$code")
    fi
    rm -f "work/$code-border.geojson" "$pbf.part"
  fi

  # Keep a combined extract until its last country is done.
  [ "$next_path" = "$path" ] || rm -f "$pbf"
done

node stats/report.ts > stats/report.md
echo "$(date +%H:%M) report written: stats/report.md, stats/summary.csv, stats/unknown-values.md"
[ ${#FAILED[@]} -eq 0 ] || echo "failed: ${FAILED[*]}"
