## Objective

We'll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).

_Why?_

> Because [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.
> An environment is needed to make it meaningful, fixed narratives/missions are not.

We'll focus on combining navigation-based behaviours in a flexible manner.
Game AI should be compositional, not forced into a narrative straight-jacket.
As for the environment, it will be driven by thousands of Traveller-based assets.

<div
  class="tabs"
  name="geomorph-301-debug"
  height="340"
  tabs="[{ key: 'component', filepath: 'example/Gm301Debug' }]"
></div>

Above we've recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),
using 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
Green indicates obstacles you can see over, whereas red indicates obstacles which are essentially walls. Together with the white doors and black walls (including the hull), they induce a navigable polygon shown in blue.

> A larger version is [available](/pics/g-301--bridge.debug.x2.png "@new-tab").

<aside>

A _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.
They were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).
A 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).
The latter 2000+ symbols will form the underlying basis of _Rogue Markup_.

</aside>

We finish with two basic graphical demos.
You can pan and zoom, drag the light around, and view walls/doors/obstacles in 3D in the second tab.

__TODO__ improve demos e.g. shade darkness.

<div
  class="tabs"
  name="light-demo"
  height="340"
  tabs="[
    { key: 'component', filepath: 'example/Light#301' },
    { key: 'component', filepath: 'example/Css3d#301' },
  ]"
></div>
