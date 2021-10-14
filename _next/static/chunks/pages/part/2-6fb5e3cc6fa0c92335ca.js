(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[510],{97407:function(e,n,t){"use strict";t.d(n,{Z:function(){return u}});var a,o=t(86576),i=t(17928),s=t(82308),r=t(24009),c=t(52209),d=t(88269),l=t(58199),h=t(8311);function m(e){return e.article?(0,h.tZ)("div",{className:p,children:(0,h.tZ)(l.Z,{href:(0,i.Gu)(e.article),forward:!0,children:"continue"})}):null}var p=(0,d.iv)(a||(a=(0,c.Z)(["\n  cursor: pointer;\n  font-family: sans-serif;\n  text-decoration: underline;\n  \n  height: 64px;\n  display: flex;\n  margin-top: -64px;\n  font-size: 1.3rem;\n  @media(max-width: 800px) {\n    font-size: 1.1rem;\n    margin-top: 0px;\n  }\n\n  a {\n    color: #222;\n    width: 100%;\n    height: 100%;\n    text-align: center;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n  }\n"])));function u(e){var n=e.part,t=e.markdown,a=i.Pd[n].map((function(e){return e.key})),c=a.length?i.mh[(0,o.Z$)(a)]:null,d=null!==c&&void 0!==c&&c.next?i.mh[c.next]:null;return(0,h.BX)(s.Z,{children:[(0,h.tZ)(r.Z,{keys:a,markdown:t}),(0,h.tZ)(m,{article:d})]})}},4221:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return r}});var a=t(97407),o=t(33023),i=t(86262),s=t(8311);function r(){return(0,s.tZ)(a.Z,{part:2,markdown:{"tech-1":'## Tech (js)\n\nWe\'ll now discuss our chosen JavaScript component framework.\n> Please excuse the jargon, the details can be picked up later on.\n\n### JavaScript\n\nThe early 90s brought three pillars: HTML, CSS and JavaScript (JS).\nWhenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.\nOur web browser renders the HTML and CSS immediately, and runs the JS to provide interactivity.\nMore precisely, all subsequent DOM mutations are performed by JavaScript.\nIt is now common to generate the initial HTML using JS too,\neither during a build-step or on a Node.js server.\nIn particular, JavaScript has become the central web technology.\n\n\n### React Function Components\n\nCompeting JavaScript frameworks exist, often with their own notion of component.\nOne popular approach uses _React function components_, which are just JavaScript functions with constraints on their parameters and return value.\n\n- They have a single parameter, conventionally called _props_.\n\n  It is a JavaScript object defining the component\'s named inputs,\n  and possibly special properties like _children_, _key_ and _ref_.\n\n- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).\n\n  This returned value ultimately amounts to an HTML fragment to be rendered,\n  and may depend on the component\'s props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).\n\nReact developers use a grammatical extension of JavaScript called JSX.\nIt freely combines JS with XML, so JavaScript values can be passed to arbitrary attributes, and XML can be passed around as a JavaScript value. The grammar is particularly suitable for specifying dynamic DOM trees.\nLet\'s consider an example, a pannable and zoomable grid (also [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab")).\n\n<div\n  class="tabs"\n  height="400"\n  id="tabs-panzoom"\n  tabs="[\n    { key: \'component\', filepath: \'panzoom/PanZoomDemo\' },\n    { key: \'code\', filepath: \'panzoom/PanZoom.jsx\', folds: [{ line: 8, ch: 0 }] },\n    { key: \'code\', filepath: \'panzoom/PanZoomDemo.jsx\' },\n  ]"\n></div>\n\nThe file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab tabs-panzoom code--panzoom/PanZoom.jsx")) defines two React function components, _PanZoom_ and _Grid_.\nBehaviourally:\n\n- _PanZoom_ renders an SVG consisting of its children (the Geomorph image provided in _PanZoomDemo_) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.\n\n- _Grid_ renders part of an SVG i.e. two grid patterns.\n  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits "@new-tab").\n\n  <aside>\n  \n  SVG user units become concrete via the `<svg>`\'s viewBox attribute and its width/height within the DOM.\n  We\'ll follow a convention based on the work of Robert Pearce and Eric B. Smith. That is, 60 abstract user units (one large grid square) correspond to 1.5 meters.\n  </aside>\n\n### React and Preact\n\nThe above two JS functions each have a single parameter `props`, and return something which looks like HTML (but isn\'t).\nFor example, _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.\nThen although React function components are functions, syntactically they are not invoked like functions (we don\'t write `Grid(props)`).\nThen what does this XML syntax mean?\nThat is, what are React function components actually returning?\nHere\'s a whirlwind overview.\n\n- React devs use a grammatical extension [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript) "@new-tab") of JS by XML.\n- React applications are built by composing React function components, using the XML syntax for their return value.\n- Dev tools convert JSX into JS by replacing XML tags with invocations of `React.createElement` (see [example below](#command "open-tab tabs-jsx-to-js")).\n- This website actually uses _Preact_, a React alternative with the same API.\n  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js "@new-tab"),\n  and creates Preact virtual DOM nodes.\n- The root component is usually called _App_.\n  Running a React application means [invoking `ReactDOM.render`](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab")\n  with 2 arguments: `<App/>` and a DOM node _el_.\n\n- [`ReactDOM.render`](https://github.com/preactjs/preact/blob/master/src/render.js "@new-tab") initially converts `<App/>` into a DOM node mounted at _el_.\n  A subcomponent may re-render, recursively recreating a virtual DOM node.\n  It is [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js "@new-tab") and only the difference is applied to the DOM.\n\n<div\n  class="tabs"\n  id="tabs-jsx-to-js"\n  height="340"\n  tabs="[ { key: \'code\', filepath: \'example/jsx-to-js.jsx\' } ]"\n></div>\n\n### React Renders\n\n\x3c!--\nWebsites respond to interaction, sometimes without changing the DOM.\nWhen they do mutate the DOM, they usually don\'t continually do so.\nFor example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.\nAs another example, showing additional search results amounts to a single mutation.\n--\x3e\n\nWhen React renders a component, it computes a rooted subtree of the virtual DOM,\ncompares the previous one, and patches the DOM.\nIf many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221 "@new-tab") via the ancestral relationship.\nDevelopers can also avoid recreating an entire rooted subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js "@new-tab").\nBut for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.\n\nHowever, we are making a realtime video game.\nWe want to control the rendering as much as possible, to ensure good performance and aid debugging e.g. when many objects are onscreen.\nIf we allowed React (actually, Preact) to render in response to user interaction, we\'d lose this control.\nTake another look at _panzoom/PanZoom.jsx_.\n\n<div\n  class="tabs"\n  height="360"\n  id="tabs-panzoom-again"\n  tabs="[\n    { key: \'code\', filepath: \'panzoom/PanZoom.jsx\' },\n    { key: \'code\', filepath: \'geom/rect.js\' },\n  ]"\n></div>\n\n_PanZoom_ returns an `<svg/>` with a viewBox attribute determined by `state.viewBox`.\nWhen a user zooms via mousewheel, the event handler `state.onWheel` updates `state.viewBox`.\nBut updating this variable does not automatically update the virtual DOM.\nUsually one would _trigger a re-render_, so that _PanZoom_ returns `<svg/>` with the updated viewBox, and the DOM-diffing algorithm does the update.\nBut how do we trigger a re-render?\n\n### Internal state via `useState`\n\nA React function component is rendered whenever an ancestor is (modulo React.memo), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.\n\n> `const [value, setValue] = React.useState(() => initialValue);`\n\nThese declarations cannot be nested, must occur at the "top-level" of the React function component, and must always execute in the same order.\nThis induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109 "@new-tab") with their enclosing component.\nTo change state we execute `setValue(nextValue)` e.g. in response to a click. If `nextValue` differs from `value`, the function `setValue` causes the component to re-render where now `React.setState(...)[0]` has the new value.\nThis propagation of internal state is possible because a component\'s hooks must always execute in the same order.\n\n### Avoiding React Renders\n\nIn _panzoom/PanZoom.jsx_, `value` corresponds to `state` but there is no correspondent of `setValue`.\nWhy?\nBecause we never inform React we\'ve changed `state`, despite mutating it on mouse and pointer events.\nInstead we directly mutate the DOM via:\n\n> ``state.root.setAttribute( \'viewBox\', `${state.viewBox}` );``\n\n\x3c!-- By the way, `` `${state.viewBox}` `` amounts to `state.viewBox.toString()` which is defined in [geom/rect.js](#command "open-tab panzoom-again code--geom/rect.js"). --\x3e\n\nAs far as React is concerned, nothing has changed.\nFurthermore if React renders the component for another reason, it\'ll use the mutated `state` to set the viewBox attribute (no change).\nWhy don\'t we use `setState`?\nTo avoid needlessly recomputing `<Grid />` and `children` whenever we pan or zoom.\nOur game may contain many elements, and we\'d rather not recompute their virtual DOM tens of times per second.\n\nThe above situation is handled by a single DOM mutation.\nIn more complex situations we\'ll integrate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).\nMore on that later.\n\n\x3c!-- ### CSS inside JS\n\nTraditionally, CSS is provided in separate files,\nlinked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.\nBoth _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.\nThis means the CSS is written inside JS or JSX files, often together with the React component it applies to.\nThe npm module [Goober](https://www.npmjs.com/package/goober) handles this for us. --\x3e\n',"tech-2":o.Z,"tech-3":i.Z}})}},58797:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/part/2",function(){return t(4221)}])},33023:function(e,n){"use strict";n.Z='## Tech (ai)\n\nSo far we\'ve described our objective, constrained our approach, and listed the technologies we\'ll use.\nHaving discussed [JavaScript components](2#tech-1--react-and-preact "@anchor"),\nwe turn to Game AI.\n\n### Overview\n\n_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.\nThe [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").\nThese behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.\nSo how do video games implement these behaviours?\n\nThere are three standard systems:\n\n> **Navigation**: _planning e.g. route from A to B._\n>\n> **Animation**: _realism (e.g. limb movement) and visual cues._\n>\n> **Physics**: collision detection, force-driven rigid bodies, raycasting.\n\nNavigation is of central importance and will be discussed shortly.\nConcerning animation, we\'re definitely not going to obsess over realism.\nNevertheless we\'ll need visual cues to indicate NPC actions,\nand a _sense of flow_ via interdependent concurrent animations.\nAs for a physics engine, we [already mentioned](1#constraints--game-mechanics "@anchor") we won\'t be using one. Instead:\n- Collision detection will be handled at a higher level (navigation).\n- The Web Animations API will replace force-driven movement.\n- We\'ll write our own raycaster e.g. for line-of-sight detection.\n\nIt is worth discussing Navigation and Raycasting in more detail.\n\n### Navigation\n\n\n\x3c!-- __TODO__\n- Rodney Brooks layers.\n- Navigation based Game AI.\n- Corner-wrapped Pathfinding only provides part of the \n- Geomorph 101\n--\x3e\n\n\x3c!-- Pathfinding is central to Game AI.\nOur NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. --\x3e\n\n<div\n  class="tabs"\n  id="tabs-nav-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'nav/NavDemo\' },\n   ]"\n></div>\n\n### Raycasting\n\n...'},86262:function(e,n){"use strict";n.Z='## Tech (dev)\n\n### Static Analysis\n\n- Typescript via JSDoc, referring to CodeSandbox.\n\n### Runtime Analysis\n\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n\n<br>\n<br>\n\n\x3c!-- <div style="min-height: 500px"></div> --\x3e'}},function(e){e.O(0,[774,106,651,13,888,179],(function(){return n=58797,e(e.s=n);var n}));var n=e.O();_N_E=n}]);