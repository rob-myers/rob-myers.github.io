## Objective

We are going to create a **video game**.
_Unusually_, we will
(a) describe the process in detail,
(b) use standard web development techniques,
(c) develop rich Game AI.

What kind of game?
> A top-down adventure.

Where does it take place?
> [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land "@new-tab") - a futuristic Earth whose Sun has died.
> Humanity resides in a gigantic pyramid called _The Last Redoubt_.

<div
  class="tabs"
  name="redoubt-sketch"
  height="[400, 550]"
  enabled="true"
  tabs="[
    { key: 'component', filepath: 'example/Images#redoubt-sketches' },
  ]"
></div>

What's this about **web development**?
> This particular video game will be made using everyday web development techniques.
> In particular, we won't be using WebGL, physics engines, walk-cycles etc.

You mentioned **Game AI**?
> The world is awash with beautifully-crafted games which are ultimately shallow.
> Failing the former we can strive to overcome the latter i.e. produce richer Game AI than is commonly experienced.

> We'll avoid _clunky behaviour editors_ and _rigid task-based programming patterns_.
> Instead we'll build Game AI **interactively** using a browser-based terminal. Try copy-pasting the following script below:

__TODO__ a meaningful example 🚧

<!-- ~~~
myFunc() {
  call '() => Array.from(Math.PI.toString())' |
  split |
  map 'x => `Digit: ${x}`'
}
~~~ -->

<div
  class="tabs"
  name="nav-tty-1"
  height="500"
  show="2"
  tabs="[
    { key: 'terminal', filepath: 'nav-demo-1', weight: 30 },
    { key: 'component', filepath: 'example/NavCollide', weight: 70 },
  ]"
></div>

| Category | Examples |
| -------- | -------- |
| Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |
| [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "@new-tab") | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |
| Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr '2**10'</span> |
| Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span


Let's spend some time providing the backdrop

__FROM HERE__ would like
- _TODO_ __ideas about characters and storylines__ e.g. 64 floors, floor layout; protagonist; other characters; natural mental states are unskillful; watchers represent fetters e.g. worry, ill-will etc.
- _TODO_ __clearer ideas about gameplay__ e.g. exploration; procedural generation; time-limited navpath motion; mental weaponry related to mental training; travel within the Night Land; ultimate goal e.g. deathless

We'll use [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh) to simulate starship inhabitants,
following the rules of [Traveller](https://en.wikipedia.org/wiki/Traveller_%28role-playing_game%29).
To makes things less abstract, here's a Traveller-based asset called a _geomorph_.


<div
  class="tabs"
  name="geomorph-301-debug"
  height="400"
  tabs="[{ key: 'component', filepath: 'example/Images#geomorph-301' }]"
></div>

We've recreated **Geomorph 301** (a.k.a. _Bridge_) from Robert Pearce's [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),
using 8 of his [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
Obstacles you can see over are shaded grey e.g. chairs and beds.
Walls and obstacles which cannot be seen over are darker grey and black. The underlying polygons of these obstacles, together with the white rectangular doors, induce the _white triangulated navigable polygon_ shown above.

> Check out this [larger version](/pics/g-301--bridge.debug.x2.png "@new-tab").

<aside>

A _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.
They were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).
A 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).
The latter 2000+ symbols will form the underlying basis of _The Last Redoubt_.

</aside>

__TODO__ remove Visibility and Css3d demo, replacing with NPC demo combined with terminal in some way.

<!-- We end with two basic demos.
You can pan/zoom, move the eyes, and view the obstacle polygons in 3D.
There are respective CodeSandboxes i.e. [visibility](https://codesandbox.io/s/rogue-markup-visibility-demo-k66zi?file=/src/example/Visibility.jsx "@new-tab") and [height](https://codesandbox.io/s/rogue-markup-3d-demo-forked-gyher?file=/src/example/Css3d.jsx "@new-tab"). -->


<div
  class="tabs"
  name="light-demo"
  height="340"
  tabs="[
    // { key: 'component', filepath: 'example/Visibility#301' },
    { key: 'component', filepath: 'example/Css3d#301' },
  ]"
></div>
