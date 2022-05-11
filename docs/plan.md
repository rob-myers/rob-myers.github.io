# Plan

__Aim towards website release__.

### 🚧 _Technology (Part 2)_ i.e. nav and raycast

- Raycasting
  > https://github.com/rob-myers/rob-myers.github.io/blob/dev/model/geom/geom.service.ts


### 🚧 _Starship Geomorphs_ i.e. how we enrich symbols and geomorphs

## TODO (unsorted)

- Blog
  - ✅ Revisit first page
  - "1st meaningful example"
    - `NavDemo1`+ TTY + __SITUATED__
    - Tab portals can move down page (?)
  - Revisit second page
    - Discuss constraints as before
    - Decompose __SITUATED__
- Story
  - Anapanasati training
  - 5 watchers as Jhanic hindrances


- 🚧 Andros is situated
  - 🚧 CSSPanZoom returns to andros
  - Can only move to point within lit area
  - Cannot close door when Andros will go through it
  - When avatar moves through doorway, lighting changes

- ✅ Can zoom to point with animation
- ✅ Interruptible zoom without lock
  - `matrix(a, b, c, d, e, f)` -> `scale(k) translate(x, y)`
  - `scale(k) translate(x, y)` = `matrix(k, 0, 0, k, x, y)`
- ✅ fix issue with `transition` of matrix transform involving scale and translate (looks crap)
  - ✅ split CSSPanZoom into two transforms i.e. scale and translate
    now essentially `translate(x, y) scale(k)` spread across 2 elems
  - ✅ animate both

- 🚧 Reorg `sh.lib`
  - ✅ base functions are from Terminal specified script
  - ✅ `click`, `spawn`, `nav`, `walk` are from Terminal specified script.
  - ❌ `view` -> `pan`, `zoom` 
  - ✅ Automate foo-req and foo-res on wire via `await api.reqRes`
  - 🚧 script spawns andros and periodically panzooms back to him
  - shorten script validation via `api.something`
  

- 🚧 Investigate migration to Gatsby

- 🚧 Improve look of first-npc
  - ✅ try 10 frame walk cycle
    > https://mymblemoments.files.wordpress.com/2014/02/guard1_walk.png
  - ✅ draw our own simplified 10 frame version
  - ✅ use head symbol in our walk anim
  - ✅ use in `NavDemo1`
  - ✅ keep head still (like original anim)
  - 🚧 graphical improvements
    - ✅ head style
    - 🚧 details: hands + feet
    - details: body has texture
    - drop shadow
  - 🚧 anim time defined via anim meta
    e.g. `(aux.total / 50) * 1000` if `50 world unit/s`

- Can toggle NPC speech bubbles
- Can pause/resume NPC
- mobile-friendly command links (session must be open)

- Clean
  - ✅ Rename `holes` -> `rooms` etc.
  - ✅ Remove: refs to holeId and holeIndex.
  - ✅ Rooms can themselves have holes (from allWalls[i] where i ≥ 1)
    - ✅ Examples: 101, 102, 302
    - ✅ Important for _visibility ray casts_
  - 🤔 Saw empty roomId in 301 i.e. `15`
  - BUG `render-npc` cannot deal with nested transforms
    - g.transform inside a use
    - g.transform of frame
  - navPoly must be a single polygon?
  - Fix HMR of NavDemo1 when remove a geomorph (out of order index?)
  - Support window tags `dark-front` and `dark-back` instead of `one-way`
  - Move light polygon computations into `lazy` i.e. reuse
  - Easier to toggle doors on mobile

- 🚧 `NavDemo1`
  - ✅ Circle with heart-beat and breath
    > https://stackoverflow.com/questions/34762009/pulsing-heart-css-animation
  - ✅ Remove heart/breath
  - ✅ `NavDemo1` has Andros
    > First approximation i.e. first-npc
  - 🚧 TTY script places navpath from Andros on click
    - ✅ expose use-query cache in terminal
    - ✅ move `stage` lookup into individual items in use-query cache
    - 🚧 script needs position of Andros
      - `<NPCs>` has stageKey `nav-demo-1`, registering Andros
    - script needs access to NavMesh
      - access pathfinding from `use-query` cache
  -  🤔 TTY script restrict navpath from Andros to lit area
  - Andros is __situated__
  - `NavDemo1` has other NPCs

- bring back `say`
- start using `yarn inspect` as in BFF for server side debug

- 🤔 NPCs have label
  - NPCs label tracks them as they move
- ✅ user can only move npcs via terminal e.g. `click`...
- ❌ maybe consider shadows and door shadows (doors can fade)
- can pause it
- can write script manually or continually `look`ing
- can see: npcs, meta points
- Implement TTY interaction
- Write into blog 'objective'

- Start Gatsby Project which aims to replace this one

- After testing CssPanZoom for a bit, remove PanZoomTest and @panzoom/panzoom

- finish passenger-deck 303
- PanZoom should have blue blob indicating touches
- PanZoom should have inertia

- mobile: issue with keyboard resizing screen and Xterm not resizing

- geomorphs article can be "coming soon" with preview
- EVENTUALLY redo site using Gatsby JamStack approach (not until after first release)

- 🚧 start blog rewrite in terms of The Last Redoubt
  - https://www.poetryfoundation.org/poems/43825/darkness-56d222aeeee1b
- 🚧 clarify what needs to change

- geomorphs have meta points e.g. beds, chairs, spawn, wait, toilet, ...
- NPCs can connect to meta points

- bug: npc sometimes vanishes at src/dst when clicked
- bug: sometimes turns slowly while moving
- bug: mobile: while drag DraggableNode can pan-zoom
  - e.g. PanZoom provides context, so we can temp disable it


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

- Can move NPC along navpath
  - ✅ translate previous API
  - ✅ actuated via shell function `move`
  - ✅ turn correctly (not look)
  - ✅ play walk animation when moving
  - ✅ NPC refreshes with HMR
  - ✅ fix bug going through wall
  - ✅ prevent going outside navmesh
    - ✅ cannot spawn outside navmesh
    - ✅ cannot nav to outside navmesh
- ✅ Decided on "global convexity" i.e. edge geomorphs only on edges
- ✅ NavDemo1 init race condition?
  - fixed by useEffect -> useMemo in useGeomorphs and doorsApi setup triggers render
- ✅ replace "stage" with "wire"
- ✅ spawn has format `spawn rob ["$( position )"]`
- ✅ NavDemo1 has 2 or more geomorphs
- ❌ Stage can access spawnPoints from useGeomorphData
- ✅ `go` provides faster way to `spawn`, `nav` and then `walk`
- ✅ Better errors when command using `run` fails
- ✅ Revisit navgraphs
  - ✅ Precompute pathfinding navgraph on server
  - ✅ Use an extension of BaseGraph (with double-edges)
  - ✅ Define `FloorGraph` and `FloorGraph.from`
  - ✅ Extend approach of Pathfinding to FloorGraph datatype
  - ✅ Compute FloorGraph in geomorph json
  - ✅ Go back to navZone in json because _much smaller_
  - ✅ Clean away unnecessary code e.g. `Pathfinding`
  - ✅ Link them to doors
  - ✅ AStar takes account of doors
  - ✅ Local navpaths go through doors
    - Break into multiple paths and doorIndex
    - Consumer will decide strategy
  - ✅ Clarify "Global nav path strategy"
    ```
    Line "src -> dst" induces global path
    1. Detect direction e.g. SW, and choose closest open door (straight line)
    2. By construction some edge can be taken; never deadlock
    ```
  - ✅ Implement global navpaths
  - ✅ curved windows can produce strange light
       we introduced `one-way` (like `frosted`) to avoid
       outside from control room seeing more than inside
  - local nav path issues
    - ✅ lazily precompute room navpolys restricted to roomWithDoors
    - ✅ initial room ray cast avoids some string pull issues
    - 🤔 seen string-pull of poor quality whose reverse is good
    - 🤔 avoid going outside navmesh
    - ✅ use connector.entries instead of centroids of nav nodes
    - ✅ works when src and dst in same triangle
  - ✅ `nav` receives `{ paths, edges }`
- ✅ HMR when edit class methods (GmGraph)
  - bizarre: HMR/react-refresh works when classes start with lowercase letter!
    > https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md
    > Ensure all exports within the indirect code path are not named in PascalCase. This will tell the Babel plugin to do nothing when it hits those files.
    > In general, the PascalCase naming scheme should be reserved for React components only, and it doesn't really make sense for them to exist within non-React-rendering contexts.
- ✅ Doors supports multiple transformed geomorphs
- ✅ fix door interference between multiple instances of g-301--bridge
- ✅ avoid precomputing unused transformed geometry
- ✅ simplify relationship: Geomorph.Layout -> Geomorph.GeomorphData
- ✅ simplify relationship: Geomorph.GeomorphData -> Geomorph.UseGeomorphsItem
- ✅ precompute { holeIds: [infront, behind] } inside doors/windows
- ✅ current state is [gm id, hole id]

- ✅ can set next hole when adjacent to current
- ✅ adjacents propagate over geomorph boundary
- ✅ light propagates over geomorph boundary
- ✅ show light polygons through doors
- ✅ cleanup approach above
- ✅ fix 2 hull doors issue
- ✅ Understand why `useLayoutEffect` needed inside `Doors`
- ✅ Fix HMR issue with renaming Door state variables e.g. `state.visible` -> `state.vis`
  - Solution: change state.api -> { ...api, ...state }
- ✅ Migrate `Portals` changes from react branch (improve hooks ordering)
- ✅ `seq 1000000 | map 'x => x + 1'` returns quickly
- ✅ fix pipeline semantics
  - do not terminate until all have terminated
  - terminate all if parent process killed
- ✅ process cleanups now always called from `spawn` in TtyShell
- ✅ implement `click`
  - ✅ see https://github.com/rob-myers/rob-myers.github.io/tree/three-cli/model/sh
  - ✅ CssPanZoom has optional stageKey
  - ✅ TTY sessions have associated stageKey
    > via `env: { STAGE_KEY: 'stage-foo' }` in TabMeta
  - ✅ click works
- ✅ Create `NavDemo1`
  > to be based on ✅ `LightsTest` and 🚧 `SvgNavDemo1`
- ✅ trace topdown characters using Boxy SVG
  - ✅ can render each frame in node.js script
  - ✅ perhaps `Image` with `<svg>` src?
    > https://github.com/Automattic/node-canvas/issues/1116
  - ✅ output a spritesheet for each animation
  - ✅ output a json for each animation
  - ✅ NavDemo1: idle/walk cycle: animate on pointer down
- ✅ Mobile UI defaults to force lowercase + session storage
- ✅ tidy away old NPC stuff (SVG based)
- ✅ Mobile UI has Ctrl-C
- ✅ Mobile UI has larger arrows
- ✅ decided against blender spritesheets, in favour of _hand-crafted vector drawings_, which may be rendered to PNG using browser
- ❌ create a blender spritesheet
  - ✅ get a walk cycle from mixamo
    > https://www.mixamo.com/#/?page=1&query=walk&type=Motion%2CMotionPack
  - ✅ generate walk cycle images using https://youtu.be/-zpORxZF4FE
    - camera looking down from above 
      - opt g, opt r to reset
      - object data properties > Lens > type > Orthographic
      - output properties > Output > directory where to save images
      - Top menu > Animation > Render animation
    - scene properties > film > transparent
    - world properties > surface: emission > white
    - output properties > Format > Resolution X, Y
      - maybe high res if want to construct spritesheet after (1024px * 1024px)
    - Animation view, Show Dope sheet, X delete, A + S to reduce frames
      > Walk cycle: delete final; scale by 0.6; get [1, 19] inclusive after shift left
  - ✅ basic spritesheet generation
    > https://www.codeandweb.com/free-sprite-sheet-packer
  - ✅ display via CSS, following:
    > https://blog.logrocket.com/making-css-animations-using-a-sprite-sheet/
  - for multiple animations prob need control rig and import animations
    > https://youtu.be/yDc-E-o_I-c
  - ❌ check out `Character Creator 3`
  - try generating spritesheet using blender (rest of https://youtu.be/-zpORxZF4FE)
  - download low poly assets previously bought from Unity
    - `ls ~/Library/Unity/Asset\ Store-5.x/polyperfect/`
    - `/Users/robmyers/first-project/Assets/polyperfect/Low Poly Animated People/- Models/Rigs`
  - ❌ export polyperfect prefab from unity as fbx and import to blender
  - ✅ make a walk cycle with one of the polyperfect characters
  - ✅ make a walk/idle polyperfect character anim
  - 🚧 integrate walk/idle anim into `NavDemo1`
    - ✅ can switch between idle/walk
    - 🚧 `click` works
    - can show navpath from Andros via shell
    - can move along navpath
    - animate walk/cycle along navpath
- ✅ mobile: provide alt UI e.g. force lowercase + arrow keys
  - https://stackoverflow.com/questions/71537402/xtermjs-distinguish-backspace-on-mobile-device
- ✅ render: ensure windows cut out of walls
- ✅ clarify convention that walls must have things cut out of them, else holes cannot be computed
- ✅ Rename `GeomorphCssLightsTest` as `LightsTest`
- ✅ Bug: `Tabs` layout is resetting on resize window? (2 cols -> 2 rows)
- ✅ Bug: `Tabs` top is often fading in
- ✅ Finish 303
  - ✅ fix windows
  - ✅ add far top-right sector
- ✅ Graph Node should directly extend NodeOpts
- ✅ Graph Edge should directly extend EdgeOpts
- ✅ create room/door graph
  - ✅ graph.js + graph.d.ts
- ✅ test render room/door graph
- ✅ test toggle lights room and open adjacents
- ✅ test toggle only shows nearby doors
- ✅ simplify precision of polygons in geomorph json
- ✅ clean up interfaces relating to Geomorph.Layout
  - Geomorph.{LayoutJson,ParsedLayout}
  - Geomorph.GeomorphData is Geomorph.ParsedLayout with derived data `d`
- ✅ Resize Last Redoubt i.e. height = 9 * (1/2 + 1/sqrt(2)
- ✅ compute higher floor 5-city outline
  - for unit square where a is central, b other (a + 2b = 1)
    - a is (1 + sqrt(5))/(5 + sqrt(5))
    - b is 2/(5 + sqrt(5))
- ✅ replace screenshots with new redoubt
- ✅ precompute symbol outlines and test
- ✅ GeomorphCssLightsTest: can toggle each area masks to "light" rooms
- svg-meta creates geomorph jsons
  - ✅ detect which symbols have changed
  - ✅ detect which layout defs reference those symbols
  - ✅ run `await createLayout(def, symbolLookup, triangle)` appropriately
- X prerender geomorph lights
  - ✅ create `render-light` script which draws lights as filled red polys
  - ✅ migrate composite approach
  - ✅ meta points define lights
  - X can turn on/off lights via clipPath mask
- ✅ Get focal-point zooming example from @panzoom/panzoom working locally
  - https://timmywil.com/panzoom/demo/
- ✅ Rewrite our own simplified version
- ✅ light intensity is varying as doors are opened
- nav demo + tty with `look`
  - ✅ move `NavCollide` into objective
  - ✅ `NavCollide` -> `NavTestUi`
    - ✅ cleaner obstacles
    - ✅ dynamic lighting test
      - may need efficient version with precomputed shaded areas 
- ✅ `poly` tag needs separate wall or obstacle
- ✅ fix tty mobile issue with deleting
- ✅ Tabs can have different height in mobile viewport
- ✅ `Tabs` can start with > 1 tab visible
- instead of CSS 3d demo, we'll create blender models and render/screenshots
  - ✅ start creating last redoubt in blender
  - ✅ screenshot to go inside objective
  - ✅ leave Pyramid3dDemo as is, but do not use

- ✅ build `CssPanZoom`
  > SVG-based panzoom using CSS transforms instead of viewBox
- ✅ jerkiness on reverse npc
- ✅ fix look issue when drag node
- ✅ on reverse path, fix look angle
- ✅ stationary NPC can be turned via target dot
  - DraggableRay
  - rotation independent
- ✅ bug: /test -> /part/1 -> /test then click on finished actor dst causes jump?
- ✅ `NPC` -> `NPCs` e.g. to solve draw order
- ✅ on resume NPC via src node click, path preserved and animation shortened
- ✅ `NPC` component replaces `SoloNPCWidget`
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
- ✅ fix: example/SvgNavGraph triangles should be visible
- ✅ avoid dup g-301--bridge.json calls
- ✅ Bug: modal hidden behind menu in max viewport
- ✅ CodeSandbox for triangle-wasm
- ✅ Next button auto-anchors
- ✅ SvgNavGraph#302 still not initialising (with modal)
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
- ✅ make `nav/SvgDoorsDemo`
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
  - generate some PNGs for `SvgPanZoomDemo`
- use in `SvgPanZoomDemo`
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

```sh
# this crashes -- can we prevent it?
run '({}) { while (true) yield undefined; }'

run '({ api }) { while (true) {
  await api.sleep(1)
  yield "foo"
} }'
```

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

