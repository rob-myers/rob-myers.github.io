## Plan

- Write down a summary of what we are trying to do.

- Try codemirror with jsx and [css-in-js support](https://github.com/codemirror/google-modes/blob/master/src/template_string_inline_language.js ).
- Replace react-ace with codemirror

### service-worker
- ✅ can respond with type `application/javascript`
- ✅ `import('/src/module.js')` does not refetch,
  although `import('/src/module.js?v=2')` would.

### shell
- ✅ `api.read` can read lines from tty
- ✅ redirect into cwd rather than `var`
- better error "stacks"
- can load modules from unpkg, caching source

### of interest

- https://nodejs.org/api/modules.html#modules_all_together
- https://github.com/nodejs/modules/issues/307#issuecomment-762465349
- https://github.com/preactjs/prefresh/pull/236

### Module over-caching issue

Javascript modules cannot be invalidated from cache, without refresh.
This means hot-reloading will create many stale ones via `import('/src/module.js?v=2')`,
potentially for every module along unique (modulo dependency cycles) path to root.

https://github.com/nodejs/modules/issues/307

- first statically determine import/export dependency graph
- assume it is acyclic with a single entrypoint
- convert modules to commonjs or similar
- ...