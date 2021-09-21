# Plan

__Aim towards website release__.
Currently, TODOs should either:
(a) contribute to one of the initial articles
(b) have a clear general nature which cannot be avoided

### _Objective_ i.e. intro

- Include some images of Geomorphs, possibly with/without meta polygons

### _Constraints_

...

### _Technology_ i.e. tech intro + js

...

### _Technology (Part 2)_ i.e. navigation and raycasting

...

### _Technology (Part 3)_ i.e. static and runtime analysis

...

### _Starship Geomorphs_ i.e. how we enrich symbols and geomorphs

...


---

- remove recast-detour
- get projects/nav working
- Use Web Animation API
  - path following
  - can predict positions via JS
  - smooth dynamic changes
- generate pngs for demo (so don't need code)
  - ✅ try server-side-render using npm module `canvas`
  - ✅ browser and server use same canvas overlay code
  - generate some PNGs for `PanZoomDemo`
- use in `PanZoomDemo`
- tidy `PanZoom` and update CodeSandbox
- Tabs don't load until scroll into view
- Tabs disable on scroll out of view
- convert 302 too
  - satellite and labels remain
- emphasise render-once approach to React in intro
- can show labels
- CSS character spritesheet based on Teleglitch
- static lighting (shadow maps)

- demos should always involve starship geomorphs
- write Navigation subsection
- write Physics engine subsection
- use geomorph in `NavDemo`
- save tabs state to browser state (?)
- investigate poly refinement
  - Ruppert's Delaunay Refinement Algorithm
  - https://www.cs.cmu.edu/~quake/tripaper/triangle3.html
- destructuble walls?
- can clamber over machinery?
- ✅ can enable/disable Tabs
- ✅ Tabs only show "loading" first time
- ✅ labels now part of singles
- ✅ windows now part of singles
- ✅ extra -> singles; doors part of singles 
- ✅ finish symbols for geomorph 301
- ✅ extras tagged `wall` are drawn
  - provide wall when door not shown
  - fill-in sides of door
- ✅ remove doors from symbol PNGs for 301
- ✅ create filler symbol extra--301--computer
- ✅ add iris hatch symbol
- ✅ hull doors are tagged e.g. door-e
- ✅ hull group -> walls
- ✅ asset titles space-separated and define ownTags
- ✅ irisValves -> doors with tag iris
- ✅ remove GeomorphTest1
- ✅ rename GeomorphTest2 as GeomorphDemo
- ✅ compute geomorph nav poly
- ✅ labels -> small boxes
- ✅ move meta out of Poly
- ✅ move types.js files into d.ts
- ✅ GeomorphTest caches symbols via react-query
- ✅ tabs prevent component SSR, and fade-in

- better Tabs UI
  - can enable/disable for easier scrolling
  - ✅ CodeEditor initially fades in
  - ✅ fix tabs colours

- ✅ fix `PanZoom` on mobile
  - ✅ can view local dev on phone
- ✅ first deploy
- ✅ index page says "Coming soon"; current page moved to /draft
- ✅ parse svg hull polygons and infer polygon outline
  - ✅ parsed using cheerio in `UseSvg`
  - ✅ cannot traverse closed shadow dom
  - ✅ prepared ts-node script, but will develop in DOM first
- ✅ simplify PanZoom/Demo a bit

- index page links to "article bunches"
- cleanup how terminal persists
- do not auto-persist if localStorage lacks `autopersist=true`
- ✅ try serving svg subimages locally
  > [boxy CSP forbids this](https://boxy-svg.com/questions/308/permit-loading-image-from-https-localhost)
- ✅ move back to `goober`
  - hmr issue in next with emotion styled component (prob goober too)
  - will use css`...` instead
  - goober css doesn't need babel or /** @jsx jsx */
- cleanup projects
  - ✅ careful about module imports (`nanoid` breaks CodeSandbox hmr on Browser-tab-refresh)
  - ✅ reorg folder structure
  - ✅ migrate back to `@emotion` from `goober` (breaks CodeSandbox hmr)
- ✅ make `Tabs` modular
- ✅ Fix `PanZoom` mouse input 

## level design
- strategy
  - generate prod geomorph (1 runtime PNG, various shapes)
  - ✅ create dev _hull_ and _starship-symbols_ in Boxy
    - ✅ hull includes e.g. circular windows
    - ✅ it defines walls and induces a bounding polygon
  - ✅ create dev geomorph using JSX and `<use>`
- ✅ First attempt at Geomorph to SVG i.e. conversion of `301`.
- ✅ PanZoom using `geom`, `hooks`, `service/dom`

### shell
- fix: `set home/dist {}`
- fix:  `'d :- f('` swallowed with no error
- can trigger shell command from markdown link
- focus terminal onclick interact
- focus terminal onchange tab

- ✅ replace various shell commands by shell functions and `run`
- ✅ simplify `help`
- ✅ better persistence
  > as in [three-cli branch](https://github.com/rob-myers/rob-myers.github.io/blob/9b2c7e3dc7f17b51a6d18663cf7c5039c78dcdf0/store/code.store.ts#L40).
- Use unix-like paths e.g. `/home/src` instead of `/home.src`?
	- ✅ Redo redirects
	- ✅ Redo `get`, bare `get`, `cd`, `ls`, `rm`
- ✅ `api.read` can read lines from tty
- ✅ redirect into cwd rather than `var`
- ✅ support ansi-codes in `$'...'`
- better error "stacks"
  > ✅ have node.meta.stack with function names

### code-editor
- ✅ codemirror toggling: initial + gutter
- support code-folding
  - ✅ can code-fold by indent using Ctrl-Q
  - ✅ can code-fold via gutter
- ✅ comment toggle no longer needed (we will not edit code onsite)
- ✅ use customized theme based on vscode-dark
- ✅ highlight styled.div`...` and styled(Component)`...`
- ✅ css`...` should start inside a block context
- ✅ use codemirror
- ✅ get css`...` working with scss
- ✅ could try monaco-editor
  - https://www.npmjs.com/package/monaco-jsx-highlighter
  - https://github.com/Microsoft/typescript-styled-plugin#configuration (might work?)
  - https://luminaxster.github.io/syntax-highlighter/

# Motivation

Breath life into it via 
- [Traveller wiki](https://wiki.travellerrpg.com/Main_Page)
- [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol)
  - Ship AIs assist Low Berth travellers on death
- [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land)

Breath depth into it via navigation (sans physics)
- waypoints/waypaths induced via symbols
- scheduler moves all agents, subject to constraints
- player can navigate freely via navmesh
- player may be stopped, but
  - can drag invalid waypoints
  - wait for them to become valid
# Technical constraints

Cannot use e.g. Svelte because HMR/Fast-Refresh does not work on  CodeSandbox (or elsewhere), and we'll need that for AI editing later.

As close to JavaScript as possible.
- Styled jsx with JSDoc types instead of styled tsx
- Projects should only rely on React for _initial render_
- Dom mutations should be done manually e.g. via Web Components
- Projects should avoid SSR

## Links

- https://nodejs.org/api/modules.html#modules_all_together
- https://github.com/nodejs/modules/issues/307#issuecomment-762465349
- https://github.com/preactjs/prefresh/pull/236
- https://google-webfonts-helper.herokuapp.com/fonts

---

https://www.programmersought.com/article/96886629323/

> After the introduction of the pre-parser, when V8 encounters a function, __it will not skip the function directly__, but will perform this fast pre-analysis on the function. The pre-analysis has two tasks

  > 1. Determine whether the current function has a syntax error
If there is a syntax error in this function, there is no need to continue execution
  > 2. Check whether the external variable is referenced inside the function. If the external variable is referenced, the pre-parser will copy the variable in the stack to the heap. When the function is executed next time, it will directly use the reference in the heap to solve the problem. The problem with the package.

Hopefully it caches this analysis, so, almost always, function declarations just amount to storing a name and some code.

