Remember our aims: (a) clarify Game AI, (b) better behaviours.

## Todo

- [ ] can reset env ui; must 1st click to start pan-zoom
- [ ] Can collapse/expand each blog entry
- [ ] remove `Observable<ProcessAct>` syntax?
- [ ] fix mobile touch in `three/controls` (perhaps devtools issue)

- [ ] prevent recursive background processes i.e. tie to parse tree

- [ ] subshells/cmd-subst should not change shell functions
- [ ] `shift` builtin for functions
- [ ] `steiner` labels a point in the world
  > it could track a changing variable
- [ ] `World` should fade-in
- [ ] circular/rectangular triggers
- [ ] wrap three raycasts
  > navRect could be future optimisation
- [ ] UI buttons
  > can ctrl-c
  > can auto send world events to tty
- [ ] builtin `paste r` pastes & runs `string` or `string[]` output?
- [ ] `range 10` is compositional if `0 1 2 ...`, but not if an array

- [ ] implement `trap code_or_function 2`
  > can cancel background goto `goto p & trap "kill $!" 2`

- [ ] BUG `goto` error messages on takeover not always sent
- [ ] BUG `TtyXterm` blocks/ignores lines from other processes on paste
- [ ] implement joined-up gotos
- [ ] can `decor foo` to show navpath and name it `foo`
  > remove builtin `way`
  > can `decor rm foo`
  > can `decor` to list decorations
- [ ] actor can cast visible ray

- [ ] event system i.e. enter/exit nav-rect
  > consider removing rectilinear requirement
  > spacial partitioning or pre-existing solution?

- [x] `ps` term should `@bob-1 watch` instead of `@bob-${i} watch`

- [x] limit background processes by original subterm
  > e.g. runaway: `while true; do @bob go $(click) & done`
  > Decided against: complex, arbitrary, and can just refresh page
  > TODO _kill/throttle processes that spawn too many bgs_

- [x] implement `kill` supporting SIGINT
- [x] can list running processes
- [x] `@bob watch` keep facing towards mouse
- [x] `@bob watch alice` keep facing towards alice
- [x] `@bob relax` stop watching
  
- [x] verify `ps` shows bg processes spawned in bg

- [x] avoid 500kb initial load via mvdan-sh in webworker
  > only saved ~220kb i.e. 580kb -> 358
- [x] move parse-sh.service into own webworker
  > made webworker but decided to just use dynamic import
- [x] remove deps on parse-sh.service

- [x] cleanup site and deploy
- [x] change `goto $(click) bob` to `@bob goto $(click)`
  > remove `goto`
- [x] `@bob face alice` faces towards once
  > alias `@bob look alice`
- [x] `@bob speed 0.03` changes speed
- [x] `@bob stop` cancels any running `goto`
- [x] `@bob` to make camera follow bob
  > `@camera` for free camera
  > `@bob at` get current position
  > remove `follow`
- [x] fix error on Ctrl-C:
  ```sh
  while true; do echo foo >/tmp/x; done |
  while read line; do echo ${line}; done </tmp/x
  ```
  i.e. `TypeError: Cannot read property 'cleanups' of undefined`
- [x] actors have a shadow
- [x] camera can follow actor
- [x] remove anime.js
- [x] builtin `call '(, [k]) => k * Math.random()' 5` and can provide js args
- [x] avoid bounce-back on override goto
- [x] replace use-cannon with:
  > https://github.com/erosmarcon/three-steer
  > could implement triggers ourselves via navrect partition
- [x] use physics engine to follow path
- [x] remove use-cannon
- [x] `nav $(click) $(click) >@foo` sets variable `foo`
  > avoids serialization
  > avoids syntax `... as foo`
- [x] replace three-pathfinding with babylonjs recast plugin
  > https://github.com/BabylonJS/Babylon.js/blob/master/src/Navigation/Plugins/recastJSPlugin.ts
  > https://www.npmjs.com/package/recast-detour
- [x] `nav` and `spawn` supports string inputs
- [x] fix nested command substitution
  > e.g. `s=$( nav $(click) $(click) )`
  > this will permit `goto $( nav $(click) $(click) ) bob`
- [x] spawn a bot at each point along navpath
  `for i in {0..3}; do spawn bot-${i} $(  get r[${i}] ); done`
- [x] sometimes can't navigate from corner nav points
  > https://github.com/donmccurdy/three-pathfinding/issues/68
  > `goto: failed with error: TypeError: Cannot read property 'map' of null`
  > patched `findPath` i.e. do not require points to be inside nav poly,
    instead the closest node is picked.
- [x] actor turns along path
- [x] Consider `while click p; do goto p bob & done`
  > ensure all bg processes resolve
- [x] `goto`: most recent process cancels previous
- [x] ctrl-c `goto` stops motion
- [x] `goto` command
  > can `goto [path] bob`
  > can `goto [point] bob` (does planning)
- [x] `spawn` command
  > spawn an actor at a position
- [x] can display navpath
  > use builtin `way p` which toggles visibility
- [x] `nav` builtin queries three-pathfinding in webworker and receives navpath
  > create navworker
  > can add/remove navigable
  > can query navpath via builtin `nav`
- [x] abandon polyanya, use three-pathfinding instead
- [x] `Env` persisted via react-reverse-portal
- [x] cleanup polyanya interface
- [x] can configure iterator delay via builtin `throttle`
  > only permit `1s` (default/fallback), `0.5s`, `0.25s`
- [x] iterators `for`/`while` have inbuilt delay (e.g. at least `1s`)
- [x] `while` supports builtins `break` and `continue`
- [x] implement cancellable `while`
- [x] ensure we cannot create a file which is already a directory
- [x] support `read x y z` when input is a string

- [x] remove builtin `tick`; create builtin `read`
- [x] rooms cast shadows
- [x] can mount `inners` inside `Room`s, which mutates navmesh
- [x] simplify `Room` i.e. scale walls and adjust gltf rotation elsewhere
- [x] load room `inners` from Blender into geom.store

- [x] implement background processes
- [x] simplify ofds (probably more to do)
- [x] remove path resolution i.e. all paths absolute
  > no `PWD` or `OLDPWD`

- [x] Ctrl-C causes `throw null` from leaf to root
- [x] implement command substitution
- [x] shell functions receive prefixed variables `x=y foo p`

- [x] extend `click`
  > can store points via `click evt`
  > decided against blocking click for the moment
- [x] can create shell functions from js ones
  >  e.g. `def range '({ 1: n }) => [...Array(Number(n))].map((_, i) => i)'`
  > `(scope) => ...` where `scope` a get/set proxy for nested scope
- [x] align exit behaviour to default shell behaviour
- [x] builtins propagate exit codes

- [x] simplify params for `varService.assignVar`
- [x] no shell scripts, only shell functions
- [x] move `session.cancels` to `process.cleanups`
  > will need to handle background process failures
- [x] can `get x.y.z as p`
- [x] access deep vars e.g. `x.y.z` or `x[4]` via e.g.
  > `Function('o', 'return o.x[4]')(varLookup)`
- [x] can store/retrieve arbitrary objects in bash variables
  > remove typing and massively simplify

- [x] support variable lookup via simple command
  > can also redirect
- [x] shell functions receive positionals in own scope
- [x] justify decision that pipelines are just parallel processes
  > behaviour trees use parallel
  > we're wrapping `Promise.all()`
  > we don't implement fifos (no backpressure)
  > local vars more common
  > can still pipe via `mkwire` and explicit redirects
- [x] can define and execute functions
- [x] can transpile `|`
  > `|` amounts to `Promise.all`
  > create new process per pipe-child as before
  > Ctrl-C cancels in foreground

- [x] `Env` registers with state and `Room`s lookup `highWalls` there
- [x] improve `click`
- [x] builtin `click` awaits clicks from environment
- [x] `/dev/world-{ttyId}` provides click events
- [x] can spawn a process (without starting it)
- [x] can fork process
- [ ] fix exit code propagation
- [x] can transpile `&&` and `||`
- [x] 'normal writes' are brown, shell errors are red
- [x] get shell history working
- [x] `OpenFileDescription` has `FsFile`
- [x] `FsFile` has readable/writable `ShellStream` which may be the same
- [x] `ShellStream` has only one internal stream

- [x] can transpile simple command to builtin
- [x] tops of walls autoscaled, no need in blender
- [x] terminal has 'listening process' which:
  > continually attempts to read/parse tty input
  > continually prompts for more input

- [x] remove filesystem i.e. inodes
  > `OpenFileDescription`s now point to `Subject`s
- [x] navmesh autogen from meshes on floor
- [ ] can build `Row`s of rooms
- [x] can instantiate rooms
- [x] load rooms.gltf using `GLTFLoader` and store in state

- [x] replace previous approach
- [x] build demo level entirely in blender
- [x] r3fiber: import from blender
