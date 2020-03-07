## TODO

- cleanup demo-1 worker
- redo navigation i.e. new component where can specify filled rectangles and inset borders are computed and shown
- hookup redux and redux-persist to nav worker
- store as branch `redo-navigation`.

- implement tab completion
- implement `jq` using jq-web
- implement `find` (basic version)

- illustrate floyd-warshall via click on spawn-point and mousemove
- avoid jerky fade in/out
- avoid lag caused by floyd-warshall, or at least indicate it

- can bring bg process to foreground

- string-pulling
- actors move along them via css
- light polygons
- warn about missing messages from worker after timeout

- start using mdx for blogs
- integrate gitalk from older branch
- delete older branch
- merge this branch `fresh-start-2020` into new branch `dev`.

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
- compute triangulation in webworker
- refined triangulation in webworker
- use scss and style-loader to get hmr trigger working
- support css transform of rects, assuming default transform-origin
- don't support svg polygon
- support custom nav outset
- support holes via class
- better demo.
- smoother transition to new triangulation via css
  - learnt that HMR reloads __all non-empty useEffect!__
- NavDom no longer has width/height props; svg dimension set via worldBounds
- can add spawn points
- restrict nav to polygons with a spawn point
- fix useEffect(..., []) misunderstanding i.e. can only access initial useState values.
- create navgraph from navpolys
- verify navgraph is working by drawing it
- NOTE editing a useEffect(..., []) remounts it
- NOTE nextjs/react-hot-loader seems to do a spurious initial remount
- show navGraph edges too
- implement https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
- create dark theme (currently manual via variables.scss and `wt` in box.tsx)
- avoid multiple navspawns causing multiple updates

- switch from worker-plugin to webpack's worker-loader
- get os state running in webworker
- run redux-devtools in webworker on port 3002
  > https://itnext.io/ruining-redux-devtools-extension-for-webworker-1eeca68d7900
- can load css from npm modules
- xterm has plugins
- xterm renders with css
- get xterm working
- NOTE removed escape chars from prompt because currently unsupported (need to measure prompt without them)
- get bash responding to terminal
- printf now supports option `-v`
- Ctrl + C is working
  `while true; do sleep 1; echo foo; done`
- remove 'gui binaries' `top` and `stage`
- clarify and cleanup xterm <-> tty communication.
  > get pasting working
- throttle while so ctrl + c works for `while true; do echo foo; done > bar`
- FIX pasting onto partial line overwrites
- background processes are stopped on exit/logout
- binary error messages shouldn't have prefix `-bash: `
- can convert `Term` to "one-line src" (our input cannot contain newlines)
- get voice inode working
- ensure background `say` terminates e.g. via handler for SIGINT but not SIGTERM
- fix TermService.src in case of `echo foo & echo bar` and `{ echo foo & }`
- fix pasting
- .history device exists, receives src, and can `cat` it
- use a "history device" which reads like .history and keeps track
- added builtin eval e.g. `eval '{ while true; do echo foo; sleep 2; done; } &'`
- index + about + demo pages

## Bash example

```sh
echo $'\033[31mHello\e[0m World'
echo $'\e[37mHello\e[0m World'

printf "\e[31mHello\e[0m World"
x=foo; printf "%s\e[37m%s\e[39m\n" "hello " "$x"
printf -v foo "\e[31mHello\e[0m World"; echo $foo

case "$x" in foo) echo foo; ;; bar) echo bar; esac
```

## Redux devtools for os webworker


`yarn dev` i.e. start the app.

`yarn remotedev` i.e. run a websocket server on `3002` ATOW.

Finally, in Redux DevTools extension:
   - click "Remote" to open new window.
   - click "Settings"
   - Use custom server, host: `localhost`, port: `3002` ATOW

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
