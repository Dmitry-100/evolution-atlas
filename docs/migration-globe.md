# Homo sapiens migration globe

The `/primates` migration exhibit uses an on-demand Three.js scene. The scene loads near the viewport, suspends drawing offscreen or in a hidden tab, and releases its GPU resources when unmounted or switched to 2D. Initial animation and camera transitions respect `prefers-reduced-motion`; visitors can explicitly start the route animation with its play control.

The globe supports pointer dragging, keyboard arrows, zoom buttons and `+`/`-`, and `Home` to return to the selected route. Ordinary wheel scrolling remains page scrolling. Sites can also be selected from the HTML list; labels on the far side of Earth are hidden from sight and keyboard navigation. The original SVG map remains available through the 2D switch and if WebGL is unavailable or its context is lost.

## Geography and evidence

- `src/data/earthLand110m.json` contains 128 polygon rings (5,143 coordinates), rounded to three decimal places, from [Natural Earth 1:110m land](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson), obtained 2026-09-11. Natural Earth data are [public domain](https://www.naturalearthdata.com/about/terms-of-use/).
- Rendering uses an equirectangular canvas texture with a printed grain. The texture is cartographic styling, not measured topographic relief. No remote requests or texture services are needed at runtime.
- Existing route coordinates, dates, confidence levels and sources remain in `src/data/humanOrigins.ts`. Spherical interpolation preserves the antimeridian crossing through Beringia.
- Coastlines are modern. Routes are schematic hypotheses; the exhibit states this explicitly. The African mosaic is not animated as a chronological journey.

## Validation

`migrationGlobeGeometry.test.ts` checks geographical alignment, the antimeridian crossing and continuity above the sphere. `e2e/migration-globe.spec.ts` covers desktop/mobile rendering, keyboard rotation, route/site selection, mode switching, animation controls and unavailable WebGL.
