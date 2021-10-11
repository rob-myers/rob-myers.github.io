## Technology (ai)

So far we've described our objective, constrained our approach, and listed the technologies we'll use.
Having discussed [JavaScript components](/#tech-1--react-and-preact),
we now turn to Game AI.

### Overview

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
So how do video games implement these behaviours?

There are three standard systems:

> **Navigation**: _high-level planning e.g. route from A to B._
>
> **Animation**: _realism (e.g. limb movement) and visual cues._
>
> **Physics**: collision detection, force-driven rigid bodies, raycasting.

Navigation is of central importance to our approach and will be discussed shortly.
Concerning animation, we're not going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [already mentioned](1#constraints--game-mechanics) we won't be using one.
We'll rely on the Web Animations API instead, and our own raycasting algorithms.

### Navigation


<!-- Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. -->

<div
  class="tabs"
  id="tabs-nav-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'nav/NavDemo' },
   ]"
></div>

### Raycasting

...