## Technology (ai)

Thus far we've described our objective, constrained our approach, and listed the technologies we'll use.
Having outlined our chosen notion of JavaScript component,
we turn to Game AI i.e. _navigation_ and _raycasting_.

### Navigation

<!-- __TODO__
- Rodney Brooks layers.
- Navigation based Game AI.
- Corner-wrapped Pathfinding only provides part of the 
- No physics engine
- Geomorph 101
-->

_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.
But how do video games simulate these behaviours?

Three systems are often used:

> **Navigation**: _high-level planning e.g. find a route from A to B._
>
> **Animation**: _realism (e.g. limb movement) and representation (e.g. indicate NPC actions)._
>
> **Physics**: collision detection & force-driven rigid bodies.

We've [chosen](/blog/1#article-constraints) not to use a Physics Engine.

<!-- Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. -->

<div
  class="tabs"
  store-key="nav-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'nav/NavDemo' },
   ]"
></div>

### Raycasting

...