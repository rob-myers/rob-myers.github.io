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