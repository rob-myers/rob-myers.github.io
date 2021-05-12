## three.js CLI

### TODO

- permit "pure" js functions by attaching to `use`?
- can define shell fns via syntax-highlighted js text
  - `function foo({ use: {THREE} }) {}` becomes `call`
  - `const foo = (...) => {}` becomes `call`
  - `async function* foo({ read }, { use }) {}` becomes `run`

- Add `xbcopy` i.e. copy to clipboard
- Can reset stage
- Error messages prefixed by function chain

### BUG

- ✅ `call () => window` (window.Recast was breaking safe-json-stringify)
- ✅ `call '({ stage }) => delete stage.opt.foo'`
- Ensure old processes killed cleanly on hot reload

### Done

- ✅ improve axes
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
# reading and writing
poll | run '({ read, _: {msg} }) { while (msg = await read()) yield* ["hi", msg]; }'
# spawn from js
run '({ spawn }) { yield* await spawn("ls /stage.opt") }'
```
