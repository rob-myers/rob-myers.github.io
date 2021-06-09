## Three.js Behaviours

### TODO

- 1st blog needed (will inform components)
  - Could be an in-depth-intro into 3 core components
    > `Stage` (THREE.Scene and THREE.Camera)
    > `CodeEdit` (ACE editor + javascript modules)
    > `BehTree` (react-flow-renderer and Behaviour forests)

  - Permit `Stage` to have many cameras
  - Fixing scene and camera, opening an instance auto-closes others.
  - Behaviour tree has tabs so can revisit

- Work out behaviour tree GUI (`ReactFlowDemo`)
  - ✅ decided to use react-flow
  - ✅ can add/remove links
  - ✅ blue outline on select
  - ✅ can copy-paste nodes
  - can choose in/out orientation
    - in: left or top, 1 node per handle
    - out: right or bottom, 1 node per handle
  - can undo/redo

- try using a service-worker to define routes dynamically
  - ✅ can we do dynamic imports and also change the file contents?
  - ✅ would like to avoid our own "transpilation"
  - use IndexedDb to maintain state
  - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  - https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#custom_responses_to_requests


- ✅ use react-ace instead of react-simple-code-editor
- provide SSR initial render for react-ace e.g. via React.Suspense?

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
