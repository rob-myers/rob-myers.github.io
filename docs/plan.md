## Three.js Behaviours

### TODO

- Start work on behaviour tree GUI
  - ✅ decided to use react-flow
  - ✅ can add/remove links (add label to aid removal)
  - can add/remove nodes

- ✅ use react-ace instead of react-simple-code-editor
- provide SSR initial render for react-ace e.g. via React.Suspense?

- eliminate `Geom` and `geom.service`
  > use `earcut`, `GeoJsonPolygon` and `polycutting` directly

- create a `@box2d/core` demo

- Only auto-persist stages that have been touched
- stop redux devtools from crashing
- handle persist in multiple tabs?
- can turn off persist for whole page (this is not persisted)
- Implement pointer events as react-three-fiber does?
  - packages/fiber/src/core/events.ts
  - packages/fiber/src/web/events.ts

### BUG

- firefox sometimes flickers on click pause

## Links

- https://discourse.threejs.org/t/procedural-island-and-city-generator-and-flight-simulator-three-js/18816

### Done

- ✅ Move helpers into functions
- ✅ Remove `stage.root`
- ✅ Use persisted scene directly, rather than "root group"
  - ✅ remove use react-three-fiber
  - ✅ remove root group

- ✅ code library built using js files instead of plaintext
