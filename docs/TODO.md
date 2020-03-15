# TODO

- LevelMeta mouse events handled in LevelMouse
- can add/remove points with editable tags
- point tags include `steiner`, `light`
- steiner points affect triangulation
- lights can be turned on/off

- edit/live mode
- can save/restore level

- clear vision of how `Level` + `Session` are used on our upcoming site

- can `click 2 | nav | goto`.
- illustrate floyd-warshall via click on spawn-point and mousemove
- avoid jerky fade in/out
- avoid lag caused by floyd-warshall, or at least indicate it

- implement tab completion
- implement `jq` using jq-web
- implement `find` (basic version)


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
- cleanup nav.worker; now intend to replace by level.worker
- replace listenTo{Worker,Parent}Until by await{Worker,Parent}
- level.worker has persisted state and level component talks to it
- can send grid toggles to level worker
- Level receives outline/walls/floors/triangles from worker
- store as branch `redo-navigation`.
- Level component has ui state too
- decided against scrollbars in `Level` because not natural way to zoom. instead we'll pan via scroll and scale via shift-scroll.
- can scale view via shift-scroll
- test centers/edges/floyd-warshall still works
- remove old NavDom component and nav.worker etc.
- can show centers and edges
- can compute floyd-warshall on request
- can press 1/2 to switch between large/small tiles
- can toggle tiles i.e. floor or absent
- can toggle subtiles
- can toggle walls/sub-walls
- avoid re-rendering LevelContent on mouse move
- can add meta points
- can open/close positioned meta popovers
- rename LevelPoint to LevelMeta (intend to support rect triggers)
- LevelMeta highlighted when mouseover
