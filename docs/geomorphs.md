#  Starship Geomorphs Strategy

## Sources

The awesome blog post:
> [The Starship Geomorphs book is finally complete!](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html)
> - the [Starship Geomorphs 2.0 pdf](https://drive.google.com/file/d/19nydz3BZ2T2aFihs1aKOS3-ziH4JY5g8/view)
> - the [Starship Symbols](https://drive.google.com/drive/folders/187mYl8Pyo-nxA8SI6D1WeJ9bnpJXNuDt) pdf and source files.

Importantly, this work has been [converted into PNGs](http://gurpsland.no-ip.org/geomorphs/).
- there are "small" files representing the geomorphs
- there are "large" files representing the symbols

## Overview

We'll convert each Starship Geomorph into a _standalone_ SVG, containing:
- Original geomorph as partially transparent background data url PNG
- SVG symbols/instance(s) corresponding to Starship Symbols.
  - Both the symbol instance and the symbol will be present.
  - Technically, the symbols should be "duplicates" of the SVGs below.

We'll convert each Starship Symbol into a _standlone_ SVG
  - Original symbol sans text as background data url PGN
  - Polys representing walls.
  - Polys representing low obstacles.
  - Textual data (e.g. SR and Stateroom).
  - Rects representing doors.
  - Circs indicating seats
  - Other triggers e.g. beds,.

The above SVGs will be self-contained, so:
- we'll need scripts to auto-update shared dependencies.
- we'll need scripts to combine them, avoiding duplication.

We can use a webpack loader, or a [runtime one](https://css-tricks.com/svg-loader-a-different-way-to-work-with-external-svg/)
  - we only commit the "template" referring to symbols
  - svg-loader loads the svg inline, so can parse e.g. physics data defined via polygons

## Scripts

We use npm scripts to launch `ts-node` against code defined in `media/scripts`.

### `trim-and-minify small geomorph PNGs`

The geomorph PNGs are relatively small.
- We'll only use them as background while creating the SVGs.
- In production they will be removed.

```sh
# copy files to media/geomorph-edge with different names
# store name transformation data in manifest.json
# apply ImageMagick convert to trim them (zealous crop)
yarn rename-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
# minify the created pngs using optipng
yarn minify-pngs media/geomorph-edge
```

- media/geomorph-edge ✅
- media/geomorph-corner
- media/geomorph-core
- media/geomorph-end

### `trim large symbol PNGs`

```sh
yarn rename-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
yarn rename-pngs symbol media/Symbols/Bridge media/symbol-bridge
yarn rename-pngs symbol media/Symbols/'Dock, Small Craft' media/symbol-dock-small-craft
# ...
```

### `trim large symbol PNGs (root directory)`

```sh
yarn rename-pngs root media/Symbols media/symbol-root
```

### `minify used large symbol PNGs`

```sh
yarn minify-pngs media/used-symbols
```