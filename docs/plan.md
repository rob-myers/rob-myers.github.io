## Project

Our project will be called _three.js CLI_ or similar.
   > Interactive sessions for three.js

Main focus is:
   - Convert atoms e.g. `Sensor sensed you` into small demo(s).
   - Build composite programs e.g. causes alarm, guard checks monitor, guard comes to last know location, guard sees you, finished.

### TODO

- 🛠 Try to simplify the shell.
   - ✅ Clean semantics.service.
   - ✅ Remove dependency on asyncIteratorFrom
   - Clean cmd.service.
   - Simplify pipelines?
   - Simplify FifoDevice and Device?
- Sketch out milestones
- 🛠 Create replacement for brush i.e. `Selection`
  - ✅ Can select many rects.
  - Can save/restore selections.
  - Can lock and then translate/transform.
  - Has group where ghost meshes can be attached.
  - Could leave "select mode" by saving and locking empty selection

### Done

- Support `return` inside a function

## Issues

Issue related to shell
> https://github.com/mvdan/sh/issues/692


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
