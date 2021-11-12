## Tech (ai)

We've described our objective, constrained our approach and listed the technologies we'll use.
We now turn from [JS components](2#tech1--react-function-components "@anchor") to Game AI.

### Overview

_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.

But how do video games implement these behaviours?
Well, there are three standard systems:

> **Navigation**: _planning e.g. route from A to B._
>
> **Animation**: _realism (e.g. limbs) and visual cues._
>
> **Physics**: collision detection, force-driven rigid bodies, raycasting.

Navigation is of central importance to us and will be discussed shortly.
As for animation, we're definitely not going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. In fact:

- Collision detection will be handled at a higher level (navigation).
- Force-based motion will be replaced by the Web Animations API.

The rest of this article explains our approach to Game AI and provides detail concerning Navigation and Raycasting.

### Navigation (Static)

To move an NPC from A to B, we need a respective path.
This might be a straight line e.g. when an item is directly within grasp.
But usually objects must be avoided: static ones like walls, dynamic ones like other NPCs.

If there are no dynamic objects, a canonical approach exists.
The navigable area is represented by polygons (possibly with holes), where A and B lie in their interior. These polygons can be triangulated, inducing an undirected graph:

> its nodes are _the triangles of the triangulation_; two nodes are connected iff _their respective triangles share an edge._

Take a look at the black triangles with grey borders below.
Collectively they induce the red undirected graph.



<div
  class="tabs"
  name="nav-graph-demo"
  height="300"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/NavGraph#301' },
     { key: 'component', filepath: 'example/NavGraph#302' },
   ]"
></div>


So navigable space has been partitioned into triangles and collapsed to points (nodes). Node connectivity is determined by triangle adjacency. If edges are weighted by the distance between the respective triangle's _centroids_, a path length may be defined as the sum of its edge weights. This can be a bad approximation e.g. zig-zags between centroids can make a short path _long_. This is usually "solved" via a pre-processing step i.e. refine the original polygons and their triangulation.

So, how do we find a path from A to B?

> Given A and B we have two respective triangles (possibly indistinct), so two nodes, so may apply [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) using our chosen edge weights. The result is insufficient because realistic NPCs would not follow centroid-to-centroid paths.
> For this reason, one finally applies the [string-pulling algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html). That is, the zig-zag path  is pulled tight along the original navigable polygons' extremal points.


__TODO__ string-pulling demo i.e. can choose destination via click

<div
  class="tabs"
  name="nav-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/NavStringPull' },
   ]"
></div>

<!-- 
Importantly, we are not avoiding obstacles as we encounter them, in the sense of [robotics]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1)).
We know exactly where each NPC is going because (a) we previously set them in motion, (b) we do not rely on unpredictable force-based simulations. Having complete information does not make the problem any less important: Turing's [original paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence, not solving real-world sensory robotics. -->

### Navigation (Dynamic)

__TODO__ mention other approaches; consider case of two agents, which stop and start in some manner

### Raycasting

__TODO__ illustrate line-seg vs line-seg intersection with initial space partitioning


<div
  class="tabs"
  name="nav-doors-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/DoorsDemo#101' },
     { key: 'component', filepath: 'example/DoorsDemo#301' },
   ]"
></div>
