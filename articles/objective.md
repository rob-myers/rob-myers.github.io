## Objective

We are going to create a **video game**.
That's right, yet another game. 
What's **unusual** is that
(a) we're going to describe the process in great detail,
(b) we're going to use standard web development techniques.

Where will it take place?
> The [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).

What kind of game is it?
> A topdown Starship Simulator with a Game AI focus.

Why Game AI?

> Because [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.
<!-- > An environment is needed to make behaviour meaningful, fixed narratives/missions are not. -->

We'll use [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh) to simulate starship inhabitants,
following the rules of [Traveller](https://en.wikipedia.org/wiki/Traveller_%28role-playing_game%29).
Here's a Traveller-based asset called a _geomorph_;
typically a starship is composed of many geomorphs.

<div
  class="tabs"
  name="geomorph-301-debug"
  height="340"
  tabs="[{ key: 'component', filepath: 'example/Gm301Debug' }]"
></div>

Above we've recreated **Geomorph 301** (a.k.a. _Bridge_) from Robert Pearce's [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),
using 8 of his [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
Obstacles you can see over are shaded grey e.g. chairs and beds.
Walls and obstacles which cannot be seen over are darker grey and black. The underlying polygons of these obstacles, together with the white rectangular doors, induce the _white triangulated navigable polygon_ shown above.

> Check out this [larger version](/pics/g-301--bridge.debug.x2.png "@new-tab").

<aside>

A _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.
They were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).
A 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).
The latter 2000+ symbols will form the underlying basis of _Starship Markup_.

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
