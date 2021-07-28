# esc the base

See the [plan](docs/plan.md).

```sh
# Local development
yarn dev

# Local build
yarn build
yarn export
cd out
npx http-server

# Patch npm modules with `patch-package`
npx patch-package some-package
git add patches/some-package+$version.patch
```

Files like `next.config.js` are generated from `scripts/*` via `yarn next-cfg`.
