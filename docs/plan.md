## Plan

- simplify PanZoom/Demo a bit
- better Tabs UI
  - initial background e.g. CodeEditor initially fades in?
  - can enable/disable for easier scrolling
  - fix tabs colours

- parse svg hull polygons and infer polygon outline
  - skip ahead and test this

- index page links to "article bunches"
- cleanup how terminal persists
- do not auto-persist if localStorage lacks `autopersist=true`
- ✅ try serving svg subimages locally
  > [boxy CSP forbids this](https://boxy-svg.com/questions/308/permit-loading-image-from-https-localhost)
- cleanup projects
  - ✅ careful about module imports (`nanoid` breaks CodeSandbox hmr on Browser-tab-refresh)
  - ✅ reorg folder structure
  - ✅ migrate back to `@emotion` from `goober` (breaks CodeSandbox hmr)
- ✅ make `Tabs` modular
- ✅ Fix `PanZoom` mouse input 

### level design
- strategy
  - create dev _hull_ and _starship-symbols_ in Boxy
    - hull includes e.g. circular windows
    - it defines walls and induces a bounding polygon
  - create dev geomorph using JSX and `<use>`
  - generate prod geomorph (1 runtime PNG, various shapes)

### react components
- ConnectDemo using Geomorphs
  - First attempt at Geomorph to SVG i.e. conversion of `319-100x50-multi-purpose.png`.
- ✅ PanZoom using `geom`, `hooks`, `service/dom`

### CodeSandbox
- CodeSandbox for PanZoom
- CodeSandbox for GeomorphDemo
- ✅ StackBlitz for PanZoom
  > https://stackblitz.com/edit/rogue-markup-panzoom?file=index.js

### code-editor
- ✅ codemirror toggling: initial + gutter
- support code-folding
  - ✅ can code-fold by indent using Ctrl-Q
  - can code-fold via gutter
- ✅ comment toggle no longer needed (we will not edit code onsite)
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

### Links

- https://nodejs.org/api/modules.html#modules_all_together
- https://github.com/nodejs/modules/issues/307#issuecomment-762465349
- https://github.com/preactjs/prefresh/pull/236

- https://github.com/cfware/babel-plugin-bare-import-rewrite/blob/master/index.js

---

https://www.programmersought.com/article/96886629323/

> After the introduction of the pre-parser, when V8 encounters a function, __it will not skip the function directly__, but will perform this fast pre-analysis on the function. The pre-analysis has two tasks

  > 1. Determine whether the current function has a syntax error
If there is a syntax error in this function, there is no need to continue execution
  > 2. Check whether the external variable is referenced inside the function. If the external variable is referenced, the pre-parser will copy the variable in the stack to the heap. When the function is executed next time, it will directly use the reference in the heap to solve the problem. The problem with the package.

Hopefully it caches this analysis, so, almost always, function declarations just amount to storing a name and some code.

