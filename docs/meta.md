Remember our aims: (a) clarify Game AI, (b) better behaviours.

## Todo

- [ ] can reset env ui; must 1st click to start pan-zoom
- [ ] Can collapse/expand each blog entry

- [ ] can query polyanya in webworker and display navpath
- [ ] on 2nd click compute a navpath and display it
- [ ] onclick floor show cube

- [x] `Env` registers with state and `Room`s lookup `highWalls` there

- [ ] can transpile `|`
  > subterms can have different `nestedRedirs` e.g. pipe children
  > `|` amounts to `Promise.all`

- [ ] improve `click`
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
