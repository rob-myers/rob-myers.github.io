## Three.js Behaviours

### TODO

- ✅ Permit `Stage` to have many cameras
- At most 2 open (auto-close others)

- Start writing first blog post
  - Explicit Game AI code; playable/editable
  - Formal approach
  - Minimalistic combinations of concepts
    - select + pathfinding
    - From A to B (select + pathfinding + trigger).
    - From A to B, but need key (as player)
    - From A to B, but need key (as bot without info)

- @runtime try css-in-js with preact
  > https://github.com/cristianbote/goober

- `CodeEdit` has tabs

- try using a service-worker to define routes dynamically
  - ✅ can we do dynamic imports and also change the file contents?
  - ✅ would like to avoid our own "transpilation"
  - use IndexedDb to maintain state
  - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#custom_responses_to_requests


- ✅ use react-ace instead of react-simple-code-editor
- provide fallback SSR initial render for react-ace

- eliminate `Geom` and `geom.service`
  > use `earcut`, `GeoJsonPolygon` and `polycutting` directly

- create a `@box2d` demo
- use three.js `scene.userData` to persist variables etc
- use dev-console for debugging e.g. can re-console.error

- Only auto-persist stages that have been touched
- stop redux devtools from crashing
- handle persist in multiple tabs?
- can turn off persist for whole page (this is not persisted)
- Implement pointer events as react-three-fiber does?
  - packages/fiber/src/core/events.ts
  - packages/fiber/src/web/events.ts

- 2 core components
  > `Stage` (THREE.Scene and THREE.Camera)
  > `CodeEdit` (ACE editor + javascript modules)

### BUG

- firefox sometimes flickers on click pause

## Links

- https://discourse.threejs.org/t/procedural-island-and-city-generator-and-flight-simulator-three-js/18816

### Done

- ✅ Remove behaviour tree code
- ✅ Move helpers into functions
- ✅ Remove `stage.root`
- ✅ Use persisted scene directly, rather than "root group"
  - ✅ remove use react-three-fiber
  - ✅ remove root group
- ✅ code library built using js files instead of plaintext
