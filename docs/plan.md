## Robots

### TODO

- Start work on behaviour tree GUI

- ✅ Move helpers into functions
- ✅ Remove `stage.root`
- Use persisted scene directly, rather "root group"
  - Stop using react-three-fiber

- Implement pointer events as react-three-fiber does:
  - packages/fiber/src/core/events.ts
  - packages/fiber/src/web/events.ts

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
