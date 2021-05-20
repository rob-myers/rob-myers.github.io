## Programmed Behaviour

### TODO

- Can define shell fns via syntax-highlighted js text
  - ✅ persist code via `code.store`
  - ✅ `CodeEditor` tests validity
  - ✅ `CodeEditor` shows error
  - `CodeEditor` send parsed data to session
  - optionally lazyload shell functions/classes
  - `function foo() {}` becomes `call`
  - `async function foo() {}` becomes `call`
  - `function *foo() {}` becomes `run`
  - `async function *foo() {}` becomes `run`
  - `class foo {}` attached to `lib`

- integrate @box2d
  > https://github.com/Lusito/box2d.ts


- write outline of 1st post i.e. walkthrough up to movable bots
- ✅ render some markdown

- eliminate `Geom` and `geom.service`
  > use `earcut`, `GeoJsonPolygon` and `polycutting` directly

- Different processes currently see the same `var.PWD`.
  > PWD and OLDPWD should be handled like +ve positionals?
- Can reset stage
- Pause/resume uses `scene.toJson()` (+ box2d persist?)
- persist individual sessions, analogous to stage.store
- Only auto-persist stages that have been touched
- Can turn off persist for whole page (this is not persisted)

- Add `xbcopy` i.e. copy to clipboard
- Error messages prefixed by function chain
- stop redux devtools from crashing
- handle persist in multiple tabs?
  > https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
- e.g. warn and turn persist off
- need "checkpoints": persist only needed for temporary experimentation

### BUG

- ✅ `scene.children.length` was initially 0
- ✅ `echo scene.children[{0,1}]` was not expanding
- ✅ `call () => window` (window.Recast was breaking safe-json-stringify)
- ✅ `call '({ stage }) => delete stage.opt.foo'`
- Ensure old processes killed cleanly on hot reload

## Notes

On command line, need to `scene.scale.set'(1, 1, 1)'`,
otherwise js syntax conflicts with shell function syntax.
Adding quotes permits space e.g. `scene.children.map'(x => x.name)'`

### Done

- How are Stage/Terminal/Code laid out on a page?
  - ✅ disable stage on scroll out of view 
  - ✅ can choose if persist `Stage`
  - ✅ store stage data under different keys
  - ✅ (convention) each `Stage` has different `stageKey`
  - ✅ (convention) each `Terminal` has different `sessionKey`

- ✅ show stage using react-reverse-portal
- ✅ remove react-reverse-portal,
- ✅ `stage.scene` available when stage disabled
- ✅ `stage.ctrl` available when stage disabled
- ✅ cleaner camera initialization

- ✅ Improve axes
- ✅ Can create line meshes
- ✅ `click` provides next click
- ✅ Can `click 3` to read 3 clicks 
- ✅ Add `stage.opts.ambientLight`
- ✅ Add builtins `true` and `false`
- ✅ Implement `IfClause` in shell
- ✅ Can `spawn()` inside `run` command

✅ Implement `cd` and `pwd`
   ✅ `cd stage.opt`, `cd`, `cd -`, `pwd`
   ✅ `ls -a` to see top-level caps vars e.g. `PWD` and `OLDPWD`
   ✅ Affects `ls`, `get`, `rm` and `set`

## mvdan-sh issues

- https://github.com/mvdan/sh/issues/302#issuecomment-831394912
- ✅ https://github.com/mvdan/sh/issues/699
- ✅ https://github.com/mvdan/sh/issues/692

## Examples

See the [code library](../model/sh/code-library.ts).

```sh
call '({args}) => args' 1 2 3
call '({ use: {THREE} }) => new THREE.SpotLight'

poll | run '({ api: {read}, _: {msg} }) { while (msg = await read()) yield* ["hi", msg]; }'
run '({ api:{spawn} }) { yield* await spawn("ls /stage.opt") }'

scene.children.map'(x => x.name)'
```
