# TODO

- BUG: serialization of `while true; do echo foo; sleep 2; echo bar & done` 
- BUG: can't `sleep 2 &` inside while loop 

- BUG: `ps` command for launched processes should include args and redirs
- Implement `init` without `while true; do sleep 1000; done` e.g. detect special case and don't start running term
- BUG: `echo $$` showing wrong pid
- dark mode with lights
- lights can be turned on/off
- BUG: on window maximise, new area unreachable by cursor 
- auto Floyd-warshall when missing and needed, notifying user

- implement `kill` with `SIGSTP`, `SIGCONT`, `SIGINT,` `SIGTERM`
- also need `fg` to put process into foreground
- for `goto` intend stop/continue to pause/continue animations

- can trigger circle moving along path via css
  - adding tag `@bob>foo` spawns bob and sends him to some meta tagged `foo`
  - clicking on `bob` pauses/resumes animation
  - actors exist in `LevelAuxState`

- Concerning future implementation of `goto`:
  - takes many integer or empty params `4 '' -3 5 ...` 
  - consumes two-at-a-time and simply goes to point
  - can specify ease-in/out or similar
  - completes once respective animation is complete
  - suspending it pauses animation

- clearer vision of site i.e. beyond `Level` + `Session` + comments.

- actors have position and direction
- can `look`: metas within radius, ray-cast

- snap metas to integer-valued `x`, `y` (better serialisation)

- `Level` has prop `deviceId` and `levelId`.
- can save level as text in development via webpack-dev-server
- can load level from json file
- level `levelId` loaded from json file on mount `Level`
- can save _branches_ of a level `${levelid}.${branch}` via redux-persist
- can stringify/parse branches within ui (so can send as comments)
- edit/live mode

- start implementing `LevelINode`
- each `Level` has corresponding `LevelINode` at `/dev/level-${deviceId}/`
- can `click 2 | nav | goto`.

- get pan-zoom working in safari



- implement tab completion
- implement `jq` using jq-web
- implement `find` (basic version)

- can bring bg process to foreground

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
- LevelMeta mouse events handled in LevelMouse, except for popover onClicks
- can add/remove points with editable tags
- point tags can include `steiner`, `light`
- steiner points affect triangulation
- improve popover design: tags only; delete via `-`
- shift-drag meta to duplicate
- can pan-zoom over meta popovers via event forwarding
- merge meta/make modes into one mode
- implemented lights
- on click save, computes Floyd-Warshall
- Floyd-Warshall provides basic path
- can tag one meta `foo` and another `>foo` and Floyd-Warshall shows basic path
- Floyd-Warshall supports string-pulling
- fix bug: prevent tab to offscreen meta via tabIndex -1 (it changed svg height)
- implement `ps`
- BUG: `echo $!` should be initial empty, and provides PID of last bg process if still exists
- BUG: system breaks on:
```bash
$ sleep 10 >baz
^C
```
FIX: do not pop redirect scope in bash if `exec` has changed it.
