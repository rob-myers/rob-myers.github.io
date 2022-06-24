(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9510],{17398:function(e,n,t){"use strict";t.d(n,{Z:function(){return u}});var a,o=t(84175),i=t(17928),s=t(43057),r=t(68292),c=t(52209),l=t(88269),h=t(58199),d=t(85893);function p(e){var n,t="next-article--".concat(null===(n=e.article)||void 0===n?void 0:n.key);return e.article?(0,d.jsx)("div",{className:m,children:(0,d.jsx)(h.Z,{href:(0,i.Gu)(e.article),title:"Continue to next article",id:t,prePush:"#".concat(t),children:"Next"})}):null}var m=(0,l.iv)(a||(a=(0,c.Z)(["\n  height: 64px;\n  font-size: 1.1rem;\n  margin-top: -64px;\n  @media(max-width: 800px) {\n    margin-top: 0;\n    font-size: 1rem;\n  }\n\n  display: flex;\n  justify-content: center;\n  align-items: center;\n\n  a {\n    color: #555;\n    border: 1px solid #666;\n    background: #fff;\n    padding: 8px 16px;\n    border-radius: 4px;\n  }\n"])));function u(e){var n=e.part,t=e.markdown,a=i.Pd[n].map((function(e){return e.key})),c=a.length?i.mh[(0,o.Z$)(a)]:null,l=null!==c&&void 0!==c&&c.next?i.mh[c.next]:null;return(0,d.jsxs)(s.Z,{children:[(0,d.jsx)(r.Z,{keys:a,markdown:t}),(0,d.jsx)(p,{article:l})]})}},54762:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return r}});var a=t(17398),o=t(82715),i=t(48834),s=t(85893);function r(){return(0,s.jsx)(a.Z,{part:2,markdown:{technology:"## Technology\n\nSo, we're going to build a roguelike directly on this website.\nWe sketched the [technological constraints earlier](1#constraints--technology \"@anchor\") and now provide more detail.\n\n| Concept | Technology |\n| ------- | ---------- |\n| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components). |\n| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |\n| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |\n| Pathfinding | Basic pathfinding based on [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |\n| Raycasting | Basic geometry and spacial partitioning.  |\n| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |\n| Live analysis | In-browser terminal, via [xterm.js](https://www.npmjs.com/package/xterm) and [mvdan-sh](https://www.npmjs.com/package/mvdan-sh). |\n| Scripting | [TS Node](https://www.npmjs.com/package/ts-node) i.e. Node.js with types. |\n| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |\n| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |\n| Code sharing | Show [GitHub](https://github.com/) comments, provide GitHub [repo](https://github.com/rob-myers/rob-myers.github.io). |\n| Asset editor | [Boxy SVG](https://boxy-svg.com/).\n\nWe'll explain the above over the next few articles.\n",tech1:'## Tech (js)\n\nThe early 90s brought three pillars: HTML, CSS, JavaScript (JS).\nWhenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.\nOur web browser renders the HTML and CSS immediately,\nand executes the JS to provide interactivity.\n\n<aside>\n\nMore precisely, all _[DOM](https://en.wikipedia.org/wiki/Document_Object_Model#JavaScript) mutations_ are performed by JavaScript.\nThe DOM is the programmatic interface to the current _document_ viewed in the browser.\nIt amounts to parsed HTML decorated with matching CSS and bound JS, together with APIs for reading and modifying it.\n\n</aside>\n\nAlthough HTML, CSS and JS are separate standards, \nit is now common to generate both the HTML and the CSS using JS.\nThis is possible via _Node.js Server-Side Rendering_ and _CSS-in-JS_, respectively.\nThey counter the fundamental asymmetry between the _initial state_ of the document (determined by HTML and CSS) and _all subsequent states_ (the orbit of JS executions).\n\n\n### React Function Components\n\nJavaScript can perform arbitrary computation, but its central purpose is DOM mutation.\nHowever, directly applying JS leads to [spaghetti code](https://en.wikipedia.org/wiki/Spaghetti_code).\nTo surmount this, developers invented the notion of _JavaScript component_, instantiated via XML tags.\nIf the JavaScript component is called `MyComponent`, the associated tag will be `<MyComponent />` or perhaps `<my-component />`.\nIntuitively, HTML is extended with these custom tags which ultimately unwind into plain old HTML.\n\nCompeting notions of JavaScript component exist in the wild.\nOne popular approach is _React function components_.\nThey are just JavaScript functions with constraints on their parameters and return value.\n\n- They have a single parameter conventionally called _props_.\n  It is a JavaScript `Object` defining the component\'s named inputs,\n  and possibly special properties like _children_, _key_ and _ref_.\n\n- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).\n  This returned value ultimately unwinds to an HTML fragment,\n  and may depend on the component\'s props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).\n\nReact developers use a grammatical extension of JavaScript called **JSX**.\nWe already mentioned the idea of extending HTML with custom XML tags.\nJSX goes further by reinterpreting XML inside a grammatical extension of JavaScript.\n\n<aside>\n\nJSX freely combines JS with XML, so arbitrary JavaScript values can be passed to tag attributes, and XML can be passed around as a JavaScript value. Inductively closing these capabilities leads naturally to JSX, making this grammar particularly suitable for building dynamic DOM trees.\n\n</aside>\n\nConsider an example, a pan/zoomable grid (also [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab")).\n\n<div\n  class="tabs"\n  height="400"\n  name="panzoom"\n  tabs="[\n    { type: \'component\', filepath: \'example/SvgPanZoomDemo\' },\n    { type: \'code\', filepath: \'panzoom/PanZoom.jsx\', folds: [{ line: 9, ch: 0 }] },\n    { type: \'code\', filepath: \'example/SvgPanZoomDemo.jsx\' },\n  ]"\n></div>\n\nThe file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom panzoom/PanZoom.jsx")) defines two React function components.\nOne called _PanZoom_, another called _Grid_.\nBehaviourally:\n\n- _PanZoom_ renders an SVG containing _children_ (an image provided in _SvgPanZoomDemo_) and `<Grid />`. Over time it adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.\n\n- _Grid_ renders part of an SVG i.e. two grid patterns.\n  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits).\n\n  <aside title="svg-user-units">\n  \n  SVG user units become concrete via the `<svg>`\'s viewBox attribute and its width/height in the DOM.\n  We\'ll follow a convention based on the work of Robert Pearce and Eric B. Smith: \n  > 60 abstract user units (one large grid square) correspond to 1.5 meters.\n\n  In fact, 1.5m comes from a Traveller convention concerning [deck plans](https://wiki.travellerrpg.com/Deck_Plan).\n\n  </aside>\n\nThe above JS functions both have a single parameter `props`.\nMoreover, they both return something which looks like HTML but isn\'t.\nThen what does the XML-like value returned by `PanZoom` actually mean?\nWhat are React function components actually returning?\n\x3c!-- For example, _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.\nNotice that React function components are functions, but syntactically they are not invoked like functions i.e. we don\'t write `Grid(props)`. --\x3e\n\nHere\'s a whirlwind overview.\n\n- React devs use a grammatical extension of JavaScript called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript) "@new-tab"), permitting XML syntax.\n- React applications are built by composing together React function components. A typical React function component will return XML syntax referencing one or more other components.\n\n- Dev tools convert JSX into JS by replacing XML tags with invocations of `React.createElement` (see [example below](#command "open-tab jsx-to-js")).\n- **This website actually uses _Preact_**, a React alternative with the same API.\n  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js "@new-tab"),\n  and creates Preact virtual DOM nodes.\n- The root component of an application is usually called _App_.\n  Running a React application means invoking `ReactDOM.render`\n  with two arguments: `<App/>` and a DOM node _el_. See how we bootstrap examples on [CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab").\n\n- [ReactDOM.render](https://github.com/preactjs/preact/blob/master/src/render.js "@new-tab") initially converts `<App/>` into a DOM node mounted at _el_.\n  Later a subcomponent may "re-render", recursively recreating a virtual DOM node.\n  It is [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js "@new-tab")  and only the difference is applied to the DOM.\n\n<div\n  class="tabs"\n  name="jsx-to-js"\n  height="340"\n  tabs="[ { type: \'code\', filepath: \'example/jsx-to-js.jsx\' } ]"\n></div>\n\n<aside>\n\nOur whirlwind overview attempts to provide the gist.\nActually, React is notoriously hard to understand. \nThe internet is awash with poor explanations and cargo cult mentalities.\nHowever, React is probably the most popular JavaScript component framework;\nif you want to understand modern web development, it is arguably unavoidable.\n\n</aside>\n\n### React Renders\n\n\x3c!--\nWebsites respond to interaction, sometimes without changing the DOM.\nWhen they do mutate the DOM, they usually don\'t continually do so.\nFor example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.\nAs another example, showing additional search results amounts to a single mutation.\n--\x3e\n\nWhen React renders a component, it invokes the respective function.\nThe return value of the function is a JavaScript representation of a DOM subtree.\nThis representation is usually referred to as "Virtual DOM".\nReact compares this JavaScript value to the previous one, and patches the DOM accordingly.\nIf many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221 "@new-tab") via the ancestral relationship.\nDevelopers can also avoid recreating a particular virtual DOM subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js "@new-tab").\nBut for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.\n\nHowever, we are making a realtime video game.\nWe want to control the rendering as much as possible, to ensure good performance and aid debugging.\nIf we allowed React (actually, Preact) to render in response to user interaction, we\'d lose this control.\nTake another look at _panzoom/PanZoom.jsx_.\n\n<div\n  class="tabs"\n  height="360"\n  name="panzoom-again"\n  tabs="[\n    { type: \'code\', filepath: \'panzoom/PanZoom.jsx\', idSuffix: \'1\' },\n    { type: \'code\', filepath: \'geom/rect.js\' },\n  ]"\n></div>\n\n_PanZoom_ returns an `<svg/>` with a viewBox attribute determined by `state.viewBox`.\nWhen a user zooms via mousewheel, the event handler `state.onWheel` updates `state.viewBox`.\nBut updating this variable does not automatically update the virtual DOM.\nUsually one would _trigger a re-render_, so that _PanZoom_ returns `<svg/>` with the updated viewBox, and the DOM-diffing algorithm does the update.\nBut how do we trigger a re-render?\n\n### Internal state via `useState`\n\nA React function component is rendered whenever an ancestor is (modulo `React.memo`), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.\n\n> `const [value, setValue] = React.useState(() => initialValue);`\n\nThese declarations cannot be nested, must occur at the "top-level" of the React function component, and must always execute in the same order.\nThis induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109 "@new-tab") with their enclosing component.\nTo change state we execute `setValue(nextValue)` e.g. in response to a click. If `nextValue` differs from `value`, the function `setValue` causes the component to re-render where now `React.setState(...)[0]` has the new value.\nThis propagation of internal state is possible because a component\'s hooks must always execute in the same order.\n\n### Avoiding React Renders\n\nIn _panzoom/PanZoom.jsx_, the variable `state` is the value of an internal state variable i.e. deconstructed from a `React.useState` hook. Observe that we do not deconstruct the setter (`setValue` in the terminology of the previous section).\nWhy?\nBecause we decided to never inform React we\'ve changed `state`, despite mutating it on mouse and pointer events.\nInstead we directly mutate the DOM via:\n\n> ``state.root.setAttribute( \'viewBox\', `${state.viewBox}` );``\n\n\x3c!-- By the way, `` `${state.viewBox}` `` amounts to `state.viewBox.toString()` which is defined in [geom/rect.js](#command "open-tab panzoom-again geom/rect.js"). --\x3e\n\nThen as far as React is concerned, nothing has changed.\nFurthermore if React renders the component for another reason, it\'ll use the mutated `state` to set the viewBox attribute (producing no change).\n> But why not just use a setter `setState`?\n\nBecause otherwise we\'d recompute `children` and `<Grid />` whenever the player pans or zooms.\nOur game may contain many elements, and we\'d rather not needlessly recompute their virtual DOM tens of times per second.\n\n\x3c!-- The above situation is handled by a single DOM mutation.\nIn more complex situations we might integrate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).\nMore on that later. --\x3e\n\n\x3c!-- ### CSS inside JS\n\nTraditionally, CSS is provided in separate files,\nlinked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.\nBoth _PanZoom_ and _SvgPanZoomDemo_ above are styled using CSS-in-JS.\nThis means the CSS is written inside JS or JSX files, often together with the React component it applies to.\nThe npm module [Goober](https://www.npmjs.com/package/goober) handles this for us. --\x3e\n\n### React Refresh\n\nFinally, we further justify our somewhat strange usage of `React.useState` i.e. _sans the setter_.\nSince we only ever mutate the state, `React.useRef` may seem more suitable.\nHowever, there\'s something special about `React.useState`.\n\nWhilst working in a suitably tooled development environment, it is possible to textually edit React components [without losing the internal state of their instances](https://www.npmjs.com/package/react-refresh) (the deconstructed values of `React.useState` hooks).\nSee this in action by editing one of our CodeSandboxes.\nThis important devtool is known as [react-refresh](https://www.npmjs.com/package/react-refresh) (see also [preact/prefresh](https://github.com/preactjs/prefresh)).\nIt will help us develop sophisticated Game AI.\n',tech2:o.Z,tech3:i.Z}})}},58797:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/part/2",function(){return t(54762)}])},82715:function(e,n){"use strict";n.Z='## Tech (ai)\n\n\x3c!-- We\'ve described our objective, constrained our approach and listed the technologies we\'ll use.\nWe now turn to Game AI. --\x3e\n\n### Overview\n\n_The Last Redoubt_ will present a birdseye viewpoint of the interior of starships.\nThe [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").\nThese behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.\n\nBut how do video games implement these behaviours?\nWell, there are three standard systems:\n\n- **Navigation**: _planning e.g. route from A to B._\n- **Animation**: _realism (e.g. limbs) and visual cues._\n- **Physics**: _collision detection, force-driven rigid bodies, raycasting_.\n\nNavigation is of central importance to us, and will be discussed shortly.\nAs for animation, we won\'t obsess over realism,\nbut we\'ll need visual cues to indicate NPC actions.\nWe also want a _sense of flow_, achieved via interdependent concurrent animations.\nAs for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won\'t be using one. In fact:\n\n- Collision detection will be handled at the level of navigation.\n- Force-based motion will be simulated via the Web Animations API.\n\nIn the rest of this article we\'ll discuss Navigation and Raycasting in detail.\n\n### Static Navigation\n\nTo move an NPC from **A** to **B**, we need a respective path.\nThis might simply be a straight line e.g. when an item is directly within grasp.\nHowever, usually there are objects to be avoided: static ones like walls, dynamic ones like NPCs.\n\nSans dynamic objects, a canonical approach exists.\n- The navigable area is represented by _polygons_ ([possibly with holes](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6)),\n  with **A** and **B** inside them.\n- These polygons can be _triangulated_ i.e. partitioned into triangles with disjoint interiors.\n  Thin or large triangles can be avoided via _[Steiner points](https://en.wikipedia.org/wiki/Steiner_point_(computational_geometry))_.\n- The triangulation induces an undirected graph.\n  > A **Navgraph** is an undirected graph whose \n  > nodes are _the triangles of the provided triangulation_.\n  > Two nodes are connected if and only if _their respective triangles share exactly one edge._\n\nFor example, the grey triangles below collectively induce the red navgraph.\n\n<div\n  class="tabs"\n  name="nav-graph-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { type: \'component\', filepath: \'example/SvgNavGraph#301\' },\n     { type: \'component\', filepath: \'example/SvgNavGraph#302\' },\n   ]"\n></div>\n\n__TODO__ Mention triangle-wasm CodeSandbox\n\n\nTechnically, an undirected graph is just a _symmetric binary relation_.\nWe have made it concrete by depicting each node as the centroid of its respective triangle.\nThis is a standard convention, although triangles have more than one [notion of center](https://en.wikipedia.org/wiki/Triangle_center).\nIt provides a weight for each edge i.e. the distance between the centroids.\nThen the length of a path through the undirected graph may be defined as the sum of its edge\'s weights.\n\n<aside title="why-we-abstract">\n\nSearching for paths through the embedded undirected graph is much easier than searching the navigable polygons.\nThere are far fewer possibilities.\nHowever, NPCs won\'t actually follow these embedded paths (for realism),\nbut an induced path instead (see below).\n\n</aside>\n\n<aside>\n\nThe length of each path in the undirected graph should approximate the respective _real_ shortest path length.\nZig-zags between centroids can make a relatively short path _long_. This is often mitigated by pre-processing the navigable polygons, ensuring small triangles.\n\n</aside>\n\nSo, how to find a path from A to B?\n\n> Given A and B we have two triangles (maybe equal), so two nodes, hence may apply [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) using our chosen edge weights (distance between centroids).\n>\n> This quickly provides a solution i.e. a path.\n> However it is insufficient because realistic NPCs would not follow centroid to centroid paths.\n> One can solve this by applying the [string-pulling algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html).\n> It pulls the zig-zag path tight along the navigable polygons\' extremal points.\n\nDrag the nodes below to see _string-pulling_ in action.\n\n<div\n  class="tabs"\n  name="nav-string-pull-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { type: \'component\', filepath: \'example/SvgStringPull\' },\n   ]"\n></div>\n\n\x3c!-- \nImportantly, we are not avoiding obstacles as we encounter them, in the sense of [robotics]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1)).\nWe know exactly where each NPC is going because (a) we previously set them in motion, (b) we do not rely on unpredictable force-based simulations. Having complete information does not make the problem any less important: Turing\'s [original paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence, not solving real-world sensory robotics. --\x3e\n\n### Dynamic Navigation\n\n\x3c!-- __TODO__ mention other approaches; consider case of two agents, which stop and start in some manner --\x3e\n\nNavigation around dynamic objects is harder.\nWhat was once a collision-free path may no longer be.\nTwo officers on the bridge could be swapping shifts,\nor perhaps the player needs to rush through a moving crowd.\n\nOne common approach is to combine static navigation (previous section) with [steering behaviours](https://www.researchgate.net/publication/2495826_Steering_Behaviors_For_Autonomous_Characters).\nThey are usually implemented via a physics engine.\nAn NPC will be driven by its own force, plus other forces induced by the position and velocity of nearby NPCs.\n\n<aside>\n\nFor example, **obstacle avoidance** works by driving close characters apart.\nA suitable force is applied orthogonal to the NPC\'s direction of travel.\n\n</aside>\n\nHowever, one cannot expect the vector sum of forces to capture complex interactions between multiple characters.\nReynolds introduced Steering Behaviours as part of a pipeline:\n> _action selection_ \u2192 _steering_ \u2192 _animation_.\n\nIn practice, one must rely _heavily_ on action selection to avoid unrealistic behaviour such as oscillation and deadlock.\n\nThere is another well-known approach i.e. [Detour](https://github.com/recastnavigation/recastnavigation#detour) and in particular _DetourCrowd_, providing a sophisticated solution to multiple character navigation.\nIt has been [ported to JS](https://github.com/BabylonJS/Extensions/tree/master/recastjs) in BabylonJS,\nand also [integrated](https://docs.unrealengine.com/4.27/en-US/API/Runtime/Navmesh/DetourCrowd/dtCrowd/) into the Unreal Engine.\n\nIn Detour, a collection of NPCs is conceptualised as a _Crowd_.\nOne requests the Crowd to move individual NPCs to particular targets.\nAn updater function must be executed each frame.\nFor each fixed NPC, its nearby neighbours are modelled as temporary geometry, influencing the NPC\'s velocity.\nWe\'ll have more to say about this impressive open source library.\n\n### Navigation: Our Approach\n\nSo how will we approach this difficult problem?\nWell, we won\'t solve it generally.\nThat is,\n> _we don\'t seek a black box, magically producing collision-free concurrent navigation_.\n\nWe\'re happy to take things slow.\nLet\'s start with two colliding NPCs.\nWe\'ll detect their imminent collision, and then stop them both.\n\n<div\n  class="tabs"\n  name="nav-collide-demo"\n  height="400"\n  enabled="false"\n  tabs="[]"\n></div>\n\n__TODO__\n- DraggablePath component \u2705\n- Circle moves along navpath \u2705\n- Componentise and improve\n- Detect future collision for 2 paths\n- Combine with terminal?\n\n### Raycasting\n\n__TODO__\n- illustrate line-seg vs line-seg intersection with initial space partitioning\n- navigation through auto-opening doors\n- combine with terminal?\n\n<div\n  class="tabs"\n  name="nav-doors-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { type: \'component\', filepath: \'example/SvgDoorsDemo#101\' },\n     { type: \'component\', filepath: \'example/SvgDoorsDemo#301\' },\n   ]"\n></div>\n'},48834:function(e,n){"use strict";n.Z='## Tech (dev)\n\n### Static Analysis\n\n- Typescript via JSDoc, referring to CodeSandbox.\n\n### Runtime Analysis\n\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n\n<br>\n<br>\n\n\x3c!-- <div style="min-height: 500px"></div> --\x3e'}},function(e){e.O(0,[9774,9351,8456,1830,3359,2888,179],(function(){return n=58797,e(e.s=n);var n}));var n=e.O();_N_E=n}]);