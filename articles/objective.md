## Objective

We'll create a _Game AI focused_ roguelike, set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).

_Why?_

Because [NPC](https://tvtropes.org/pmwiki/pmwiki.php/Main/NonPlayerCharacter) behaviour is more interesting than any particular game.
An environment is needed to make it meaningful, fixed narratives/missions are not.

We'll focus on combining navigation-based behaviours in a flexible manner.
Game AI should be compositional, not forced into a narrative straight-jacket.
As for the environment, it will be driven by thousands of Traveller-based assets.

<div
  class="tabs"
  store-key="geomorph-301-debug"
  height="340"
  tabs="[{ key: 'component', filepath: 'images/Gm301Debug' }]"
></div>

Above we've recreated Geomorph 301 (a.k.a. _Bridge_) from [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html),
using 8 assets from [Starship Symbols](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
A larger version is [available](/pics/g-301--bridge.debug.x2.png "@new-tab").
Roughly speaking, a "Starship Geomorph" is a rectangular slice of a starship designed to be cut out and glued to others.
They were created by Robert Pearce, and distributed as PDFs on his [blog](http://travellerrpgblog.blogspot.com/).
Their 2nd version was released in 2020, and soon afterwards Eric B. Smith transformed them into [transparent PNGs](http://gurpsland.no-ip.org/geomorphs/).
The latter 2000+ symbols will form the underlying basis of _Rogue Markup_.
