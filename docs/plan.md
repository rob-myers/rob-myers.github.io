## Project

Our project will be called _three.js CLI_ or similar.
   > Interactive sessions for three.js

Main focus is:
   - Convert atoms e.g. `Sensor sensed you` into small demo(s).
   - Build composite programs e.g. causes alarm, guard checks monitor, guard comes to last know location, guard sees you, finished.

### TODOs

- Clean simplified rewrite of shell. No asyncFromObservable. Cleaner approach to pipelines.
   - Remove dependency on `asyncIteratorFrom`
   - Simplify FifoDevice, pipes and IO
- Sketch out milestones
- Create replacement for brush i.e. `Selection`
- Can select many rects. Can still lock. Has group where ghost meshes can be attached.

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
