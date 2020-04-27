# TODO

- 3d approach:
  - `table` is 3d cuboid with height modifier `h-${h}`
  - rename `door` as `way`
  - `door` is 3d door linking to another polygon
  - actor will be cuboid too

- floor decals via `icon`: dashed box, letters/digits

- have camera modes `free`, `follow`
- can set camera target via pseudo-tag `@`

- Compute 'viewable ViewGraph' for raycasting
- For debugging, can cast nav-ray/sight-ray between two metas.

- Can find metas outside navigable but on table
  i.e. triggers (rect/circ) intersecting navigable


- shell signals
- implement `kill` with `SIGSTOP`, `SIGCONT`, `SIGINT,` `SIGTERM`
- `fg` puts process into foreground
- for `goto` intend `STOP`/`CONT` to pause/continue animations
- can pause entire session -- but how to pause a `sleep`?
  - if finishes make it sleep the 'difference' and immediately pause it

- describe level editor features
- why `wallSeg` is independent of `tileFloors`
  i.e. walls can cut out another polygon
- Provide outline of documentation e.g. nav, ray, triggers etc.

- can trigger circle moving along path via CSS
  - adding tag `@bob>foo` spawns bob and sends him to some meta tagged `foo`
  - clicking on `bob` pauses/resumes animation
  - actors exist in `LevelAuxState`

- saving and loading levels
  - only concerned with level data i.e. geometry + metas
  - `@dev` we'll add an endpoint to webpack-dev-server which saves/loads json
  - `@dev` also have 'branches' of a save which are saved/loaded via redux-persist
  - branches only exist locally; json-saves are part of website
  - `@prod` can only save/load branches (no server available)
  - `@{dev,prod}` however can serialise branches so can comment
  - could start from another's branch, but serialise as delta from json -save

- `Level` has prop `deviceId` and `levelId`.
- can save level as text in development via webpack-dev-server
- can load level from json file
- level `levelId` loaded from json file on mount `Level`
- can save _branches_ of a level `${levelid}.${branch}` via redux-persist
- can stringify/parse branches within ui (so can send as comments)
- edit/live mode

- saving and loading scripts (UNDECIDED)
  - could provide `/sbin/level-1/onload.sh`
  - users could save scripts to `/home/user/`

- Directional lights via masks
- tests for shell i.e. given env and command should provide output

- Concerning future implementation of `goto`:
  - takes many integer or empty params `4 '' -3 5 ...` 
  - consumes two-at-a-time and simply goes to point
  - can specify ease-in/out or similar
  - completes once respective animation is complete
  - suspending it pauses animation
  - when reads from stdout runs each line one-by-one

- actors have position and direction
- can `look`: metas within radius, ray-cast

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

- `exec`
- prevent execution if command not found
- handle error `exec <( sleep 2; echo foo; sleep 2 )`

- try lighting via SVG filter:
  - each light poly can be restricted via circle and `feComposite`,
    and possibly made into a spotlight.
  - one filter per floor polygon

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
  ```sh
  $ sleep 10 >baz
  ^C
  ```
  FIX: do not pop redirect scope in bash if `exec` has changed it.
- BUG: serialization of iterators e.g. `while true; do echo foo; sleep 2; echo bar & done` 
- BUG: can't `sleep 1 &` inside while loop 
  ```sh
  # works
  while true; do sleep 1 & break; done
  # but the following errors after 1st iteration
  # -bash: sleep: command not found
  while true; do echo foo; sleep 1 & done
  ```
  We need better error handling, but perhaps _should_ prevent iterated background processes.
  Can also get around it via `eval`, but that's ok:
  ```sh
  while true; do echo foo; eval '{ sleep 1 & }' ; done
  ```
- Implement `init` without `while true; do sleep 1000; done` e.g. detect special case and don't start running term
- BUG: `ps` command for launched processes should include args and redirs
- BUG: `echo $$` showing wrong pid
- dark mode with lights
- BUG: on window maximise, new area unreachable by cursor 
- on click save notify when Floyd-Warshall computed
  > mention number of nodes, edges, disjoint parts
- Set Floyd-Warshall null on change nav
- Can show dual nav graph via menu
- Auto Floyd-Warshall when stale, notifying user
- Simplified light polygons by removing colinear
- Lights radial fill should be properly centered
- Support 3d walls via Level3d component
- Improve 3d walls
- snap metas to integer-valued `x`, `y` (better serialisation)
- Cleanup level worker
- Floyd-Warshall handles disjoint areas efficiently
- Focus `LevelKeys` on mouse-enter and on close-meta.
- ignore steiner point on corner (duplicate vertex)
- on remove small wall bordering exactly one filled tile, set both unfilled
- on remove tile with prexisting walls, remove the walls
- permit steiner points "on edge" by insetting slightly less
- navmesh via optimal rect decomposition of the rectilinear nav polygon via the npm module `rectangle-decomposition`
- display as outlined rects, and hide triangles
- keep rectangle-decomposition but use navmesh for navigation
- however, change induced graph i.e. vertices induce nodes, edges induce edges.
- remove hack where steiners on edges are slightly inside.
  instead, create fresh slightly outset polys, compute triangulation,
  and use triangulation with original polys
- pick best start/end node by testing 3 in each triangle (9 distance lookups)
  - eliminate 2nd/penultimate intermediate point if a -> b -> c all in same rect
- rects can induce extra steiners; currently commented out;
  we'll continue to manually specifiy steiner points
- start/end points computed by considering all points along edge of local rectangle
- remove old nav view; show rects instead
- fix light radius issue
- saw navigation bug i.e. additional steiners just created
- tried add extra steiners i.e. on opposite side of rect.
  perhaps too many verts for Floyd-Warshall, so left commented out
- clean away old navigation
- metas can have radius and rects
- fixed duplicate steiners
- meta tags for rectangle trigger `r-$dim` `rect-$w-$h`
- meta rectangular trigger can be circular via `circle`
- BUG: Ctrl-C not working for subshells, command subst
  e.g. `( sleep 2 )`
  e.g. `echo $( sleep 2; echo foo; sleep 2 )`
  FIX: foreground can have multiple process keys where 1st is interactive bash
- BUG: `bash; ( sleep 2) ^C`
  FIX: by previous fix.
- BUG: pipe terminates early `sleep 4 | echo foo`
  FIX: wait for all children (could only wait for last via flag?)
- BUG: process expansion is logging late for:
  `cat <( sleep 2; echo foo; sleep 2 )`
  FIX: `osReadThunk` ignores `maxLines` when reading from fifo
- multiple metas at same position via `LevelMetaGroup`
- lights work when placed on external walls, but not on internal walls
- BUG: steiners weren't included in NavGraph
- can tag multiple metas in `LevelMetaGroup`
- can navigate via up/down inside input; placeholder `tag meta-2`
- can remove single meta or whole group
- command substitution should spawn subshell
- BASHPID should be pid of 'current bash', including subshell
- Reimplement `$$` by checking ancestrol processes
- `circ` and `rect` are mutually exclusive triggers
- `rect` and `light` are mutually exclusive
- `r-x` and `r-x-y` specify light radius
- meta pickups `pickup` have arrow icon
- meta obstruction `block`
- meta `door` replaces `block` and cuts through internal walls
- store and draw adjusted `internalWalls`
- light travels through doorways; 3d supports doorways
- meta `icon` shows svg icon
- modifiers choose icon e.g. `phone`
- Try icons 'essential pack' from https://flaticon.com 
  > Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
- meta `icon` scaled/offset correctly
- Try placing icons next to walls outside navigable
- metas `horiz` and `vert` (rect tags)
- meta `cut` (rect tag)
- BUG serialization of array `x=(foo bar baz)` and `x+=y`
- BUG `x=(foo bar baz); x+=qux` not working (outputs `qux bar baz`)
- BUG: declare doesn't print number arrays correctly
- BUG `x=(foo bar baz); x+=( qux )` should append
- BUG: `cat` + enter + `foo` + enter should show `foo` immediately
- in 3d, wall segs should be thin rects
- Fix `foo() { echo ${1}; echo $(( 1 + $( echo $1 ) )); }`
- Fix bug: `sum() { [[ ${1} -eq 0 ]] && { echo 0; return; }; echo $(( ${1} + $( sum $(( ${1} - 1 )) ) )); }`
- BUG: transpile of pipe is wrong `echo foo | echo bar | echo baz`
- avoid floor plan art, stick to icons
- navigation:
- line-of-walk test via negation of polys.
- initially Floyd-Warshall does pairwise line-of-walk checks for connectivity,
  skipping any further computation during algorithm
- `ViewGraph` has working `isVisibleFrom`.
- Use `ViewGraph` of nav poly during `FloydWarshall`.
- Cleanup initial/final bends in NavPaths.
- move meta dialog to front on open/click
- Default meta icons: door, light, rectangle, circle, other
- Remove meta `pickup`; add meta `table`.
- Live mode exists and hides defaulted icons.
- Cannot edit level in live mode.
- Navigation issue involving coarse initial/final rectangle:
  - FIX: rect's nav nodes include steiner points.
  - Also, we can ignore nodes inside only one rect (efficiency).
- Move 3d container into `Level3d`, rename `LevelMouse` as `LevelSvgMouse`.
- Move transformed svg content into `LevelSvgWorld`.
- New approach to meta popovers i.e. use sub-menu instead
- `LevelMetaMenu` auto-focus with icon highlighting
- In live mode, on click meta shows read-only summary
- Reconsider background.md
- Only one meta at a time; escape closes meta even when not focused
- Fix light polygon defects at line seg corners
