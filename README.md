# Rogue Markup

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