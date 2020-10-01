Remember our aims: (a) clarify Game AI, (b) better behaviours.

## Todo

- [ ] can reset env ui; must 1st click to start pan-zoom
- [ ] Can collapse/expand each blog entry
- [ ] hashes always scrollIntoView
- [ ] try to remove `Observable<ProcessAct>` syntax
- [ ] fix mobile touch in `three/controls` (perhaps devtools issue)

- [ ] prevent recursive background processes i.e. tie to parse tree

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
> [ ] Ctrl-C UI button
- [x] builtin `call '() => Math.random()'` and can provide js args
- [ ] builtin `paste r` pastes & runs `string` or `string[]` output?
- [ ] `range 10` is compositional if `0 1 2 ...`, but not if an array

- [ ] `goto` error messages on takeover not always sent
- [ ] `TtyXterm` blocks/ignores lines from other processes on paste

- [ ] implement joined-up gotos
- [ ] avoid bounce-back on override goto

- [ ] can `decor foo` to show navpath and name it `foo`
  > remove builtin `way`
  > can `decor rm foo`
  > can `decor` to list decorations

- [ ] `nav $(click) $(click) >@foo` sets variable `foo`
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

- [ ] actors have a shadow
- [ ] camera can follow actor

- [ ] use physics engine to follow path?

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


## Technical approach

Our web-based engine has three parts:

### __environment__

top-down view with 3d walls via `react`, `SVG` and `CSS3`.

### __geometry__

Rectilinear levels specified via `react` components.
Auto-generated navmesh with minimal number of rectangles.

### __director__

- Truly optimal path-finding via recent [Polyanya algorithm](#cite-polyanya).
- Behaviour trees.
- rxjs

## Rough ideas

1. Code driven by user e.g. via `tick` (a wrapper about `setInterval`).
2. while/for loops must be guarded e.g.
  - `while read x; do echo $x; done`
  - `for x in {1..10}; do click x y; look $x $y; done`

3. Since variables can now take arbitrary values we need to access them.
  - we'll use e.g. `from x.y[0].z`
  - direct access as simple command causes various issues:
    > https://github.com/mvdan/sh/issues/604
    > `LangPosix` supports but no arrays, `declare`, `CStyleLoop` etc.
    > can't do `${x.y}` in mvdan-sh for any language
