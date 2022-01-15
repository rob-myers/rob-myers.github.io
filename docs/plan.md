# Plan

__Aim towards website release__.

### _Objective_ i.e. intro

- Include image of Geomorph with description ✅
- Add lighting demo ✅
- Add 3d demo ✅
- Improve lighting demo ✅
- Improve 3d demo ✅
  > Tried CSS transform approach but ultimately did not perform better when on a blog page (with various other components)
- Make Light CodeSandbox ✅
- Make 3D CodeSandbox ✅

### _Constraints_

- Link to a CodeSandbox ✅
- Demo terminal ✅
- Background about setting ✅

### _Technology_ i.e. tech intro + js

- `PanZoomDemo` uses a Geomorph PNG ✅
- Redo CodeSandbox ✅
- CodeSandbox link more prominent ✅
- Finish "React Renders and Web Components" ✅

### 🚧 _Technology (Part 2)_ i.e. nav and raycast

- Write text 🚧 👈
- ✅ NavStringPull: animate goto navigation
  - ✅ improve mobile e.g. larger, fix initial
- Raycasting
  > https://github.com/rob-myers/rob-myers.github.io/blob/dev/model/geom/geom.service.ts

### 🚧 _Technology (Part 3)_ i.e. static and runtime analysis

- 🚧 Write text

### 🚧 _Starship Geomorphs_ i.e. how we enrich symbols and geomorphs

- Write text

---

## TODO (unsorted)

- ✅ on resume NPC via src node click, path preserved and animation shortened
- ✅ `NPC` component replaces `SoloNPCWidget`
- stationary NPC can be turned via target dot
  - rotation independent
- can change NPC speed via +/- (playback rate)
- NPC has name/info/speech (?)

- geomorphs have meta points e.g. beds, chairs, spawn, wait, toilet, ...
- NPCs can connect to meta points
- bug: mobile: while drag DraggableNode can pan-zoom

- offscreen tabs get disabled + rendered after 5 secs
  - Tabs don't load until scroll into view
  - Tabs disable on scroll out of view

- GitHub Comments
- get interested in simulating starship crews
- declare this interest in objective

- tech1: mention React "polyfill" of events, and why we avoid
- finish geomorph 101
- implement front page

- 🚧 visibility polygon should have truncated precision
- smooth back/forward scrolling
- preserve scroll inside tab pane

- `PanZoom` supports zoom to point via ref API
- GitHub Pages TTL is 10mins; Could use CDN:
  > https://rogue-markup.imgix.net/
  > https://console.cloud.google.com/storage/browser/rogue-markup;tab=objects?project=rogue-markup

- ✅ NavCollide: on hide/show only resume previously playing
- ✅ bug: can drag outside navmesh
- ✅ resize terminal on resize tab (drag or move slider)
- ✅ Improve Solo NPC component
- ✅ show/hide `Continue` appropriately
- ✅ use web animations polyfill
  - https://www.npmjs.com/package/web-animations-js
  - ISSUES PERSIST e.g. fill not properly implemented?
- ✅ fix initially enabled Tabs
- ✅ hidden tabs get disabled prop and are rendered
- ✅ page builds too big again
  - ~60kb from `rehype-raw` added to each page can be "ignored" via SSR
  - ~2Kb from `@juggle/resize-observer` can be "ignored"
  - saved ~4kb on /part/2 via dyn components 
  - reduced shared js to ~40Kb
- ✅ prevent modal overlay click propagating to nav
- ✅ fix: mobile Tabs not initially disabled
- ✅ disabled prop unmounts large DOM e.g. hoverable navtris, Css3d
- ✅ fix: Css3d perspective center wrong on mobile
- ✅ fix: example/NavGraph triangles should be visible
- ✅ avoid dup g-301--bridge.json calls
- ✅ Bug: modal hidden behind menu in max viewport
- ✅ CodeSandbox for triangle-wasm
- ✅ Next button auto-anchors
- ✅ NavGraph#302 still not initialising (with modal)
- ✅ can maximise Tabs into a modal
- ✅ avoid computing Pathfinding until !props.disabled
- ✅ Triangle (triangle-wasm) in browser dev
  - try triangle-wasm on nodejs 
  - get triangle-wasm working in DEV browser 
  - fix triangulation errors 
  - remove recast service etc 
  - ui controls to play with triangulation 
- ✅ copy-paste terminal x2 bug
- ✅ add missing labels to 302
- ✅ can continue from last scroll on hard refresh
- ✅ can anchor Tabs via icon
- ✅ try callback instead of MutationObserve
- ✅ Add lighting demo
  > https://github.com/rob-myers/topdown-cli/blob/actors-component/frontend/src/service/geom.service.ts
- ✅ Add 3d walls demo
  > https://github.com/rob-myers/topdown-cli/blob/c5abf6487303e907af478aefddd8e5177c5d24b5/frontend/src/components/stage/stage.world.tsx
  - repo archived-webs
- ✅ tab metas support idSuffix
- ✅ restart using public/geomorphs i.e. precomputed geomorphs
- ✅ make `nav/DoorsDemo`
- ✅ anchor and focus on Tabs interact
- ✅ Doors represented via rotated `<rect>`
- ✅ Implement Tabs tab portals
- ✅ Mobile NavMini should be overlapped by open Nav 
- ✅ Fix scrolling yet again: zenscroll doesn't work well on android.
- ✅ Show next at bottom of page
- ✅ Show next/prev in navbar
- ✅ basic custom 404 page
- ✅ import markdown separately into each page
- ✅ track ids (tabs, headers, links) in articles e.g. for better refresh
- ✅ Fix initial Nav animation (SSR)
- ✅ Simplify nav e.g. remove `#goto-{...}`
- ✅ Group nav items by page
- ✅ SideNav scrolls to article
- ✅ SideNav moves between pages
- ✅ Split blogs into separate pages
- ✅ Fix `seq ${large number}`
- ✅ Fix brace expansions like `echo {1..5}$( echo foo )`
- ✅ `Layout` not in initial bundle
- ✅ Script can generate .debug.png with doors/labels/etc.
- ✅ NavDemo working as before, now via port of three-pathfinding
- ✅ Can show labels
- ✅ Provide geomorphs as PNGs and JSON with navmesh
- ✅ remove recast-detour
- ✅ remove box2d-wasm
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

- emphasise render-once approach to React in intro
- CSS character spritesheet based on Teleglitch
- static lighting (shadow maps)

- demos should always involve starship geomorphs
- write Navigation subsection
- write Physics engine subsection
- save tabs state to browser state (?)
- investigate poly refinement
  - Ruppert's Delaunay Refinement Algorithm
  - https://www.cs.cmu.edu/~quake/tripaper/triangle3.html
- motion scheduler knows 2-way passages & wait points
- ✅ use geomorph in `NavDemo`
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

