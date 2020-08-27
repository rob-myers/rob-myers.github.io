Remember our aims: (a) clarify Game AI, (b) better behaviours.

## Todo

- [ ] terminal has 'listening process' which:
  > continually attempts to read/parse tty input
  > continually prompts for more input

- [ ] can reset env ui; must 1st click to start pan-zoom
- [ ] try standard thunk approach; what about `GeomService`?
- [ ] codesandbox.io for env
- [ ] Can collapse/expand each blog entry

- [ ] can query polyanya and display navpath
- [ ] start implementing reversible behaviour trees

- [ ] 1 blender file 3 gltfs: `empty`, `central-table`, `central-pillar`
  > we'll fit them together like lego blocks
- [ ] replace previous approach
- [ ] tops of walls autoscaled, no need in blender
- [ ] navmesh autogen from meshes on floor
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

Can slow down, can reverse, can reproduce.
  - Store history which can be run backwards.
  - Bot state visible via behaviour trees.
  - Bot state somehow reversible
