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

We'll convert each Geomorph into an SVG, containing:
- SVG symbols/instance(s) corresponding to Starship Symbols.
- Polygonal data representing walls
- Polygonal data representing low obstacles
- Textual data (e.g. SR and Stateroom)
- Rectangular data representing doors

Each SVG will be self-contained, so:
- we'll need scripts to auto-update shared dependencies
- we'll need scripts to combine them, avoiding duplication

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
yarn trim-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
# minify the created pngs using optipng
yarn minify-pngs media/geomorph-edge
```

### `trim large symbol PNGs`

```sh
yarn trim-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
```

### `trim large root symbol PNGs`

```sh
yarn trim-pngs root media/Symbols media/symbol-root
```
