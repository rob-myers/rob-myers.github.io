## TODO

- compute triangulation in webworker
- use small messages instead
- use scss instead of inline styles (hmr should trigger)

- implement https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
- illustrate it
- string-pulling
- actors move along them via css

- spawn points
- light polygons

- start using mdx for blogs
- integrate gitalk from older branch
- delete older branch
- PR this branch `fresh-start-2020` into new branch `dev-setup`.

## So far

- next js
- typescript
- next.config.ts + custom webpack
- babel.config.ts
- @components alias
- react-hot-loader + @hot-loader/react-dom
- redux
- redux-persist
- basic jest integration
- sass + hmr
- deploy using gh-pages.config.ts
- eslint + @typescript-eslint + .eslintignore
- `NavDom` renders navigable polygon
- use cdt2d to improve triangulation
- web worker
- web worker in reducer `nav`
- multiple `NavDom` detecting dups
- fixed silent fail i.e. worked mustn't import from file with `new Worker(workerPath)`
- refactor poly2: has steiner points, caches triangle ids, has at most one triangulation

# Next JS

## Getting started

```sh
cd "${ROOT_DIR}"
npm init -y
yarn add react react-dom next

mkdir pages
yarn dev
```

```js
// in package.json
"scripts": {
  "dev": "next",
  "build": "next build",
  "start": "next start"
}
```

```tsx
// pages/index.tsx
const Index = () => (
  <div>
    <p>Hello Next.js!</p>
  </div>
)

export default Index;

// pages/about.tsx
export default function About() {
  return (
    <div>
      <p>This is the about page</p>
    </div>
  );
}
```

## Navigate between pages

```tsx
// pages/index.tsx
import Link from "next/link";
// ...
    <Link href="/about">
      <p>About</p>
    </Link>
```

## tsconfig.json setup

```sh
# stop server (Ctrl + C)
yarn add -D @types/react @types/node
yarn add -D typescript
yarn dev
# creates tsconfig.json
```

### aliases

```js
// tsconfig.json
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./components/*"]
    }
```

```js
// next.config.ts
const path = require('path')

module.exports = {
  webpack(config, _options) {
    config.resolve.alias['@components'] = path.join(path.resolve(__dirname), 'components')
    return config
  },
}
```
