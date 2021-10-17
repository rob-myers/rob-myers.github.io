## Tech (ai)

So far we've described our objective, constrained our approach, and listed the technologies we'll use.
Having discussed [JavaScript components](2#tech1--react-and-preact "@anchor"),
we turn to Game AI.

### Overview

_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.
So how do video games implement these behaviours?

There are three standard systems:

> **Navigation**: _planning e.g. route from A to B._
>
> **Animation**: _realism (e.g. limb movement) and visual cues._
>
> **Physics**: collision detection, force-driven rigid bodies, raycasting.

Navigation is of central importance and will be discussed shortly.
Concerning animation, we're definitely not going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [already mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. Instead:
- Collision detection will be handled at a higher level (navigation).
- The Web Animations API will replace force-driven movement.
- We'll write our own raycaster e.g. for line-of-sight detection.

It is worth discussing Navigation and Raycasting in more detail.

### Navigation


<!-- __TODO__
- Rodney Brooks layers.
- Navigation based Game AI.
- Corner-wrapped Pathfinding only provides part of the 
- Geomorph 101
-->

<!-- Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. -->

<div
  class="tabs"
  name="nav-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'nav/NavDemo' },
   ]"
></div>

### Raycasting

...