(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[880],{19070:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return m}});var o=t(88823),a=t(70704),i=t(22200),s=t(52209);function r(){var e=(0,s.Z)(["\n  border: none;\n  margin: 24px;\n\n  @media(max-width: 600px) {\n    margin: 0px;\n  }\n"]);return r=function(){return e},e}function c(){return(0,o.tZ)("hr",{className:l})}var l=(0,t(88269).iv)(r()),d=t(52542),h=t(77027);function m(){return(0,o.BX)(a.Z,{children:[(0,o.tZ)(i.Z,{}),(0,o.tZ)(d.Z,{children:'\n---\n\n## Objective <float rem="1.2">19th July 2021</float>\n\nWe are going to make a _Game AI focused_ [roguelike](https://en.wikipedia.org/wiki/Roguelike),\nset in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).\n\n_Why focus on Game AI?_\n\nBecause NPC behaviour is more interesting than any particular game.\nAn environment is needed to make it meaningful,\nfixed narratives/missions are not.\n\nOur approach will be algorithmic,\nyet driven by the environment e.g. thousands of [Traveller-themed assets](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nWe\'ll focus on combining and managing navigation-based behaviours.\nGame AI should be compositional, not forced into a straight-jacket.\n\n\x3c!--\nWeb development permits an open/extendable approach to building a game.\nOn the other hand, realtime games push the boundaries of traditional web development,\nforcing us to take more care than usual.\n--\x3e\n        '}),(0,o.tZ)(c,{}),(0,o.tZ)(d.Z,{children:"\n---\n\n## Constraints <float rem=\"1.2\">19th July 2021</float>\n\nThis project needs a backbone.\nWe've chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\n\x3c!-- - Use [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for physics. --\x3e\n- Use CSS/SVG/PNGs, not HTMLCanvas/WebGL.\n- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n- Use [Preact](https://www.npmjs.com/package/preact) (not React), and [Goober](https://www.npmjs.com/package/goober) (not [Emotion](https://www.npmjs.com/package/@emotion/styled)).\n- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.\n- Use [NextJS](https://nextjs.org/) as our dev env.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Support mobile/desktop devices.\n\n### Game mechanics (low-level)\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n- Use a realtime birdseye camera.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n- Use navigation and raycasting algorithms.\n- Use an in-browser terminal.\n- Do not use a Physics engine.\n\x3c!-- - Use procedural generation for spaceship building. --\x3e\n\n\n### Setting\n  \n- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).\n- Space vehicles/station/docks.\n- Buddhist backdrop based on [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).\n- Horror backdrop based on [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).\n\n<div style=\"height:8px\"></div>\n\nOver time we'll clarify the above, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\n\x3c!--\nAlthough we'll avoid _fixed_ narratives/missions/levels,\ncompositional Game AI naturally leads to procedurally generated missions (common amongst Roguelikes).\nIn this sense we are attemping to create a video game.\n--\x3e\nSpelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).\nWe'll now address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\x3c!-- In particular, we'll control and monitor NPC behaviour using an in-browser terminal. --\x3e\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical action-game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\nIt should be easy for others to extend Rogue Markup.\nWe'll achieve this by providing compositional code, escape hatches to CodeSandbox, and clear explanations.\nComments will be shown so [GitHub](https://github.com/) users can share ideas and links.\n\n\x3c!--\n[NetHack](https://en.wikipedia.org/wiki/NetHack)'s \u2265 34 year history shows _we needn't spell out a story_.\n--\x3e\n\x3c!--\nWe'll add cameras, guards, doors, keys, weapons etc.\nAll NPC decisions will be depicted graphically, such as future navpaths with probabilistic branches.\n--\x3e\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere's hoping my chain of unfinished projects is coming to a close!\n      "}),(0,o.tZ)(c,{}),(0,o.tZ)(d.Z,{children:"\n---\n## Technology  <float rem=\"1.2\">19th July 2021</float>\n\nSo, we're building a roguelike, directly on this website.\nIt will start to get fun once things are moving about.\nBut first we'll describe the underlying technologies.\n\n| Concept | Technology |\n| - | - |\n| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |\n| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober) & programmatically. |\n| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |\n| Pathfinding | A port of [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |\n| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |\n| Live analysis | Our own in-browser terminal. |\n| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |\n| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |\n| Code sharing | [GitHub](https://github.com/) comments shown on site; GitHub [repo](https://github.com/rob-myers/rob-myers.github.io) for this site. |\n\n\x3c!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). --\x3e\n\n\nThe early 90s brought three pillars: HTML, CSS and JavaScript.\nWhenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.\nOur web browser renders the HTML and CSS immediately, and runs the JS to provide interactivity (beyond links, hovers and CSS animations).\nMore precisely, all subsequent DOM mutations are performed by JavaScript.\nIt is now common to generate the initial HTML using JS too,\neither during a build-step or on a Node.js server.\nIn particular, JavaScript has become the central web technology.\n\n> \u2139\ufe0f _We'll spend the next two sections describing how we use JS._\n> _The discussion is full of jargon, but the details can be picked up later on._\n\n### React and Preact\n\nCompeting JavaScript frameworks exist, usually with their own notion of _component_.\nOne popular approach uses _React function components_, which are just JavaScript functions with constraints on their parameters and return values.\n\n- They have a single parameter, conventionally called _props_.\n\n  It is a JavaScript object defining the component's named inputs,\n  and possibly special properties like _children_, _key_ and _ref_.\n\n- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).\n\n  This returned value amounts to an HTML fragment to be rendered,\n  and may depend on the component's props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).\n\nReact developers use a grammatical extension of JavaScript called JSX.\nIt permits composing components using an XML-like syntax, to obtain the desired dynamic DOM tree.\nLet's consider an example, a pannable and zoomable grid.\n      "}),(0,o.tZ)(h.Z,{storeKey:"panzoom",height:400,tabs:[{key:"component",filepath:"panzoom/PanZoomDemo.jsx"},{key:"code",filepath:"panzoom/PanZoom.jsx",folds:[{line:8,ch:0}]},{key:"code",filepath:"panzoom/PanZoomDemo.jsx"}]}),(0,o.tZ)(d.Z,{children:'\nThe file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom code--panzoom/PanZoom.jsx")) defines two React function components, _PanZoom_ and _Grid_.\nBehaviourally:\n\n- _PanZoom_ renders an SVG consisting of its children (the red square in the demo) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.\n\n- _Grid_ renders part of an SVG i.e. a grid obtained by repeating a 10x10 unit pattern.\n\nThey are JS functions with a single parameter, returning something which looks like HTML (but isn\'t).\nNotice _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.\nThen although React function components are functions, syntactically they are not invoked like functions.\nYou can also view the demo code [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab"), which permits code editing.\n\nHere\'s a whirlwind overview of React (and Preact).\n\n- React devs use a grammatical extension of JS with XML called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)).\n- React applications are often built by composing React function components, using the XML syntax for their return value.\n- Dev tools convert JSX into JS, by replacing XML tags with invocations of the function `React.createElement`.\n  See [example/jsx-to-js.jsx](#command "open-tab jsx-to-js") below.\n- Actually, this website uses Preact, a React alternative with the same API.\n  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js),\n  and makes Preact virtual DOM nodes.\n- The root component is usually called _App_.\n  Running a React application means [invoking `ReactDOM.render`](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab")\n  with 2 arguments: `<App/>` and a DOM node _el_.\n\n- [`ReactDOM.render`](https://github.com/preactjs/preact/blob/master/src/render.js) initially converts `<App/>` into a DOM node mounted at _el_.\n  A subcomponent may subsequently re-render, recursively recreating a virtual DOM node.\n  It is then [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js), and only the difference is applied to the DOM.\n\n\x3c!--\n- If `<App/>` is a website, it is often [rendered as HTML server-side](https://github.com/preactjs/preact-render-to-string/blob/master/src/index.js), so the client can render it immediately.\n  The client then invokes [`ReactDOM.hydrate`](https://github.com/preactjs/preact/blob/master/src/render.js) instead of `ReactDOM.render`, but with the same arguments.\n--\x3e\n      '}),(0,o.tZ)(h.Z,{storeKey:"jsx-to-js",height:340,tabs:[{key:"code",filepath:"example/jsx-to-js.jsx"}]}),(0,o.tZ)(d.Z,{children:"\n\x3c!--\nSo, React function components are written using syntactic-sugar (JSX), and composed together like HTML.\nWe're using Preact (its codebase is smaller, and it has reputation for being faster,\nalthough React has a _much_ wider scope via [custom renderers](https://github.com/chentsulin/awesome-react-renderer)).\nRendering a component involves (re)constructing virtual DOM nodes and diffing them.\nFinally, the first render is often precomputed, to load faster.\n--\x3e\n\n### React Renders and Web Components\n\n\x3c!--\nWebsites respond to interaction, sometimes without changing the DOM.\nWhen they do mutate the DOM, they usually don't continually do so.\nFor example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.\nAs another example, showing additional search results amounts to a single mutation.\n--\x3e\n\nWhen React renders a component, it computes a rooted subtree of the virtual DOM,\ncompares the previous one, and patches the DOM.\nIf many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221) via the ancestral relationship.\nDevelopers can also avoid recreating an entire rooted subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js).\nBut for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.\n\nHowever, we are making a realtime video game.\nWe want to control the rendering as much as possible, to ensure good performance and aid debugging e.g. when many objects are onscreen.\nIf we allowed React (actually, Preact) to render in response to user interaction, we'd lose this control.\nTake another look at _panzoom/PanZoom.jsx_.\n\n      "}),(0,o.tZ)(h.Z,{height:360,tabs:[{key:"code",filepath:"panzoom/PanZoom.jsx"},{key:"code",filepath:"geom/rect.js"}]}),(0,o.tZ)(d.Z,{children:"\n\n_PanZoom_ returns an `<svg/>` with a viewBox attribute determined by _state.viewBox_.\nWhen a user zooms via mousewheel, the event handler _state.onWheel_ updates _state.viewBox_.\nBut updating this variable does not automatically update the virtual DOM.\nThe canonical React approach would be to re-render, so that _PanZoom_ returns `<svg/>` with the updated viewBox, and the DOM-diffing algorithm does the update.\nBut how do we trigger a re-render?\n\nA React function component is rendered whenever an ancestor is (modulo React.memo), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.\n\n> `const [data, setData] = React.useState(() => initialState)`.\n\nThese declarations cannot be nested and must occur at the \"top-level\" of the React function component, always executing in the same order.\nThis induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109) with their enclosing component.\nTo change state we execute _setData(nextData)_ e.g. in response to a click. If _nextData_ differs from _data_, the component is re-rendered relative to the new data.\n\nBut in _panzoom/PanZoom.jsx_ we only destructure _state_, not the callback for changing it.\n\n__TODO__ _we'll control the rendering i.e. React should only render initially or during fast refresh. We'll manipulate the DOM directly using Web Components. By keeping the initial virtual DOM mostly constant, the DOM diffing won't interfere._\n\n__TODO__ Server-side rendering cannot handle DOM mutations, so we don't use SSR.\n\n\n### CSS inside JS\n\nTraditionally, CSS is provided in separate files,\nlinked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.\nBoth _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.\nThis means the CSS is written inside JS or JSX files, often together with the React component it applies to.\nThe npm module [Goober](https://www.npmjs.com/package/goober) handles this for us.\n      "}),(0,o.tZ)(c,{}),(0,o.tZ)(d.Z,{children:"\n---\n## Technology (Part 2)\n\n### Navigation\n\nPathfinding is central to Game AI.\nOur NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors.\n\n      "}),(0,o.tZ)(h.Z,{height:300,tabs:[{key:"component",filepath:"pathfinding/NavDemo.jsx"}]}),(0,o.tZ)(c,{}),(0,o.tZ)(d.Z,{children:"\n## Technology (Part 3)\n\n### Static and Runtime Analysis\n\n- Typescript via JSDoc, refering to CodeSandbox.\n- Terminal + Preact hooks\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n      "}),(0,o.tZ)(c,{}),(0,o.tZ)(d.Z,{children:'\n## Starship Geomorphs <float rem="1.2">19th July 2021</float>\n\n### Filesystem structure\n\nmedia\n- Starship Geomorphs 2.0.pdf (Original source)\n- Starship Symbols.pdf (Original source)\n- Geomorphs.zip (Transparent PNGs obtained from Starship Geomorphs 2.0)\n- SymbolsHighRes.zip (Transparent PNGs obtained from Starship Symbols)\n\nmedia/Geomorph\n- PNGs of lower quality (relatively).\n- Extracted from "Starship Geomorphs 2.0.pdf" by ... \n\nmedia/Symbols\n- PNGs of higher quality.\n- Extracted from "Starship Symbols.pdf" by ... \n\nmedia/scripts\n- ts-node scripts launched via npm scripts\n- Directories generated by scripts\n- media/geomorph-edge (Edge Geomorphs)\n- media/symbol-bridge\n- media/symbol-dock-small-craft\n- media/symbol-staterooms\n- media/symbol-lounge\n- media/symbol-root\n\npublic/png\n- PNGs from media/symbol-* with labels removed\n\npublic/svg\n- Enriched symbols\n- Geomorph hulls\n      '}),(0,o.tZ)(h.Z,{enabled:!0,height:400,tabs:[{key:"component",filepath:"geomorph/GeomorphDemo.jsx"}]})]})}},35838:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/draft",function(){return t(19070)}])}},function(e){e.O(0,[774,55,57,504,888,179],(function(){return n=35838,e(e.s=n);var n}));var n=e.O();_N_E=n}]);