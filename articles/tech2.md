## Tech (ai)

We've described our objective, constrained our approach, and listed the technologies we'll use.
We now turn from [JS components](2#tech1 "@anchor"), to Game AI.

### Overview

_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.
But how do video games implement these behaviours?

Well, there are three standard systems:

> **Navigation**: _planning e.g. route from A to B._
>
> **Animation**: _realism (e.g. limbs) and visual cues._
>
> **Physics**: collision detection, force-driven rigid bodies, raycasting.

Navigation is of central importance to our approach and will be discussed shortly.
Concerning animation, we're definitely _not_ going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. In particular:
- Collision detection will be handled at a higher level i.e. as part of navigation.
- Force-driven movement will be replaced by the Web Animations API.

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
     { key: 'component', filepath: 'nav/DoorsDemo' },
     { key: 'component', filepath: 'nav/NavDemo' },
   ]"
></div>

### Raycasting

...