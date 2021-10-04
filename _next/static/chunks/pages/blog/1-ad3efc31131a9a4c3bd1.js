(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[483],{3289:function(e,n,a){"use strict";a.r(n),a.d(n,{default:function(){return l}});var s=a(30829),t=a(21850),o=a(38701),i=a(38523),r=a(8311);function l(){return(0,r.BX)(s.Z,{children:[(0,r.tZ)(t.Z,{dateTime:"2021-07-19",children:o.Z}),(0,r.tZ)(t.Z,{dateTime:"2021-07-19",children:i.Z})]})}},42807:function(e,n,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/blog/1",function(){return a(3289)}])},38523:function(e,n){"use strict";n.Z='## Constraints\n\nThis project needs a backbone.\nWe\'ve chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\n- Use CSS/SVG/PNGs, not HTMLCanvas/WebGL.\n- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n- Use [Preact](https://www.npmjs.com/package/preact) (like React), and [Goober](https://www.npmjs.com/package/goober) (like [Emotion](https://www.npmjs.com/package/@emotion/styled)).\n- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.\n- Use [NextJS](https://nextjs.org/) as our dev env.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Support mobile/desktop devices.\n\nFor example, here\'s a [CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").\nIf you peruse the files, you\'ll find the rectangle class _Rect_ and a Geomorph PNG.\nOur CodeSandboxes use React, whereas this site uses _Preact_.\nMore on that later.\n\n### Game mechanics\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n- Use a realtime birdseye camera.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n- Use navigation & raycasting algorithms.\n- Use an in-browser terminal.\n- Do not use a Physics engine.\n\nTo debug and illustrate Game AI, we\'ll use a terminal.\nTry entering (or copy-pasting) the commands below.\n\n  | Category | Examples  |\n  | ------- | ---------- |\n  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n  | CRUD | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |\n\n  <div\n    class="tabs"\n    height="300"\n    tabs="[ { key: \'terminal\', session: \'test\' } ]"\n  ></div>\n\nAs usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process".\nTry terminating <span class="cmd">sleep 5</span>.\n\n### Setting\n\n- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).\n- Space vehicles, stations, and docks.\n- Buddhist backdrop via [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).\n- Horror backdrop via [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).\n\n\nTraveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.\nIt permits faster than light travel, at \u2264 6 parsecs per week.\nLearn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).\nIt directly motivated Robert Pearce\'s Starship Geomorphs, and provides considerable depth.\n\n<div style="font-size:smaller; padding-bottom: 6px">\n\n_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright \xa9 1977 \u2013 2021 Far Future Enterprises._\n</div>\n\n---\n\nOver time we\'ll clarify the above constraints, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\nSpelunky\'s creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).\nWe\'ll address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\nRogue Markup will be easy to extend.\nWe\'ll achieve this via compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won\'t confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere\'s hoping my chain of unfinished projects is coming to a close!'},38701:function(e,n){"use strict";n.Z='## Objective\n\nWe\'ll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).\n\n_Why?_\n\nBecause [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.\nAn environment is needed to make it meaningful, fixed narratives/missions are not.\n\nWe\'ll focus on combining navigation-based behaviours in a flexible manner.\nGame AI should be compositional, not forced into a narrative straight-jacket.\nAs for the environment, it will be driven by thousands of Traveller-based assets.\n\n<div\n  class="tabs"\n  height="400"\n  tabs="[{ key: \'component\', filepath: \'images/Gm301Debug\' }]"\n></div>\n\nAbove we\'ve recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),\nusing 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nA larger version is [available](/pics/g-301--bridge.debug.x2.png "@new-tab").\nRoughly speaking, a "Starship Geomorph" is a rectangular slice of a starship designed to be cut out and glued to others.\nThey were created by Robert Pearce, and distributed as PDFs on his [blog](http://travellerrpgblog.blogspot.com/).\nTheir 2nd version was released in 2020, and soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).\nThe latter 2000+ symbols will form the underlying basis of _Rogue Markup_.\n'}},function(e){e.O(0,[774,35,953,888,179],(function(){return n=42807,e(e.s=n);var n}));var n=e.O();_N_E=n}]);