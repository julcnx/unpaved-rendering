# Mind the Surface

*A Main Road Is Not Always Paved*

A proposal asking map apps to show whether a road is paved or unpaved, as an extra signal on top of the road class colour, so the class (function and importance) is never lost.

- **Main ask:** two levels, **Paved** and **Unpaved**.
- **Optional:** an **Off-road** mark on Unpaved roads, where `smoothness`, `tracktype` or `4wd_only` say a city car cannot pass.

## Site

Serve the repo with a local web server (`npm start`, which runs `python3 -m http.server 8765`), then:

- http://localhost:8765/: the article.
- http://localhost:8765/demo/: the demo.

## Article

Write in `article.md`, then run `npm run build` (`python3 scripts/build-article.py`, needs `pip install markdown`): it writes `index.html` from `article.md` and the page design in `article/template.html`. `FIGURE` comments in the Markdown become figures; the chart reads `research/stats/summary.csv` and the photo credits `research/examples/images/credits.json`. Images are in `article/img/`. Do not edit `index.html` by hand.

## Demo

`demo/index.html`, plain HTML, canvas and JavaScript: no build, no tile server.

- Sample spots: places where one road changes from paved to unpaved, cached in `data/` (`node scripts/fetch-spots.mjs`). They are the same spots as the screenshots of today's apps.
- Search anywhere: roads load live from Overpass from zoom 14.
- Styles: `js/styles.js`, one small function each. Side by side view, five backgrounds, legend.
- URL parameters: `spot`, `style` (`none` = no surface signal), `bg` (`all` = every background, one style), `z`, `lat`, `lon`, `compare=1`, `embed=1` (one map for an iframe).

## Classifier

`js/classify.js`, a copy of the reference classifier in [julcnx/osm-wiki](https://github.com/julcnx/osm-wiki/tree/main/unpaved-rendering/classifier). Tests: `node --test test/classify.test.js`.

## Screenshot loop

`node scripts/shots.mjs` (headless Chrome) screenshots every spot x style x background x zoom for review. Changes and their reasons go in [LOG.md](LOG.md).

Map data © OpenStreetMap contributors (ODbL). Terrain: AWS Terrain Tiles. Unpaved grain from OSM Carto (CC0).
