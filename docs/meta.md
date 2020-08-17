## Todo

- [ ] try standard thunk approach; what about `GeomService`?
- [x] merge bipartite reducer into geom reducer/worker
- [ ] codepen for env
- [x] instead, use our version of svg pan-zoom with grid i.e. `Env`
- [x] svg pan zoom with grid
- [ ] Can collapse/expand each blog entry
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
