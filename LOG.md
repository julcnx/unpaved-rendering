# Change log (screenshot loop)

## 2026-11-09: first version

- Four styles, as in the osm-wiki mockups: 1 Centre line, 3 Grain (OSM Carto), 5 Dashes (Americana), 6 Open gaps. Styles 2 (Brown fill) and 4 (Tint) were dropped in the mockups.
- First screenshots (Namibia, z15, white, sand, terrain, dark): all four styles show the paved/unpaved change on the C38. Tracks (thin, dashed, no casing) are not confused with any style.
- Problem found: in dark mode the paved primary fill (#7c6236) looks brown, which clashes with "brown means not paved". To fix in the colour tests.
- Terrain: hillshade works; Namibia is too flat to show contours, check on Nepal and Alberta.

## 2026-11-09: contours

- Nepal and Alberta on the terrain background: contours were full-strength brown (#c6a77f) and, in Nepal, competed with the brown unpaved signals. Now blended 45% into the land colour, as on usual topo maps. The brown of the styles must stay clearly darker or more saturated than contours: check in the colour tests.
- Terrain tiles stop at zoom 14, so at zoom 15+ contours are upscaled and look blocky. Acceptable for a demo background.
