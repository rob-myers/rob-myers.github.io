(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[94],{41208:function(e,n,a){"use strict";a.r(n),a.d(n,{default:function(){return p}});var t=a(82308),s=a(24009),o=a(38701),i=a(38523),r=a(28834),l=a(82715),c=a(48834),h=a(6968),m=a(8311),d={objective:o.Z,constraints:i.Z,finishing:r.Z,technology:i.Z,tech1:l.Z,tech2:l.Z,tech3:c.Z,geomorphs:h.Z};function p(){return(0,m.tZ)(t.Z,{children:(0,m.tZ)(s.Z,{keys:["objective","constraints","finishing","technology","tech1","tech2","tech3","geomorphs"],markdown:d})})}},2304:function(e,n,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/debug",function(){return a(41208)}])},38523:function(e,n){"use strict";n.Z='## Constraints\n\nThis project needs a backbone.\nWe\'ve chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\nWe begin with the tools we\'ll use.  \n\n- Use standard web development, rather than HTMLCanvas and [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).\n- Use [NextJS](https://nextjs.org/) as our development environment.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n- Use [Preact](https://www.npmjs.com/package/preact) (a React alternative), and [Goober](https://www.npmjs.com/package/goober) (an [Emotion](https://www.npmjs.com/package/@emotion/styled) alternative).\n- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.\n- Support both mobile and desktop devices.\n\nThe name _Rogue Markup_ refers to the video game [_Rogue_](https://en.wikipedia.org/wiki/Rogue_(video_game)), and the HyperText _Markup_ Language (HTML).\nSince HTML may be used in many different ways,\nwe\'ve clarified our particular path above.\nAs a general principle, we\'ll use standard website technologies e.g. CSS, SVGs, PNGs and the Web Animations API.\n\n<aside>\n\nAlthough WebGL permits far richer 3D graphics than CSS,\nit leads away from the declarative nature of Markup.\nSticking to central web technologies makes our approach relevant to a far larger audience.\nWe also want to avoid obsessing over graphics: we want superior Game AI instead.\n\n</aside>\n\nIf you\'re unfamiliar with CodeSandbox (or similar sites), check out  [this example](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").\nIf you peruse the files, you\'ll find the rectangle class _Rect_ and a Geomorph PNG.\nOur CodeSandboxes use React, whereas this site uses _Preact_.\nMore on that later.\n\n### Game mechanics\n\nNext, gameplay related constraints.\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n- Use a realtime birdseye camera.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n- Use navigation & raycasting algorithms.\n- Use an in-browser terminal.\n- Do not use a Physics engine.\n\nWe saw [an example](/pics/g-301--bridge.debug.x2.png "@new-tab") of a Geomorph in the previous article.\nBy a realtime birdseye camera we just mean a pannable and zoomable SVG.\nUsing the Web Animations API provides access to the underlying technology driving CSS animations.\nAs for navigation and raycasting algorithms, this amounts to using a [navmesh](https://en.wikipedia.org/wiki/Navigation_mesh#:~:text=A%20navigation%20mesh%2C%20or%20navmesh,video%20game%20AI%20in%202000.) and computing ray/geometry collisions efficiently.\n\nImportantly, in order to develop complex Game AI, we\'ll use a terminal.\nTry entering (or copy-pasting) the commands below.\nMobile users may find copy-pasting easier.\n\n  | Category | Examples  |\n  | ------- | ---------- |\n  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n  | CRUD | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |\n\n  <div\n    class="tabs"\n    id="tabs-terminal-demo"\n    height="300"\n    tabs="[\n      { key: \'terminal\', session: \'test\' },\n      { key: \'terminal\', session: \'other\' },\n    ]"\n  ></div>\n\nAs usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process" e.g. try terminating <span class="cmd">sleep 5</span>. We\'ll use terminals to monitor the current state of our Game AI, issue direct commands, and specify long-running behaviour.\n\n### Setting\n\n\x3c!-- TODO from here --\x3e\n\n- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).\n- Space vehicles, stations, and docks.\n- Buddhist backdrop via [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).\n- Horror backdrop via [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).\n\n\nTraveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.\nIt permits faster than light travel, at \u2264 6 parsecs per week.\nLearn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).\nIt directly motivated Robert Pearce\'s Starship Geomorphs, and provides considerable depth.\n\n<div style="font-size:smaller; padding-bottom: 6px">\n\n_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright \xa9 1977 \u2013 2021 Far Future Enterprises._\n</div>\n'},28834:function(e,n){"use strict";n.Z="## Finishing\n\nOver time we'll further clarify the above constraints, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\nSpelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).\nWe'll address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\nRogue Markup will be easy to extend.\nWe'll achieve this via compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere's hoping my chain of unfinished projects is coming to a close!"},6968:function(e,n){"use strict";n.Z='## Geomorphs\n\n### Filesystem structure\n\nmedia\n- Starship Geomorphs 2.0.pdf (Original source)\n- Starship Symbols.pdf (Original source)\n- Geomorphs.zip (Transparent PNGs obtained from Starship Geomorphs 2.0)\n- SymbolsHighRes.zip (Transparent PNGs obtained from Starship Symbols)\n\nmedia/Geomorph\n- PNGs of lower quality (relatively).\n- Extracted from "Starship Geomorphs 2.0.pdf" by ... \n\nmedia/Symbols\n- PNGs of higher quality.\n- Extracted from "Starship Symbols.pdf" by ... \n\nmedia/scripts\n- ts-node scripts launched via npm scripts\n- Directories generated by scripts\n- media/geomorph-edge (Edge Geomorphs)\n- media/symbol-bridge\n- media/symbol-dock-small-craft\n- media/symbol-staterooms\n- media/symbol-lounge\n- media/symbol-root\n\npublic/png\n- PNGs from media/symbol-* with labels removed\n\npublic/svg\n- Enriched symbols\n- Geomorph hulls\n\n<div\n  class="tabs"\n  enabled="false"\n  height="400"\n  tabs="[\n    { key: \'component\', filepath: \'geomorph/GeomorphDemo\' },\n  ]"\n></div>\n'},38701:function(e,n){"use strict";n.Z='## Objective\n\nWe\'ll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).\n\n_Why?_\n\nBecause [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.\nAn environment is needed to make it meaningful, fixed narratives/missions are not.\n\nWe\'ll focus on combining navigation-based behaviours in a flexible manner.\nGame AI should be compositional, not forced into a narrative straight-jacket.\nAs for the environment, it will be driven by thousands of Traveller-based assets.\n\n<div\n  class="tabs"\n  id="tabs-geomorph-301-debug"\n  height="340"\n  tabs="[{ key: \'component\', filepath: \'images/Gm301Debug\' }]"\n></div>\n\nAbove we\'ve recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),\nusing 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nGreen indicates obstacles you can see over, whereas red indicates obstacles which are essentially walls. Together with the white doors and black walls (including the hull), they induce a navigable polygon shown in blue.\n\n> A larger version is [available](/pics/g-301--bridge.debug.x2.png "@new-tab").\n\nA "Starship Geomorph" is a rectangular partial floorplan of a starship, designed to be cut out and glued to other ones.\nThey were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).\nA 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).\nThe latter 2000+ symbols will form the underlying basis of _Rogue Markup_.\n'},82715:function(e,n){"use strict";n.Z='## Tech (ai)\n\nSo far we\'ve described our objective, constrained our approach, and listed the technologies we\'ll use.\nHaving discussed [JavaScript components](2#tech1--react-and-preact "@anchor"),\nwe turn to Game AI.\n\n### Overview\n\n_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.\nThe [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").\nThese behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.\nSo how do video games implement these behaviours?\n\nThere are three standard systems:\n\n> **Navigation**: _planning e.g. route from A to B._\n>\n> **Animation**: _realism (e.g. limb movement) and visual cues._\n>\n> **Physics**: collision detection, force-driven rigid bodies, raycasting.\n\nNavigation is of central importance and will be discussed shortly.\nConcerning animation, we\'re definitely not going to obsess over realism.\nNevertheless we\'ll need visual cues to indicate NPC actions,\nand a _sense of flow_ via interdependent concurrent animations.\nAs for a physics engine, we [already mentioned](1#constraints--game-mechanics "@anchor") we won\'t be using one. Instead:\n- Collision detection will be handled at a higher level (navigation).\n- The Web Animations API will replace force-driven movement.\n- We\'ll write our own raycaster e.g. for line-of-sight detection.\n\nIt is worth discussing Navigation and Raycasting in more detail.\n\n### Navigation\n\n\n\x3c!-- __TODO__\n- Rodney Brooks layers.\n- Navigation based Game AI.\n- Corner-wrapped Pathfinding only provides part of the \n- Geomorph 101\n--\x3e\n\n\x3c!-- Pathfinding is central to Game AI.\nOur NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. --\x3e\n\n<div\n  class="tabs"\n  id="tabs-nav-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'nav/NavDemo\' },\n   ]"\n></div>\n\n### Raycasting\n\n...'},48834:function(e,n){"use strict";n.Z='## Tech (dev)\n\n### Static Analysis\n\n- Typescript via JSDoc, referring to CodeSandbox.\n\n### Runtime Analysis\n\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n\n<br>\n<br>\n\n\x3c!-- <div style="min-height: 500px"></div> --\x3e'}},function(e){e.O(0,[774,106,732,13,888,179],(function(){return n=2304,e(e.s=n);var n}));var n=e.O();_N_E=n}]);