## Birdseye CLI

Main focus:
- Convert atoms e.g. `Sensor sensed you` into small demo(s).
- Build composite programs e.g. causes alarm, guard checks monitor, guard comes to last know location, guard sees you, finished.

### TODO

- Simplify selection UI
   - ✅ Can clear via escape
   - ✅ Can lock via copy/cut
   - ✅ Remove additive option and clean away ui
   - ✅ Can add/erase obstruction with undo/redo
   - locked ui icon
   - Review CLI function `sel`

- Can add/remove lights via CLI
   - ✅ Can list: `light`
   - ✅ Can add: `cursor | light`
   - ✅ Can remove: `light rm light1`
   - Can modify: `light 'l => l.position.x += 1' light1`
- ✅ Add `stage.opts.ambientLight`

- Working towards character
   - Design a character in blender e.g.
      - https://www.youtube.com/watch?v=4OUYOKGl7x0&t=604s&ab_channel=GrantAbbitt
   - Rig a character in blender e.g.
      - https://www.youtube.com/watch?v=f2pTkW-1JkE&ab_channel=Blender
      - https://www.youtube.com/watch?v=rcPema_ec08&ab_channel=3DBlenderTutorialsbyianscott888
      - https://unboring.net/workflows/animation.html
   - Walk cycle in blender https://www.youtube.com/watch?v=gFf5eGCjUUg&ab_channel=SebastianLague
   - Have idle/walk/run on one character in blender
   - Import into three.js e.g.
      - https://www.youtube.com/watch?v=8n_v1aJmLmc
   - Character controller e.g.
      - https://www.youtube.com/watch?v=8n_v1aJmLmc

- Can paint polygons using CLI

- ✅ Add builtins `true` and `false`
- ✅ Implement `IfClause` in shell
- ✅ Can `spawn()` instead `run`
- Add `xbcopy` i.e. copy to clipboard
- Can output serialized stage and reload from text
- Can reset stage


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

- Cleanup code
   - ✅ remove `stage.opts.wallColor`
   - ✅ remove Geom.Polygon.fromRect
   - ✅ auto-track `prevWall` and `prevObs`
   - ✅ only one selection key handler
   - ✅ remove `stage.opts.background`

- Can construct wall meshes from selection
   - ✅ Have `stage.poly.{wall,nav,obs}`
   - ✅ Can paint into `stage.poly.wall`
   - ✅ Can erase from `stage.poly.wall`
   - ✅ `World` shows walls
   - ✅ Have stage options `wallOpacity` and `wallHeight`

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
> https://github.com/mvdan/sh/issues/699
> ✅ https://github.com/mvdan/sh/issues/692


## Examples
```sh
get stage.internal.cursorGroup.position | map 'p => p.set(1, 1)'
cursor | map 'p => p.set(1, 1)'
get stage.sel.bounds
call '(_, ...args) => args' 1 2 3
call '({ use: {THREE} }) => new THREE.SpotLight'
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

Preferences > Input > Keyboard > check Emulate Numpad
Uncheck GLTF export > Transform > `+Y up`
Character turnaround sheet
Option-r to reset rotation
Option-g to reset translation
Shift-RMB moves cursor to mouse
Shift-d to duplicate
Ctrl-R to loop cut (Edit mode)
Alt-z for x-ray mode
https://www.blendswap.com/blend/3639
Cmd-RMB to add vertex (Edit Mode, Vertex)