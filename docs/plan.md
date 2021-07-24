## Plan

- Add babel in webworker
- Connect terminal to babel somehow
- Can transpile JSX and to SystemJS via babel
- Cleanup how terminal persists
- Do not auto-persist if localStorage lacks `autopersist=true`

### research

- teleglitch module viewer
  - ✅ @dev can render teleglitch "modules" on a canvas
  - can scroll and zoom canvas
  - show 3d walls using css 3d transforms
  - @prod can view teleglitch modules via images
- start creating polygon approximations using https://vectr.com/

### code-editor
- fix comment toggle for mode `jsx-styled`
  - jsx should be //, /** */ and {/** */}
  - scss should be /** */
  - need not fix all cases, just common ones
- ✅ use customized theme based on vscode-dark
- ✅ highlight styled.div`...` and styled(Component)`...`
- ✅ css`...` should start inside a block context
- ✅ use codemirror
- ✅ get css`...` working with scss
- could try monaco-editor
  - https://www.npmjs.com/package/monaco-jsx-highlighter
  - https://github.com/Microsoft/typescript-styled-plugin#configuration (might work?)
  - https://luminaxster.github.io/syntax-highlighter/

### service-worker
- ✅ can respond with type `application/javascript`
- ✅ `import('/src/module.js')` does not refetch,
  although `import('/src/module.js?v=2')` would.

### shell
- fix `set home/dist {}`
- can trigger shell command from markdown link
- improve `help`
- Use unix-like paths e.g. `/home/src` instead of `/home.src`?
	- ✅ Redo redirects
	- ✅ Redo `get`, bare `get`, `cd`, `ls`, `rm`
- ✅ `api.read` can read lines from tty
- ✅ redirect into cwd rather than `var`
- ✅ support ansi-codes in `$'...'`
- better error "stacks"
  > ✅ have node.meta.stack with function names
 can load modules from unpkg, caching source

### Module over-caching issue

Javascript modules cannot be invalidated from cache, without refresh.
This means hot-reloading will create many stale ones via `import('/src/module.js?v=2')`,
potentially for every module along unique (modulo dependency cycles) path to root.

https://github.com/nodejs/modules/issues/307

- first statically determine import/export dependency graph
- assume it is acyclic with a single entrypoint
- convert modules to commonjs or similar
- ...

### Links

- https://nodejs.org/api/modules.html#modules_all_together
- https://github.com/nodejs/modules/issues/307#issuecomment-762465349
- https://github.com/preactjs/prefresh/pull/236
