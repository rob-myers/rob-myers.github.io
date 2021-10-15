(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[390],{97407:function(e,n,t){"use strict";t.d(n,{Z:function(){return g}});var a,s=t(86576),o=t(17928),i=t(82308),r=t(24009),l=t(52209),c=t(88269),p=t(58199),h=t(8311);function d(e){return e.article?(0,h.tZ)("div",{className:m,children:(0,h.tZ)(p.Z,{href:(0,o.Gu)(e.article),forward:!0,children:"continue"})}):null}var m=(0,c.iv)(a||(a=(0,l.Z)(["\n  cursor: pointer;\n  font-family: sans-serif;\n  letter-spacing: 4px;\n  \n  height: 64px;\n  display: flex;\n  margin-top: -64px;\n  font-size: 1.3rem;\n  @media(max-width: 800px) {\n    font-size: 1.1rem;\n    margin-top: 0px;\n  }\n\n  a {\n    color: #555;\n    width: 100%;\n    height: 100%;\n    text-align: center;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n  }\n"])));function g(e){var n=e.part,t=e.markdown,a=o.Pd[n].map((function(e){return e.key})),l=a.length?o.mh[(0,s.Z$)(a)]:null,c=null!==l&&void 0!==l&&l.next?o.mh[l.next]:null;return(0,h.BX)(i.Z,{children:[(0,h.tZ)(r.Z,{keys:a,markdown:t}),(0,h.tZ)(d,{article:c})]})}},6920:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return r}});var a=t(97407),s=t(38701),o=t(38523),i=t(8311);function r(){return(0,i.tZ)(a.Z,{part:1,markdown:{objective:s.Z,constraints:o.Z,technology:"## Technology\n\nSo, we're building a roguelike, directly on this website.\nIt will start to get fun once things are moving about.\nLet us list the underlying technologies.\n\n| Concept | Technology |\n| ------- | ---------- |\n| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |\n| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |\n| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |\n| Pathfinding | Based on [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |\n| Raycasting | Basic geometry and spacial partitions.  |\n| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |\n| Live analysis | In-browser terminal, via [xterm.js](https://www.npmjs.com/package/xterm) and [mvdan-sh](https://www.npmjs.com/package/mvdan-sh). |\n| Scripting | [TS Node](https://www.npmjs.com/package/ts-node) i.e. Node.js with types. |\n| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |\n| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |\n| Code sharing | Show [GitHub](https://github.com/) comments, provide GitHub [repo](https://github.com/rob-myers/rob-myers.github.io). |\n\n\x3c!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). --\x3e\n\nWe'll spend the next few articles clarifying the above table."}})}},44690:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/part/1",function(){return t(6920)}])},38523:function(e,n){"use strict";n.Z='## Constraints\n\nThis project needs a backbone.\nWe\'ve chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\nWe begin with the tools we\'ll use.  \n\n- Use standard web development, rather than HTMLCanvas and [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).\n- Use [NextJS](https://nextjs.org/) as our development environment.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n- Use [Preact](https://www.npmjs.com/package/preact) (a React alternative), and [Goober](https://www.npmjs.com/package/goober) (an [Emotion](https://www.npmjs.com/package/@emotion/styled) alternative).\n- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.\n- Support both mobile and desktop devices.\n\nThe name _Rogue Markup_ refers to the video game [_Rogue_](https://en.wikipedia.org/wiki/Rogue_(video_game)), and the HyperText _Markup_ Language (HTML).\nSince HTML may be used in many different ways,\nwe\'ve clarified our particular path above.\nAs a general principle, we\'ll use standard website technologies e.g. CSS, SVGs, PNGs and the Web Animations API.\n\n<aside>\n\nAlthough WebGL permits far richer 3D graphics than CSS,\nit leads away from the declarative nature of Markup.\nSticking to central web technologies makes our approach relevant to a far larger audience.\nWe also want to avoid obsessing over graphics: we want superior Game AI instead.\n\n</aside>\n\nIf you\'re unfamiliar with CodeSandbox (or similar sites), check out  [this example](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").\nIf you peruse the files, you\'ll find the rectangle class _Rect_ and a Geomorph PNG.\nOur CodeSandboxes use React, whereas this site uses _Preact_.\nMore on that later.\n\n### Game mechanics\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n- Use a realtime birdseye camera.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n- Use navigation & raycasting algorithms.\n- Use an in-browser terminal.\n- Do not use a Physics engine.\n\nTo debug and illustrate Game AI, we\'ll use a terminal.\nTry entering (or copy-pasting) the commands below.\nYou\'ll probably find it a bit fiddly on a mobile device.\n\n  | Category | Examples  |\n  | ------- | ---------- |\n  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n  | CRUD | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |\n\n  <div\n    class="tabs"\n    id="tabs-terminal-demo"\n    height="300"\n    tabs="[\n      { key: \'terminal\', session: \'test\' },\n      { key: \'terminal\', session: \'other\' },\n    ]"\n  ></div>\n\nAs usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process".\nTry terminating <span class="cmd">sleep 5</span>.\n\n### Setting\n\n- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).\n- Space vehicles, stations, and docks.\n- Buddhist backdrop via [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).\n- Horror backdrop via [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).\n\n\nTraveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.\nIt permits faster than light travel, at \u2264 6 parsecs per week.\nLearn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).\nIt directly motivated Robert Pearce\'s Starship Geomorphs, and provides considerable depth.\n\n<div style="font-size:smaller; padding-bottom: 6px">\n\n_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright \xa9 1977 \u2013 2021 Far Future Enterprises._\n</div>\n\n---\n\nOver time we\'ll clarify the above constraints, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\nSpelunky\'s creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).\nWe\'ll address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\nRogue Markup will be easy to extend.\nWe\'ll achieve this via compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won\'t confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere\'s hoping my chain of unfinished projects is coming to a close!'},38701:function(e,n){"use strict";n.Z='## Objective\n\nWe\'ll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).\n\n_Why?_\n\nBecause [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.\nAn environment is needed to make it meaningful, fixed narratives/missions are not.\n\nWe\'ll focus on combining navigation-based behaviours in a flexible manner.\nGame AI should be compositional, not forced into a narrative straight-jacket.\nAs for the environment, it will be driven by thousands of Traveller-based assets.\n\n<div\n  class="tabs"\n  id="tabs-geomorph-301-debug"\n  height="340"\n  tabs="[{ key: \'component\', filepath: \'images/Gm301Debug\' }]"\n></div>\n\nAbove we\'ve recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),\nusing 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nGreen indicates obstacles you can see over, whereas red indicates obstacles which are essentially walls. Together with the white doors and black walls (including the hull), they induce a navigable polygon shown in blue.\n\n> A larger version is [available](/pics/g-301--bridge.debug.x2.png "@new-tab").\n\nA "Starship Geomorph" is a rectangular partial floorplan of a starship, designed to be cut out and glued to other ones.\nThey were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).\nA 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).\nThe latter 2000+ symbols will form the underlying basis of _Rogue Markup_.\n'}},function(e){e.O(0,[774,106,732,13,888,179],(function(){return n=44690,e(e.s=n);var n}));var n=e.O();_N_E=n}]);