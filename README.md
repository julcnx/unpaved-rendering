# Mind the Surface

*Where can my city car go?*

A proposal asking map apps to show whether a road is paved or unpaved, as an extra signal on top of the road class colour, so the class (function and importance) is never lost.

- **Main ask:** two levels, **Paved** and **Unpaved**.
- **Optional:** an **Off-road** mark on Unpaved roads, where `smoothness`, `tracktype` or `4wd_only` say a city car cannot pass.

## Demo

Open `index.html` through a local web server (`python3 -m http.server 8765`, then http://localhost:8765). Plain HTML, canvas and JavaScript: no build, no tile server.

- Sample spots: places where one road changes from paved to unpaved, cached in `data/` (`node scripts/fetch-spots.mjs`). They are the same spots as the screenshots of today's apps.
- Search anywhere: roads load live from Overpass from zoom 14.
- Styles: `js/styles.js`, one small function each. Side by side view, five backgrounds, legend.
- URL parameters: `spot`, `style`, `bg`, `z`, `lat`, `lon`, `compare=1`.

## Classifier

`js/classify.js`, a copy of the reference classifier in [julcnx/osm-wiki](https://github.com/julcnx/osm-wiki/tree/main/unpaved-rendering/classifier). Tests: `node --test test/classify.test.js`.

## Screenshot loop

`node scripts/shots.mjs` (headless Chrome) screenshots every spot x style x background x zoom for review. Changes and their reasons go in [LOG.md](LOG.md).

Map data © OpenStreetMap contributors (ODbL). Terrain: AWS Terrain Tiles. Unpaved grain from OSM Carto (CC0).
