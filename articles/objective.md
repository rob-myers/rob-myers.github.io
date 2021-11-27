## Objective

We'll create a video game.
Yes, yet another game.
What's unusual is that we're going to describe the process in great detail.

Where will it take place?
> The [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).

What kind of game is it?
> A [Roguelike](https://en.wikipedia.org/wiki/Roguelike). Actually our focus will be on Game AI, as we shall explain. 

Why?

> Because [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.
> An environment is needed to make it meaningful, fixed narratives/missions are not.

We'll focus on [navmeshes](https://en.wikipedia.org/wiki/Navigation_mesh) and compositional Game AI, avoiding a narrative straight-jacket.
As for the environment, it will be driven by thousands of Traveller-based assets.

<div
  class="tabs"
  name="geomorph-301-debug"
  height="340"
  tabs="[{ key: 'component', filepath: 'example/Gm301Debug' }]"
></div>

Above we've recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),
using 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
Obstacles you can see over (e.g. chairs and beds) are shaded grey.
Darker grey and black indicates walls and obstacles which cannot be seen over. Together with the white doors, they induce the _white triangulated navigable polygon_ shown above.

> Check out this [larger version](/pics/g-301--bridge.debug.x2.png "@new-tab").

<aside>

A _Starship Geomorph_ is a rectangular partial floorplan of a starship, designed to be cut out and possibly glued to others.
They were created by Robert Pearce, and distributed as a PDF on his [blog](http://travellerrpgblog.blogspot.com/).
A 2nd version was released in 2020, along with another PDF containing many individual symbols e.g. offices, fuel tanks and bedrooms. Soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).
The latter 2000+ symbols will form the underlying basis of _Rogue Markup_.

</aside>

We end with two basic demos.
You can pan/zoom, move the eyes, and view the obstacle polygons in 3D.
There are respective CodeSandboxes i.e. [visibility](https://codesandbox.io/s/rogue-markup-visibility-demo-k66zi?file=/src/example/Visibility.jsx "@new-tab") and [height](https://codesandbox.io/s/rogue-markup-3d-demo-forked-gyher?file=/src/example/Css3d.jsx "@new-tab").


<div
  class="tabs"
  name="light-demo"
  height="340"
  tabs="[
    { key: 'component', filepath: 'example/Visibility#301' },
    { key: 'component', filepath: 'example/Css3d#301' },
  ]"
></div>
