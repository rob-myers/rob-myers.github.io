# Website objectives

We plan to create a website concerned with Game AI. We will provide an editor so scenarios can be created and experienced. Users of the website can create scenarios and save them as textual "comments". The website will be arranged as a blog e.g. concerned with a particular setting, or a particular Game AI technique. There will also be a general area where users can post ideas/scenarios unrelated to the blog posts.

## The editor

The editor consists of one or more `Terminal`s and a `Stage`.

Will split UI pipeline into two while awaiting:
> https://github.com/mvdan/sh/issues/692

### TODO

- Bug combining selection flip with rotate 

- Indicate brush position, for adding meshes
- Import a textured crate from blender
- Can place crates
- Work on a humanoid in blender
- Ensure recast navmesh is working
- Canvas filter provides dynamic player light

- Can launch scripts e.g. UI pipeline(s)
- A `Terminal` can auto launch scripts
- Walls too close to light have truncated shadows?
- Can add lights

- Start writing post / decide on blog format

Blog layout related tasks
- `Terminal` and session has `sessionKey` and `stageKey`.
- Can persist Stage geometry
- Can pause/resume `Stage` with grey preview, un/mounting `Stage`
- On pause/resume `Stage` we pause/resume all running processes
- Auto pause on scroll out of view
- Auto pause on start/resume another `Stage`

- Fix multiline command launched from intermediate line
  > Originally was going to have low/medium walls too
- Review and clean `Brush` code
- Programmatically defined `Select` UI?
  > e.g. saved polygon templates, blender imports, shortcuts

- Expose outset wall/bounds params

- Replace `defs` by `declare` (handle special mvdan-sh parsing)
- `ps -s` shows full process src
- How do `key` and `poll` work; can they be simplified?
- Make a blender model and import it
- Add `cat` back in as a function

- Try building a low poly character in blender
- Beginners guide:
  - https://www.youtube.com/watch?v=7MRonzqYJgw&ab_channel=GrantAbbitt
  - https://www.youtube.com/watch?v=L0AY61v6-M4&ab_channel=GrantAbbitt
- Model: https://www.youtube.com/watch?v=4OUYOKGl7x0
- Rigging: https://www.youtube.com/watch?v=srpOeu9UUBU


- Implement comments using build and client-side calls:
  > https://eiriksm.dev/walkthrough-github-comments
- Must navigate to GitHub to actually post comments

### Animation

```tsx
const mixer = useRef<THREE.AnimationMixer>();
useFrame(((_, delta) => mixer.current?.update(delta)));

const clip = animService.fadeInOutClip();
mixer.current = new THREE.AnimationMixer(selectorRef.current!);
const action = mixer.current.clipAction(clip);
action.play();
action.timeScale = 20;
```

### DONE

✅ have `Terminal`
✅ have `Stage`
✅ can use `Terminal` to create rectilinear polygons in `Stage`
✅ can create rectangular selection using mouse
✅ need setting/theme/story to bring it to life
   > We will remake Teleglitch on the web
✅ can `get /brush/sides`
✅ can `set /brush/sides 4`

✅ `Terminal` can run background processes
✅ can read from stage key events via `key`
✅ list processes via `ps`
  > have pid, ppid, pgid, sid, icon, src
✅ can kill processes
✅ Represent newlines in history using single char `¶` rather than `$'\n'`
✅ can `read >data`
✅ can `while read >data do ... done` and `while sleep; do echo foo`
✅ can suspend/resume processes via `kill --STOP` and `kill --CONT`
✅ Preload functions

✅ Removed `while` and more generally will not add loop
  constructs for shell. So, pipelines will not be created in loops.
✅ Use `meta.fd` rather than 'stdOut' and 'stdIn'
✅ Exactly one place `.readData` and exactly one place where `.writeData`.
✅ Stop using device proxy i.e. guard `.readData`/`.writeData`
✅ Complete code modifying `brush` on key events.
✅ Better support for multiline history: left/right/backspace
✅ Have layers with multipolygons and attribs
✅ Can add/delete 3d walls iinto default layer via brush and a/d
✅ Simplify brush i.e. only rectangles.
   > Polygonal brush is hard to get right.
✅ Decided against layers
  > `stage.polygon` defines named polygons
  > `stage.block` defines visible blocking polygons with height 
✅ Can edit stage.maxHeight
✅ Can edit stage.opacity
✅ Added central dot
✅ Add x/y axes
✅ Can flip selection in x/y axes
✅ Can rotate selection by -/+ 90 deg
✅ `f` to fill, `shift-f`/backspace to delete
✅ Cmd+C selects, Cmd+X cuts, Cmd+V pastes, Esc unselects
✅ Can undo/redo polygons via Cmd-Z
✅ Replace `stage.block` by `stage.walls`
✅ `stage.bounds` auto-computed rect based on walls
✅ Persist `stage.polygon`
✅ Auto-generate `stage.polygon.navigable`
✅ Auto build recast navmesh
✅ Depict `Navigable`
✅ Add shadows
✅ Can toggle lighting
✅ `Navigable` draws inverse of polygon.navigable
✅ Can make dark via `set stage/opts/background black`
✅ Emphasise something is currently selected via white border