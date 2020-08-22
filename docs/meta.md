Remember our aims: (a) clarify Game AI, (b) better behaviours.

## Todo

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
  ```sh
  # from repo root
  cp ../3d/first.gltf ./public/first.gltf
  npx gltfjsx public/first.gltf
  mv First.js components/demo/three/First.jsx 
  ```
- [x] r3fiber: create some walls & tables manually
- [x] r3fiber pan-zoom with grid
- [x] `GeomRoot` induces `RectNavGraph`
- [x] `GeomRoot` induces 3d walls
- [x] `GeomRoot` supports `Wall` and recursive `g`
- [x] merge bipartite reducer into geom reducer/worker
- [x] instead, use our version of svg pan-zoom with grid i.e. `Env`
- [x] svg pan zoom with grid
- [x] Start blog concerning stepwise AI development.
- [x] New branch `sans-monaco-2020` without monaco editor.


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
