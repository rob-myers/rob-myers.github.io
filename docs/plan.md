## Project

Our project will be called _Topdown CLI_ or similar.
   > Interactive sessions for three.js

Main focus is:
   - Convert atoms e.g. `Sensor sensed you` into small demo(s).
   - Build composite programs e.g. causes alarm, guard checks monitor, guard comes to last know location, guard sees you, finished.

### TODO

- Can construct wall meshes from selection
   - ✅ Have `stage.poly.{wall,nav,obs}`
   - ✅ Can paint into `stage.poly.wall`
   - ✅ Can erase from `stage.poly.wall`
   - ✅ `World` shows walls
   - ✅ Have stage options `wallOpacity` and `wallHeight`
- Simplify selection UI
   - ✅ Can clear via escape
   - ✅ Can lock via copy/cut
   - ✅ Remove additive option and clean away ui
   - Can add/erase obstruction (with undo/redo)
   - Can add/remove lights via CLI
   - Can paint polygons using CLI
   - Review CLI function `sel`
- Cleanup code
   - ✅ remove `stage.opts.wallColor`
   - ✅ remove Geom.Polygon.fromRect
   - ✅ auto-track `prevWall` and `prevObs`
   - ✅ only one selection key handler

- Work towards character


- 🛠 Try to simplify the shell.
   - ✅ Clean semantics.service.
   - ✅ Remove dependency on asyncIteratorFrom
   - Clean cmd.service.
   - Simplify pipelines?
   - Simplify FifoDevice and Device?

- Error messages prefixed by function chain
- Sketch out milestones

- BUG
   - ✅ `call () => window` (window.Recast was breaking safe-json-stringify)
   - `call ({ stage }) => delete stage.opts.foo`
   - Ensures old processes killed cleanly on hot reload

### Done

- ✅ While locked can transform Selection, and apply on unlock.
- ✅ Can lock `Selection` and transform via keys
- ✅ Can mirror `Selection` x/y
- ✅ Can rotate `Selection` ± 90 degrees
- ✅ Support `return` inside a function
- ✅ Create replacement for brush i.e. `Selection`
  - ✅ Can select rectilinear polygons.
  - ✅ Can save/restore selections.
   - ✅ `sel >l1` saves current selection as json polygon
   - ✅ `get l1 | sel` to restore
   - ✅ session variables are persisted
✅ Make `Cursor` independent of `Selection`
✅ Can lock and then translate
✅ Can `echo foo >x` to write last elem, not array
✅ Can `echo foo >> x` to write array, appending to extant
✅ Can `rm` variables
## Issues

Issue related to shell
> https://github.com/mvdan/sh/issues/692


## Examples
```sh
get stage.extra.cursor.position | map 'p => p.set(1, 1)'
get stage.cursor | map 'p => p.set(1, 1)'
get stage.sel.bounds
```

### Three.js Animation example

```tsx
const mixer = useRef<THREE.AnimationMixer>();
useFrame(((_, delta) => mixer.current?.update(delta)));

const clip = animService.fadeInOutClip();
mixer.current = new THREE.AnimationMixer(selectorRef.current!);
const action = mixer.current.clipAction(clip);
action.play();
action.timeScale = 20;
```

### Blender

Uncheck GLTF export > Transform > `+Y up`
