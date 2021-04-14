## Project

1. Our project will be called _three.js CLI_ or similar.
   > Interactive sessions for three.js

2. Decouple `Brush` from mesh create/cut/delete.
Can select many rects. Can still lock. Has group where ghost meshes can be attached.

3. Clean simplified rewrite of shell. No asyncFromObservable. Cleaner approach to pipelines.

4. Main focus is:
   - Convert atoms e.g. `Sensor sensed you` into small demo(s).
   - Build composite programs e.g. causes alarm, guard checks monitor, guard comes to last know location, guard sees you, finished.

### TODOs

...

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
