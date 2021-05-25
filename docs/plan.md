## Robots

### TODO

- Behaviour tree diffing
  - Render tree with `preact.render` and `htm`
  - Investigate diffing on reinvoke `preact.render` (same el, different tree).

- Move helpers into functions
- Auto-load helpers
- Remove `stage.root`

- Prefer to create modules at runtime using blob urls
  > Seem to recall there's no module garbage collection, but so what

- eliminate `Geom` and `geom.service`
  > use `earcut`, `GeoJsonPolygon` and `polycutting` directly

- Only auto-persist stages that have been touched
- stop redux devtools from crashing
- handle persist in multiple tabs?
- can turn off persist for whole page (this is not persisted)

### BUG

- firefox sometimes flickers on click pause
### Done

- ✅ code library built using js files instead of plaintext
