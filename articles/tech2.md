## Tech (ai)

We've described our objective, constrained our approach and listed the technologies we'll use.
We now turn from [JS components](2#tech1--react-function-components "@anchor") to Game AI.

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

Navigation is of central importance to us and will be discussed shortly.
Concerning animation, we're definitely not going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. In fact:

- Collision detection will be handled at a higher level, as part of navigation.
- Force-driven movement will be replaced by the Web Animations API.

In the rest of this article we'll discuss Navigation and Raycasting in detail.

### Navigation

To move an NPC from A to B, we need some kind of path from, well, A to B.
Sometimes this is just a straight line e.g. when an item is directly within grasp.
But usually objects must be avoided e.g. walls and furniture (static), and other actors (dynamic).
This is not about _[avoiding encountered obstacles]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1))_ in the sense of robotics.
We know exactly where each NPC is going, having previously set them in motion.
This doesn't make the problem any less "important".
After all, Turing's original [paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence.

<div
  class="tabs"
  name="nav-doors-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'nav/DoorsDemo#101' },
     { key: 'component', filepath: 'nav/DoorsDemo#301' },
   ]"
></div>

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