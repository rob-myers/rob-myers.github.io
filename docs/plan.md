## Plan

### service-worker
- ✅ can respond with type `application/javascript`
- ✅ `import('/src/module.js')` does not refetch,
  need to e.g. `import('/src/module.js?v=2')`

### shell
- ✅ `api.read` can read lines from tty
- ✅ redirect into cwd rather than `var`
- better error "stacks"

### Module over-caching issue

Javascript modules cannot be cache invalidated (without refresh), so we'll be creating many stale ones via `import('/src/module.js?v=2')` and a service-worker.

Justification:
- normal usage should not create large cache anyway
- existing nodejs dev envs need restarts anyway
- same GC issue exists for nodejs `require.cache`
- can load previous code faster
