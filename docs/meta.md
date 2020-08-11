## Todo

- [x] New branch `sans-monaco-2020` without monaco editor.
- [ ] Start list of desired ai behaviours.
- [ ] Start blog concerning stepwise AI development.

## Technical approach

Our web-based engine has three parts:

### __geom__

Rectilinear levels specified via `react` components.
Auto-generated navmesh with minimal number of rectangles.
Truly optimal path-finding via recent [Polyanya algorithm](#cite-polyanya).

### __visual__

top-down view with 3d walls via `react`, `SVG` and `CSS3`.

### __behave__

CLI-style behaviour specification via `rxjs`. -->


## Rough ideas

Can slow down, can reverse, can reproduce.
  - Store history which can be run backwards.
  - Bot state visible via behaviour trees.
  - Bot state somehow reversible
