#  Starship Geomorphs Strategy

## Sources

Blog post: [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html)

- PDF [geomorphs](https://drive.google.com/file/d/19nydz3BZ2T2aFihs1aKOS3-ziH4JY5g8/view)
- PDF and source [symbols](https://drive.google.com/drive/folders/187mYl8Pyo-nxA8SI6D1WeJ9bnpJXNuDt)

PNGs of [geomorphs and symbols](http://gurpsland.no-ip.org/geomorphs/)

## Scripts

We use `ts-node` and code in `media/scripts`.

```sh
yarn trim-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
```
```sh
yarn trim-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
```
```sh
yarn trim-pngs root media/Symbols media/symbol-root
```
```sh
yarn minify-pngs media/geomorph-edge
```