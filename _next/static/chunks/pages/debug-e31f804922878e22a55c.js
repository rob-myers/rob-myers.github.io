(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[94],{41208:function(e,n,a){"use strict";a.r(n),a.d(n,{default:function(){return g}});var t=a(86576),i=a(36886),o=a(60370),s=a(38701),r=a(38523),l=a(28834),h=a(82715),c=a(48834),d=a(6968),p=a(8311),m={objective:s.Z,constraints:r.Z,finishing:l.Z,technology:r.Z,tech1:h.Z,tech2:h.Z,tech3:c.Z,geomorphs:d.Z};function g(){return(0,p.tZ)(i.Z,{children:(0,p.tZ)(o.Z,{keys:(0,t.XP)(m),markdown:m})})}},2304:function(e,n,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/debug",function(){return a(41208)}])},38523:function(e,n){"use strict";n.Z='## Constraints\n\nThis project needs a backbone.\nWe\'ve chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\nWe begin with the tools we\'ll use.  \n\n- Use standard web development, not [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).\n- Use [NextJS](https://nextjs.org/) as our development environment.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Use [Boxy SVG](https://boxy-svg.com/) to edit assets.\n- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n- Use [Preact](https://www.npmjs.com/package/preact) (a React alternative) and [Goober](https://www.npmjs.com/package/goober).\n- Support both mobile and desktop devices.\n\n\x3c!-- NOTE italics inside link currently unsupported --\x3e\n\nThe name _Rogue Markup_ refers to the prototypical procedural video game _[Rogue](https://en.wikipedia.org/wiki/Rogue_(video_game))_, and the HyperText _Markup_ Language (HTML).\nSince HTML may be used in many different ways,\nwe\'ve clarified our approach above.\nGenerally speaking, we\'ll use standard website technologies e.g. CSS, SVGs, PNGs and the Web Animations API.\n\n<aside>\n\nAlthough WebGL permits far richer 3D graphics than CSS,\nit leads away from the declarative nature of Markup.\nSticking to core web technologies makes our approach relevant to a far larger audience.\nWe also want to avoid obsessing over graphics, seeking superior Game AI instead.\n\n</aside>\n\nIf you\'re unfamiliar with CodeSandbox (or similar sites), check out  [this example](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").\nIf you peruse the files, you\'ll find the rectangle class _Rect_ and a Geomorph PNG.\nOur CodeSandboxes use React, whereas this site uses _Preact_.\nMore on that later.\n\n### Game mechanics\n\nNext, gameplay related constraints.\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n  > We saw [an example](/pics/g-301--bridge.debug.x2.png "@new-tab") in the previous article.\n- Use a realtime birdseye camera.\n  > Basically a pannable and zoomable SVG.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n  > This API provides access to the technology underlying CSS animations.\n- Use navigation & raycasting algorithms.\n  > This will involve a [navmesh](https://en.wikipedia.org/wiki/Navigation_mesh#:~:text=A%20navigation%20mesh%2C%20or%20navmesh,video%20game%20AI%20in%202000.) and the computation of ray/geometry collisions.\n- Do not use a Physics engine.\n- Use an in-browser terminal.\n\nIn order to develop complex Game AI, we\'ll use a terminal.\nTry entering or copy-pasting the commands below\n(mobile users may find copy-pasting easier).\n\n  | Category | Examples  |\n  | ------- | ---------- |\n  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n  | [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "@new-tab") | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |\n\n  <div\n    class="tabs"\n    name="terminal-demo"\n    height="300"\n    tabs="[\n      { key: \'terminal\', session: \'test\' },\n      { key: \'terminal\', session: \'other\' },\n    ]"\n  ></div>\n\nAs usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process" e.g. try terminating <span class="cmd">sleep 5</span>.\nPipelines and background processes are also supported.\nWe\'ll use terminals to monitor the current state of our Game AI, issue direct commands, and develop long-running behaviour.\n\n### Setting\n\nIt remains to constrain the setting.\n\n- Events take place in the [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3), onboard Space vehicles, stations and docks.\n- [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol) provides a source of inspiration,\n  >  e.g. Ship AIs may recite it to dying [Low Berth](https://wiki.travellerrpg.com/Low_Berth_Rack "@new-tab") travellers.\n- [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land) provides a source of inspiration,\n  > e.g. Earth is assumed lost after a Karmic Loop was created, letting in the Watchers and other manifestations from Buddhist hells.\n\nTraveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.\nIt permits faster than light travel bounded by 6 parsecs per week.\nLearn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).\nIt directly motivated Robert Pearce\'s Starship Geomorphs, and provides considerable depth.\n\n\x3c!-- <div style="font-size:smaller; padding-bottom: 6px"> --\x3e\n<div class="small-print">\n\n_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright \xa9 1977 \u2013 2021 Far Future Enterprises._\n\n</div>\n\nWe\'ll leverage two additional sources of inspiration i.e. _Liberation Through Hearing in the Intermediate State_ (Bardo Thodol) and a famous Science Fiction story from 1912 (The Night Land).'},28834:function(e,n){"use strict";n.Z="## Finishing\n\nOver time we'll clarify the above constraints, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\nSpelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game) for finishing a game.\nWe'll address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\nRogue Markup will be easy to extend.\nWe'll achieve this via compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere's hoping my chain of unfinished projects is coming to a close!"},6968:function(e,n){"use strict";n.Z='## Geomorphs\n\n### Filesystem structure\n\nmedia\n- Starship Geomorphs 2.0.pdf (Original source)\n- Starship Symbols.pdf (Original source)\n- Geomorphs.zip (Transparent PNGs obtained from Starship Geomorphs 2.0)\n- SymbolsHighRes.zip (Transparent PNGs obtained from Starship Symbols)\n\nmedia/Geomorph\n- PNGs of lower quality (relatively).\n- Extracted from "Starship Geomorphs 2.0.pdf" by ... \n\nmedia/Symbols\n- PNGs of higher quality.\n- Extracted from "Starship Symbols.pdf" by ... \n\nmedia/scripts\n- ts-node scripts launched via npm scripts\n- Directories generated by scripts\n- media/geomorph-edge (Edge Geomorphs)\n- media/symbol-bridge\n- media/symbol-dock-small-craft\n- media/symbol-staterooms\n- media/symbol-lounge\n- media/symbol-root\n\npublic/png\n- PNGs from media/symbol-* with labels removed\n\npublic/svg\n- Enriched symbols\n- Geomorph hulls\n\n<div\n  class="tabs"\n  name="geomorph-101"\n  enabled="false"\n  height="400"\n  tabs="[\n    { key: \'component\', filepath: \'example/GeomorphDemo\' },\n  ]"\n></div>\n'},38701:function(e,n){"use strict";n.Z='## Objective\n\nWe\'ll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).\n\n_Why?_\n\n> Because [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.\n> An environment is needed to make it meaningful, fixed narratives/missions are not.\n\nWe\'ll focus on combining navigation-based behaviours in a flexible manner.\nGame AI should be compositional, not forced into a narrative straight-jacket.\nAs for the environment, it will be driven by thousands of Traveller-based assets.\n\n<div\n  class="tabs"\n  name="geomorph-301-debug"\n  height="340"\n  tabs="[{ key: \'component\', filepath: \'example/Gm301Debug\' }]"\n></div>\n\nAbove we\'ve recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),\nusing 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nObstacles you can see over (e.g. chairs and beds) are shaded grey, whereas darker grey and black indicates walls and obstacles which cannot be seen over. Together with the white doors, they induce the white navigable polygon shown above.\n\n> Check out this [larger version](/pics/g-301--bridge.debug.x2.png "@new-tab").\n\n<aside>\n\nA _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.\nThey were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).\nA 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).\nThe latter 2000+ symbols will form the underlying basis of _Rogue Markup_.\n\n</aside>\n\nWe end with two basic demos:\nyou can pan, zoom, move the lights, and view the underlying polygons in 3D.\nThere are respective CodeSandboxes i.e. [light](https://codesandbox.io/s/rogue-markup-light-demo-k66zi?file=/src/example/Light.jsx "@new-tab") and [height](https://codesandbox.io/s/rogue-markup-3d-demo-forked-gyher?file=/src/index.js "@new-tab").\n\n<div\n  class="tabs"\n  name="light-demo"\n  height="340"\n  tabs="[\n    { key: \'component\', filepath: \'example/Light#301\' },\n    { key: \'component\', filepath: \'example/Css3d#301\' },\n  ]"\n></div>\n'},82715:function(e,n){"use strict";n.Z='## Tech (ai)\n\nWe\'ve described our objective, constrained our approach and listed the technologies we\'ll use.\nWe now turn from [JS components](2#tech1--react-function-components "@anchor") to Game AI.\n\n### Overview\n\n_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.\nThe [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").\nThese behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.\n\nBut how do video games implement these behaviours?\nWell, there are three standard systems:\n\n> **Navigation**: _planning e.g. route from A to B._\n>\n> **Animation**: _realism (e.g. limbs) and visual cues._\n>\n> **Physics**: collision detection, force-driven rigid bodies, raycasting.\n\nNavigation is of central importance to us and will be discussed shortly.\nAs for animation, we\'re definitely not going to obsess over realism.\nNevertheless we\'ll need visual cues to indicate NPC actions,\nand a _sense of flow_ via interdependent concurrent animations.\nAs for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won\'t be using one. In fact:\n\n- Collision detection will be handled at a higher level (navigation).\n- Force-based motion will be replaced by the Web Animations API.\n\nThe rest of this article explains our approach to Game AI and provides detail concerning Navigation and Raycasting.\n\n### Navigation (Static)\n\nTo move an NPC from A to B, we need a respective path.\nThis might be a straight line e.g. when an item is directly within grasp.\nBut usually objects must be avoided: static ones like walls, dynamic ones like other NPCs.\n\nIf there are no dynamic objects, a canonical approach exists.\nThe navigable area is represented by polygons (possibly with holes), where A and B lie in their interior. These polygons can be triangulated, inducing an undirected graph:\n\n> its nodes are _the triangles of the triangulation_; two nodes are connected iff _their respective triangles share an edge._\n\nHover below to highlight the triangles.\nCollectively they induce the red undirected graph.\n\n<div\n  class="tabs"\n  name="nav-graph-demo"\n  height="300"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/NavGraph#301\' },\n     { key: \'component\', filepath: \'example/NavGraph#302\' },\n   ]"\n></div>\n\n\nTechnically an undirected graph is just a symmetric binary relation.\nWe have made it concrete by depicting each node as the centroid of its respective triangle.\nThis provides a weight for each edge i.e. the distance between the centroids.\nThen the length of a path through the undirected graph may be defined as the sum of its edge\'s weights.\n\n<aside>\n\nSearching for paths through the embedded undirected graph is much easier than searching the navigable polygons.\nBut for realism, NPCs won\'t actually follow these embedded paths, but an induced path instead (see below).\n\n</aside>\n\n<aside>\n\nThe length of each path in the undirected graph should approximate the respective _real_ shortest path length.\nZig-zags between centroids can make a relatively short path _long_. This is often mitigated by pre-processing the navigable polygons, ensuring small triangles.\n\n</aside>\n\nSo, how to find a path from A to B?\n\n> Given A and B we have two triangles (maybe equal), so two nodes, hence may apply [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) using our chosen edge weights (distance between centroids).\n>\n> This quickly provides a solution i.e. a path.\n> However it is insufficient because realistic NPCs would not follow centroid to centroid paths.\n> So, one applies the [string-pulling algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html), pulling the zig-zag path tight along the navigable polygons\' extremal points.\n\nDrag the nodes below to see string-pulling in action.\n\n<div\n  class="tabs"\n  name="nav-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/NavStringPull\' },\n   ]"\n></div>\n\n\x3c!-- \nImportantly, we are not avoiding obstacles as we encounter them, in the sense of [robotics]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1)).\nWe know exactly where each NPC is going because (a) we previously set them in motion, (b) we do not rely on unpredictable force-based simulations. Having complete information does not make the problem any less important: Turing\'s [original paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence, not solving real-world sensory robotics. --\x3e\n\n### Navigation (Dynamic)\n\n\x3c!-- __TODO__ mention other approaches; consider case of two agents, which stop and start in some manner --\x3e\n\nNavigation around dynamic objects is harder.\nWhat was once a collision-free path may no longer be.\nTwo bridge officers could be swapping shifts,\nor perhaps the player needs to rush through a moving crowd.\n\nOne common approach is to combine static navigation (previous section) with [steering behaviours](https://www.researchgate.net/publication/2495826_Steering_Behaviors_For_Autonomous_Characters).\nThey are usually implemented via a physics engine.\nAn NPC will be driven by its own force, plus other forces induced by the position and velocity of others.\n\nFor example, **obstacle avoidance** works by driving close characters apart.\nA suitable force is applied along their relative position vector.\nUnsurprisingly, summing a number of obstacle avoidance forces can produce unrealistic behaviour.\n\n\n__TODO__ describe DetourCrowd approach\n\nhttps://docs.unrealengine.com/4.27/en-US/PythonAPI/class/DetourCrowdAIController.html?highlight=detourcrowdaicontroller\n\n\n__TODO__ \n\n### Raycasting\n\n__TODO__ illustrate line-seg vs line-seg intersection with initial space partitioning\n\n\n<div\n  class="tabs"\n  name="nav-doors-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/DoorsDemo#101\' },\n     { key: \'component\', filepath: \'example/DoorsDemo#301\' },\n   ]"\n></div>\n'},48834:function(e,n){"use strict";n.Z='## Tech (dev)\n\n### Static Analysis\n\n- Typescript via JSDoc, referring to CodeSandbox.\n\n### Runtime Analysis\n\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n\n<br>\n<br>\n\n\x3c!-- <div style="min-height: 500px"></div> --\x3e'}},function(e){e.O(0,[774,351,45,106,994,888,179],(function(){return n=2304,e(e.s=n);var n}));var n=e.O();_N_E=n}]);