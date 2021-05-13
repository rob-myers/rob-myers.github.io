## three.js CLI

On command line, need to `scene.scale.set'(1, 1, 1)'`,
otherwise js syntax conflicts with shell function syntax.
Adding quotes permits space e.g. `scene.children.map'(x => x.name)'`

### TODO


- can define shell fns via syntax-highlighted js text
  - replace `react-code-editor` by our own solution
  - `function foo({ use: {THREE} }) {}` becomes `call`
  - `const foo = (...) => {}` becomes `call`
  - `async function* foo({ read }, { use }) {}` becomes `run`

- permit "pure" js functions by attaching to `use`?
- try to remove `Geom`, using `earcut`, `GeoJsonPolygon` and `polycutting` directly

- Add `xbcopy` i.e. copy to clipboard
- Can reset stage
- Error messages prefixed by function chain

### BUG

- ✅ `call () => window` (window.Recast was breaking safe-json-stringify)
- ✅ `call '({ stage }) => delete stage.opt.foo'`
- Ensure old processes killed cleanly on hot reload

### Done

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
call '(_, ...args) => args' 1 2 3
call '({ use: {THREE} }) => new THREE.SpotLight'

poll | run '({ read, _: {msg} }) { while (msg = await read()) yield* ["hi", msg]; }'
run '({ spawn }) { yield* await spawn("ls /stage.opt") }'

scene.children.map'(x => x.name)'
```
