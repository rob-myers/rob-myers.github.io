# The Last Redoubt

See the [plan](docs/plan.md).

```sh
# Local development
yarn dev

# Local build
yarn build
yarn export
cd out
npx http-server
```

Files like `next.config.js` are generated from `scripts/*` via `yarn next-cfg`.


---

# General dev info

```sh
# Can patch npm modules with `patch-package`
npx patch-package some-package
git add patches/some-package+$version.patch
```

```sh
# autocrop an image using ImageMagick
brew install imagemagick
convert -fuzz 1% -trim diag-ne.png diag-ne.png

# lossless PNG minify
brew install optipng
optipng *.png

# extract pdf page 20 as high quality PNG
convert -density 1164 'Starship Geomorphs 2.0.pdf'[19] -quality 100 unsorted/output.png
```

```sh
# https localhost via proxy
# set chrome://flags/#allow-insecure-localhost
yarn https-proxy
```

```sh
# Find local ip address for mobile development
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Fix Gimp fill colour:
> Image → Mode → RGB (rather than Indexed)

```sh
# fixed point precision
echo '2/3' | bc -l
```

```sh
git config --global user.name "Rob Myers"
git config --global user.email "me.robmyers@gmail.com"
```

```js
// https://runkit.com/rob-myers/622cee6ee13dba0008b6f845
var { pathDataToPolys } = require("svg-path-to-polygons")
let pathData = 'M 2649.328 1502.808 C 2649.328 1815.477 2521.706 2098.546 2315.37 2303.448 C 2109.034 2508.35 1823.983 2635.084 1509.124 2635.084 C 1194.265 2635.084 909.214 2508.35 702.878 2303.448 C 496.542 2098.546 368.92 1815.477 368.92 1502.808 C 368.92 1190.139 496.542 907.07 702.878 702.168 C 909.214 497.266 1194.265 370.532 1509.124 370.532 C 1823.983 370.532 2109.034 497.266 2315.37 702.168 C 2521.706 907.07 2649.328 1190.139 2649.328 1502.808 Z'
let points = pathDataToPolys(pathData, {tolerance:1, decimals:1});
// console.log(JSON.stringify(points));
console.log(JSON.stringify(points[0].filter((_, i) => i % 4 === 0).flatMap(x=>x).join(' ')));
```


```sh
# restrict PIDs (possibly including dead processes)
ps aux | grep nvm | awk '{print $2}'

# kill processes
for pid in $( ps aux | grep nvm | awk '{print $2}' ); do
  kill $pid
done
```