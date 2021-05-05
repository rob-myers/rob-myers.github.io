## Birdseye CLI

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
   - Create Minecraft Steve in blender
      - ✅ https://www.youtube.com/watch?v=pbwEHN15HbI&ab_channel=TutsByKai
   - Rig a character in blender
      - ✅ https://www.youtube.com/watch?v=6DfF6r1Bpq4&ab_channel=SeyitAliYAPRAKCI
   - Add IK bones for knee/heel
      - ✅ https://www.youtube.com/watch?v=Pt3-mHBCoQk&ab_channel=RoyalSkiesLLC
   - Walk cycle in blender
      - ✅ https://www.youtube.com/watch?v=gFf5eGCjUUg&ab_channel=SebastianLague
   - Import into three.js
      - ✅ Can import and clone model
      - ✅ Can persist model
      - Can play model
   - Have idle/walk/run on one character in blender
      - https://unboring.net/workflows/animation.html
   - Character controller e.g.
      - https://www.youtube.com/watch?v=EkPfhzIbp2g&t=6s

- Static shadows for static geometry
- Bot shadows using hack:
   > https://threejs.org/examples/?q=shado#webgl_shadow_contact

- Implement `cd` and `pwd`
   - e.g. `cd stage.light`
   - `cd`, `cd -`, `cd .`, `cd ..`.
   - `pwd`
   - Affects `ls`, `get`, `rm` and `set`
   - Need `ls -a` to see top-level `PWD` and `OLDPWD`


- Can create lines
   > Need to outset line by computing intersection points
- Can paint polygons using CLI
   > We'll use them to create triggers

- Concerning style:
   - still feel `obs` are too simplistic
   - lets try creating some meshes
   - maybe keep the walls high and use 1/2/3

- ✅ Add builtins `true` and `false`
- ✅ Implement `IfClause` in shell
- ✅ Can `spawn()` inside `run` command
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

## mvdan-sh issues

- https://github.com/mvdan/sh/issues/302#issuecomment-831394912
- ✅ https://github.com/mvdan/sh/issues/699
- ✅ https://github.com/mvdan/sh/issues/692

## Examples

See the [code library](../model/sh/code-library.ts).

```sh
get stage.cursor | map 'p => p.set(1, 1)'
cursor | map 'p => p.set(1, 1)'
get 'stage.cursor.set(1, 1, 0)'
get stage.sel.bounds
call '(_, ...args) => args' 1 2 3
call '({ use: {THREE} }) => new THREE.SpotLight'
# reading and writing
poll | run '({ read, _: {msg} }) { while (msg = await read()) yield* ["hi", msg]; }'
# spawn from js
run '({ spawn }) { yield* await spawn("ls stage.light") }'
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

Ctrl-r to loop cut in Edit mode

Alt-z for transparent mode

Cmd-RMB to add vertex (Edit Mode, Vertex)

Set origin of object as its center
> Object Mode; RMB; Set origin; Origin to Geometry

Set origin of cube as bottom center
> Edit mode; Select bottom face; Shift-S; Cursor to active; Object Mode; RMB; Set origin; Origin to 3D Cursor

Minecraft textures: Turn off mip-map on texture.
> Material's shader > Image Texture > (Interpolation) closest

X-ray armature: Object Data Properties > Viewport display > In Front

Switch to/from armature pose mode `Ctrl-Tab`

Focus with `/`

Option-LMB to select edge loop

Larger selection via Ctrl-+

Given aligned Character mesh and armature, can:
1. Join mesh into single object `Character`.
2. Add a vertex group `Head` (Object Data Properties).
3. Select head vertices in edit mode and click `Assign` button.
4. Add an Armature Modifier to `Character`, choosing armature.
5. Parent `Character` to armature (Object properties).
6. Try rotating the head bone in pose mode.

Join selected vertices with `j`

Dissolve selection via `Ctrl-x`

Insert keyframe with `i`

Timeline > Keying > Active keying set > `Location and Rotation`

To reset pose mode, select all bones, Option-r, Option-g

When pasting reversed keyframes, change keyframe and `Cmd+Shift+V` over pose view.