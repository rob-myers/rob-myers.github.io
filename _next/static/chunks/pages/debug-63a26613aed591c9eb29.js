(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3094],{41208:function(e,n,a){"use strict";a.r(n),a.d(n,{default:function(){return g}});var t=a(86576),i=a(43057),s=a(68292),o=a(38701),r=a(38523),l=a(28834),c=a(82715),h=a(48834),d=a(6968),p=a(8311),m={objective:o.Z,constraints:r.Z,finishing:l.Z,technology:r.Z,tech1:c.Z,tech2:c.Z,tech3:h.Z,geomorphs:d.Z};function g(){return(0,p.tZ)(i.Z,{children:(0,p.tZ)(s.Z,{keys:(0,t.XP)(m),markdown:m})})}},2304:function(e,n,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/debug",function(){return a(41208)}])},38523:function(e,n){"use strict";n.Z='## Constraints\n\nThis project needs a backbone.\nWe\'ve chosen the underlying technology, low-level game mechanics, and where events take place.\n\n### Technology\n\nLet us list our chosen tools.\n\n- Use standard web dev techniques (e.g. not [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)).\n- Use [NextJS](https://nextjs.org/) as our development environment.\n- Use [CodeSandbox](https://codesandbox.io) to share editable code.\n- Use [Boxy SVG](https://boxy-svg.com/) to edit assets.\n- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.\n  > In particular, [Preact](https://www.npmjs.com/package/preact) (a [React](https://reactjs.org/) alternative) and [Goober](https://www.npmjs.com/package/goober).\n\nWe\'ll also support both mobile and desktop devices.\n\n\x3c!-- NOTE italics inside link currently unsupported --\x3e\n\n_The Last Redoubt_ refers to _Markup_, as in HyperText _Markup_ Language (HTML).\nWe\'ll use standard web development technologies e.g. CSS, SVGs, PNGs and the Web Animations API.\n\n<aside>\n\nAlthough WebGL permits far richer 3D graphics than CSS,\nit leads away from the declarative nature of Markup.\nSticking to core web technologies makes our approach relevant to a far larger audience.\nWe also want to avoid obsessing over graphics, seeking superior Game AI instead.\n\n</aside>\n\nIf you\'re unfamiliar with CodeSandbox (or similar sites), check out  [this example](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").\nIf you peruse the files, you\'ll find e.g. the rectangle class _Rect_ and a Geomorph PNG.\nOur CodeSandboxes use React, whereas this site uses _Preact_.\nMore on that later.\n\n### Game mechanics\n\nNext, gameplay related constraints.\n\n- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.\n  > We saw [an example](/pics/g-301--bridge.debug.x2.png "@new-tab") previously; \n  > here\'s [another](/pics/g-302--xboat-repair-bay.debug.png  "@new-tab").\n- Use a realtime birdseye camera.\n  > Basically a pannable and zoomable SVG.\n- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).\n  > This API provides access to the technology underlying CSS animations.\n- Use navigation & raycasting algorithms.\n  > Involves a [navmesh](https://en.wikipedia.org/wiki/Navigation_mesh#:~:text=A%20navigation%20mesh%2C%20or%20navmesh,video%20game%20AI%20in%202000.) and computing ray/geometry collisions.\n- Do not use a Physics engine.\n- Use an in-browser terminal.\n\nWe\'ll develop complex Game AI with the aid of a terminal.\nTry entering or copy-pasting the commands below. Mobile users may find copy-pasting easier.\n\n  | Category | Examples  |\n  | ------- | ---------- |\n  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n  | [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "@new-tab") | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |\n\n  <div\n    class="tabs"\n    name="terminal-demo"\n    height="300"\n    tabs="[\n      { key: \'terminal\', filepath: \'test\' },\n      { key: \'terminal\', filepath: \'other\' },\n    ]"\n  ></div>\n\nAs usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process" e.g. try terminating <span class="cmd">sleep 5; echo rise and shine</span>.\nPipelines and background processes are also supported.\nWe\'ll use terminals to monitor the current state of our Game AI, issue direct commands, and develop long-running behaviour.\n\n### Setting\n\nThen it only remains to constrain the setting.\n\n- Events take place in the [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3), onboard star ships, space ships and space stations.\n- [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol) provides a source of inspiration,\n  >  e.g. Ship AIs may recite it to dying [Low Berth](https://wiki.travellerrpg.com/Low_Berth_Rack "@new-tab") travellers.\n- [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land) provides a source of inspiration,\n  > e.g. Earth is generally assumed to be lost after a Karmic Loop was created, letting in the Watchers and other manifestations from Buddhist hells.\n\nTraveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.\nIt permits faster than light travel bounded by 6 parsecs per week (but usually more like 2 parsecs per week).\nLearn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).\nIt directly motivated Robert Pearce\'s Starship Geomorphs, and provides considerable depth.\n\n<aside>\n\n_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright \xa9 1977 \u2013 2021 Far Future Enterprises._\n\n</aside>\n\nWe\'ll leverage two additional sources of inspiration i.e. _Liberation Through Hearing in the Intermediate State_ (Bardo Thodol) and a famous Science Fiction story from 1912 (The Night Land).'},28834:function(e,n){"use strict";n.Z="## Finishing\n\nOver time we'll clarify the above constraints, but first we emphasise:\n> _creating a video game is really fucking hard_.\n\nSpelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game) for finishing a game.\nWe'll address them.\n\n### 1. Fun to develop\n\n_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.\nIt is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.\nI am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.\n\n### 2. The Result\n\n_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.\nProcedurally generated missions will involve going from A to B and doing C (ever was it so).\nMonotony will be overcome via encountered NPC behaviours and e.g. ship building.\nFunctionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.\nGraphically, see Starship Geomorphs 2.0.\n\n_The Last Redoubt_ will be easily extendable.\nWe'll provide compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.\n\n### 3. Experience\n\n_Games I\u2019m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. \nI have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,\nso won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.\nI have also created similar game mechanics _many_ times over the years.\nHere's hoping my chain of unfinished projects is coming to a close!"},6968:function(e,n){"use strict";n.Z='## Geomorphs\n\n### Filesystem structure\n\nmedia\n- Starship Geomorphs 2.0.pdf (Original source)\n- Starship Symbols.pdf (Original source)\n- Geomorphs.zip (Transparent PNGs obtained from Starship Geomorphs 2.0)\n- SymbolsHighRes.zip (Transparent PNGs obtained from Starship Symbols)\n\nmedia/Geomorph\n- PNGs of lower quality (relatively).\n- Extracted from "Starship Geomorphs 2.0.pdf" by ... \n\nmedia/Symbols\n- PNGs of higher quality.\n- Extracted from "Starship Symbols.pdf" by ... \n\nmedia/scripts\n- ts-node scripts launched via npm scripts\n- Directories generated by scripts\n- media/geomorph-edge (Edge Geomorphs)\n- media/symbol-bridge\n- media/symbol-dock-small-craft\n- media/symbol-staterooms\n- media/symbol-lounge\n- media/symbol-root\n\npublic/png\n- PNGs from media/symbol-* with labels removed\n\npublic/svg\n- Enriched symbols\n- Geomorph hulls\n\n<div\n  class="tabs"\n  name="geomorph-101"\n  enabled="false"\n  height="400"\n  tabs="[\n    { key: \'component\', filepath: \'example/GeomorphEdit\' },\n  ]"\n></div>\n'},38701:function(e,n){"use strict";n.Z='## Objective\n\nWe are going to create a **video game**.\n_Unusually_, we will\n(a) describe the process in detail,\n(b) use standard web development techniques,\n(c) develop rich Game AI.\n\nWhat kind of game?\n> A top-down adventure.\n\nWhere does it take place?\n> [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land "@new-tab") - a futuristic Earth whose Sun has died.\n> Humanity resides in a gigantic pyramid called _The Last Redoubt_.\n\n<div\n  class="tabs"\n  name="redoubt-sketch"\n  height="[400, 580]"\n  enabled="true"\n  tabs="[\n    { key: \'component\', filepath: \'example/Images#redoubt-sketches\' },\n  ]"\n></div>\n\nWhat\'s this about **web development**?\n> The game will be made using everyday web development techniques.\n> Then we won\'t use WebGL, physics, walk-cycles etc.\n\nYou mentioned **Game AI**?\n> The world is awash with beautifully-crafted games which are rather shallow.\n> Failing the former we can strive to overcome the latter i.e. produce richer Game AI than is commonly experienced.\n> We\'ll avoid _clunky behaviour editors_ and _rigid task-based programming patterns_.\n> Instead we\'ll build Game AI **interactively** using a browser-based terminal.\n\n__TODO__ a meaningful example \ud83d\udea7\n\n\x3c!-- ~~~\nmyFunc() {\n  call \'() => Array.from(Math.PI.toString())\' |\n  split |\n  map \'x => `Digit: ${x}`\'\n}\n~~~ --\x3e\n\n<div\n  class="tabs"\n  name="nav-tty-1"\n  height="500"\n  show="2"\n  tabs="[\n    { key: \'terminal\', filepath: \'nav-demo-1\', weight: 30 },\n    { key: \'component\', filepath: \'example/NavCollide\', weight: 70 },\n  ]"\n></div>\n\n| Category | Examples |\n| -------- | -------- |\n| Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |\n| [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "@new-tab") | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |\n| Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr \'2**10\'</span> |\n| Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span\n\n\nLet\'s spend some time providing the backdrop\n\n__FROM HERE__ would like\n- _TODO_ __ideas about characters and storylines__ e.g. 64 floors, floor layout; protagonist; other characters; natural mental states are unskillful; watchers represent fetters e.g. worry, ill-will etc.\n- _TODO_ __clearer ideas about gameplay__ e.g. exploration; procedural generation; time-limited navpath motion; mental weaponry related to mental training; travel within the Night Land; ultimate goal e.g. deathless\n\nWe\'ll use [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh) to simulate starship inhabitants,\nfollowing the rules of [Traveller](https://en.wikipedia.org/wiki/Traveller_%28role-playing_game%29).\nTo makes things less abstract, here\'s a Traveller-based asset called a _geomorph_.\n\n\n<div\n  class="tabs"\n  name="geomorph-301-debug"\n  height="400"\n  tabs="[{ key: \'component\', filepath: \'example/Images#geomorph-301\' }]"\n></div>\n\nWe\'ve recreated **Geomorph 301** (a.k.a. _Bridge_) from Robert Pearce\'s [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),\nusing 8 of his [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).\nObstacles you can see over are shaded grey e.g. chairs and beds.\nWalls and obstacles which cannot be seen over are darker grey and black. The underlying polygons of these obstacles, together with the white rectangular doors, induce the _white triangulated navigable polygon_ shown above.\n\n> Check out this [larger version](/pics/g-301--bridge.debug.x2.png "@new-tab").\n\n<aside>\n\nA _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.\nThey were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).\nA 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).\nThe latter 2000+ symbols will form the underlying basis of _The Last Redoubt_.\n\n</aside>\n\n__TODO__ remove Visibility and Css3d demo, replacing with NPC demo combined with terminal in some way.\n\n\x3c!-- We end with two basic demos.\nYou can pan/zoom, move the eyes, and view the obstacle polygons in 3D.\nThere are respective CodeSandboxes i.e. [visibility](https://codesandbox.io/s/rogue-markup-visibility-demo-k66zi?file=/src/example/Visibility.jsx "@new-tab") and [height](https://codesandbox.io/s/rogue-markup-3d-demo-forked-gyher?file=/src/example/Css3d.jsx "@new-tab"). --\x3e\n\n\n<div\n  class="tabs"\n  name="light-demo"\n  height="340"\n  tabs="[\n    // { key: \'component\', filepath: \'example/Visibility#301\' },\n    { key: \'component\', filepath: \'example/Css3d#301\' },\n  ]"\n></div>\n'},82715:function(e,n){"use strict";n.Z='## Tech (ai)\n\n\x3c!-- We\'ve described our objective, constrained our approach and listed the technologies we\'ll use.\nWe now turn to Game AI. --\x3e\n\n### Overview\n\n_The Last Redoubt_ will present a birdseye viewpoint of the interior of starships.\nThe [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").\nThese behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.\n\nBut how do video games implement these behaviours?\nWell, there are three standard systems:\n\n- **Navigation**: _planning e.g. route from A to B._\n- **Animation**: _realism (e.g. limbs) and visual cues._\n- **Physics**: _collision detection, force-driven rigid bodies, raycasting_.\n\nNavigation is of central importance to us, and will be discussed shortly.\nAs for animation, we won\'t obsess over realism,\nbut we\'ll need visual cues to indicate NPC actions.\nWe also want a _sense of flow_, achieved via interdependent concurrent animations.\nAs for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won\'t be using one. In fact:\n\n- Collision detection will be handled at the level of navigation.\n- Force-based motion will be simulated via the Web Animations API.\n\nIn the rest of this article we\'ll discuss Navigation and Raycasting in detail.\n\n### Static Navigation\n\nTo move an NPC from **A** to **B**, we need a respective path.\nThis might simply be a straight line e.g. when an item is directly within grasp.\nHowever, usually there are objects to be avoided: static ones like walls, dynamic ones like NPCs.\n\nSans dynamic objects, a canonical approach exists.\n- The navigable area is represented by _polygons_ ([possibly with holes](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6)),\n  with **A** and **B** inside them.\n- These polygons can be _triangulated_ i.e. partitioned into triangles with disjoint interiors.\n  Thin or large triangles can be avoided via _[Steiner points](https://en.wikipedia.org/wiki/Steiner_point_(computational_geometry))_.\n- The triangulation induces an undirected graph.\n  > A **Navgraph** is an undirected graph whose \n  > nodes are _the triangles of the provided triangulation_.\n  > Two nodes are connected if and only if _their respective triangles share exactly one edge._\n\nFor example, the grey triangles below collectively induce the red navgraph.\n\n<div\n  class="tabs"\n  name="nav-graph-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/NavGraph#301\' },\n     { key: \'component\', filepath: \'example/NavGraph#302\' },\n   ]"\n></div>\n\n__TODO__ Mention triangle-wasm CodeSandbox\n\n\nTechnically, an undirected graph is just a _symmetric binary relation_.\nWe have made it concrete by depicting each node as the centroid of its respective triangle.\nThis is a standard convention, although triangles have more than one [notion of center](https://en.wikipedia.org/wiki/Triangle_center).\nIt provides a weight for each edge i.e. the distance between the centroids.\nThen the length of a path through the undirected graph may be defined as the sum of its edge\'s weights.\n\n<aside title="why-we-abstract">\n\nSearching for paths through the embedded undirected graph is much easier than searching the navigable polygons.\nThere are far fewer possibilities.\nHowever, NPCs won\'t actually follow these embedded paths (for realism),\nbut an induced path instead (see below).\n\n</aside>\n\n<aside>\n\nThe length of each path in the undirected graph should approximate the respective _real_ shortest path length.\nZig-zags between centroids can make a relatively short path _long_. This is often mitigated by pre-processing the navigable polygons, ensuring small triangles.\n\n</aside>\n\nSo, how to find a path from A to B?\n\n> Given A and B we have two triangles (maybe equal), so two nodes, hence may apply [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) using our chosen edge weights (distance between centroids).\n>\n> This quickly provides a solution i.e. a path.\n> However it is insufficient because realistic NPCs would not follow centroid to centroid paths.\n> One can solve this by applying the [string-pulling algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html).\n> It pulls the zig-zag path tight along the navigable polygons\' extremal points.\n\nDrag the nodes below to see _string-pulling_ in action.\n\n<div\n  class="tabs"\n  name="nav-string-pull-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/NavStringPull\' },\n   ]"\n></div>\n\n\x3c!-- \nImportantly, we are not avoiding obstacles as we encounter them, in the sense of [robotics]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1)).\nWe know exactly where each NPC is going because (a) we previously set them in motion, (b) we do not rely on unpredictable force-based simulations. Having complete information does not make the problem any less important: Turing\'s [original paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence, not solving real-world sensory robotics. --\x3e\n\n### Dynamic Navigation\n\n\x3c!-- __TODO__ mention other approaches; consider case of two agents, which stop and start in some manner --\x3e\n\nNavigation around dynamic objects is harder.\nWhat was once a collision-free path may no longer be.\nTwo officers on the bridge could be swapping shifts,\nor perhaps the player needs to rush through a moving crowd.\n\nOne common approach is to combine static navigation (previous section) with [steering behaviours](https://www.researchgate.net/publication/2495826_Steering_Behaviors_For_Autonomous_Characters).\nThey are usually implemented via a physics engine.\nAn NPC will be driven by its own force, plus other forces induced by the position and velocity of nearby NPCs.\n\n<aside>\n\nFor example, **obstacle avoidance** works by driving close characters apart.\nA suitable force is applied orthogonal to the NPC\'s direction of travel.\n\n</aside>\n\nHowever, one cannot expect the vector sum of forces to capture complex interactions between multiple characters.\nReynolds introduced Steering Behaviours as part of a pipeline:\n> _action selection_ \u2192 _steering_ \u2192 _animation_.\n\nIn practice, one must rely _heavily_ on action selection to avoid unrealistic behaviour such as oscillation and deadlock.\n\nThere is another well-known approach i.e. [Detour](https://github.com/recastnavigation/recastnavigation#detour) and in particular _DetourCrowd_, providing a sophisticated solution to multiple character navigation.\nIt has been [ported to JS](https://github.com/BabylonJS/Extensions/tree/master/recastjs) in BabylonJS,\nand also [integrated](https://docs.unrealengine.com/4.27/en-US/API/Runtime/Navmesh/DetourCrowd/dtCrowd/) into the Unreal Engine.\n\nIn Detour, a collection of NPCs is conceptualised as a _Crowd_.\nOne requests the Crowd to move individual NPCs to particular targets.\nAn updater function must be executed each frame.\nFor each fixed NPC, its nearby neighbours are modelled as temporary geometry, influencing the NPC\'s velocity.\nWe\'ll have more to say about this impressive open source library.\n\n### Navigation: Our Approach\n\nSo how will we approach this difficult problem?\nWell, we won\'t solve it generally.\nThat is,\n> _we don\'t seek a black box, magically producing collision-free concurrent navigation_.\n\nWe\'re happy to take things slow.\nLet\'s start with two colliding NPCs.\nWe\'ll detect their imminent collision, and then stop them both.\n\n<div\n  class="tabs"\n  name="nav-collide-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/NavCollide\' },\n   ]"\n></div>\n\n__TODO__\n- DraggablePath component \u2705\n- Circle moves along navpath \u2705\n- Componentise and improve\n- Detect future collision for 2 paths\n- Combine with terminal?\n\n### Raycasting\n\n__TODO__\n- illustrate line-seg vs line-seg intersection with initial space partitioning\n- navigation through auto-opening doors\n- combine with terminal?\n\n<div\n  class="tabs"\n  name="nav-doors-demo"\n  height="400"\n  enabled="false"\n  tabs="[\n     { key: \'component\', filepath: \'example/DoorsDemo#101\' },\n     { key: \'component\', filepath: \'example/DoorsDemo#301\' },\n   ]"\n></div>\n'},48834:function(e,n){"use strict";n.Z='## Tech (dev)\n\n### Static Analysis\n\n- Typescript via JSDoc, referring to CodeSandbox.\n\n### Runtime Analysis\n\n- Terminal + Game AI\n\n### Comments\n\n- Display GitHub comments from Issue (build-time)\n- Can use anonymous credits to get recent\n\n<br>\n<br>\n\n\x3c!-- <div style="min-height: 500px"></div> --\x3e'}},function(e){e.O(0,[9774,9351,7045,6758,3033,3359,2888,179],(function(){return n=2304,e(e.s=n);var n}));var n=e.O();_N_E=n}]);