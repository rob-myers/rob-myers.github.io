## Tech (ai)

We've described our objective, constrained our approach and listed the technologies we'll use.
We now turn from [JS components](2#tech1--react-function-components "@anchor") to Game AI.

### Overview

_Rogue Markup_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.

But how do video games implement these behaviours?
Well, there are three standard systems:

- **Navigation**: _planning e.g. route from A to B._
- **Animation**: _realism (e.g. limbs) and visual cues._
- **Physics**: collision detection, force-driven rigid bodies, raycasting.

Navigation is of central importance to us and will be discussed shortly.
As for animation, we're definitely not going to obsess over realism.
Nevertheless we'll need visual cues to indicate NPC actions,
and a _sense of flow_ via interdependent concurrent animations.
As for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. In fact:

- Collision detection will be handled at a higher level (navigation).
- Force-based motion will be replaced by the Web Animations API.

The rest of this article provides detail concerning Navigation and Raycasting.

### Static Navigation

To move an NPC from A to B, we need a respective path.
This might be a straight line e.g. when an item is directly within grasp.
But usually objects must be avoided: static ones like walls, dynamic ones like other NPCs.

If there are no dynamic objects, a canonical approach exists.
The navigable area is represented by polygons (possibly with holes), where A and B lie in their interior. These polygons can be triangulated, inducing an undirected graph:

> its nodes are _the triangles of the triangulation_; two nodes are connected iff _their respective triangles share an edge._

The triangles below collectively induce the red undirected graph.

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


Technically an undirected graph is just a symmetric binary relation.
We have made it concrete by depicting each node as the centroid of its respective triangle.
This provides a weight for each edge i.e. the distance between the centroids.
Then the length of a path through the undirected graph may be defined as the sum of its edge's weights.

<aside label="why-we-abstract">

Searching for paths through the embedded undirected graph is much easier than searching the navigable polygons.
However NPCs won't actually follow these embedded paths (for realism),
but an induced path instead (see below).

</aside>

<aside>

The length of each path in the undirected graph should approximate the respective _real_ shortest path length.
Zig-zags between centroids can make a relatively short path _long_. This is often mitigated by pre-processing the navigable polygons, ensuring small triangles.

</aside>

So, how to find a path from A to B?

> Given A and B we have two triangles (maybe equal), so two nodes, hence may apply [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) using our chosen edge weights (distance between centroids).
>
> This quickly provides a solution i.e. a path.
> However it is insufficient because realistic NPCs would not follow centroid to centroid paths.
> One can solve this by applying the [string-pulling algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html).
> It pulls the zig-zag path tight along the navigable polygons' extremal points.

Drag the nodes below to see _string-pulling_ in action.

<div
  class="tabs"
  name="nav-string-pull-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/NavStringPull' },
   ]"
></div>

<!-- 
Importantly, we are not avoiding obstacles as we encounter them, in the sense of [robotics]((https://en.wikibooks.org/wiki/Robotics/Navigation/Collision_Avoidance#cite_note-1)).
We know exactly where each NPC is going because (a) we previously set them in motion, (b) we do not rely on unpredictable force-based simulations. Having complete information does not make the problem any less important: Turing's [original paper](https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence "Computing Machinery and Intelligence") was about the _appearance_ of intelligence, not solving real-world sensory robotics. -->

### Dynamic Navigation

<!-- __TODO__ mention other approaches; consider case of two agents, which stop and start in some manner -->

Navigation around dynamic objects is harder.
What was once a collision-free path may no longer be.
Two officers on the bridge could be swapping shifts,
or perhaps the player needs to rush through a moving crowd.

One common approach is to combine static navigation (previous section) with [steering behaviours](https://www.researchgate.net/publication/2495826_Steering_Behaviors_For_Autonomous_Characters).
They are usually implemented via a physics engine.
An NPC will be driven by its own force, plus other forces induced by the position and velocity of other NPCs.

<aside>

For example, **obstacle avoidance** works by driving close characters apart.
A suitable force is applied orthogonal to the NPC's direction of travel.

</aside>

However, one cannot expect the vector sum of forces to capture complex interactions between multiple characters.
Reynolds introduced Steering Behaviours as part of a pipeline: _action selection_ → _steering_ → _animation_. In practice, one must rely heavily on action selection to avoid unrealistic behaviour such as oscillation and deadlock.

[Detour](https://github.com/recastnavigation/recastnavigation#detour) and particularly _DetourCrowd_ provide a more sophisticated approach to navigation.
It has been [ported to JS](https://github.com/BabylonJS/Extensions/tree/master/recastjs) as part of the BabylonJS project,
and also [integrated](https://docs.unrealengine.com/4.27/en-US/API/Runtime/Navmesh/DetourCrowd/dtCrowd/) into the Unreal Engine.
A collection of NPCs is understood as a _Crowd_.
One requests the Crowd to move NPCs to particular targets, and executes an updater function each frame.
For each fixed NPC, its nearby neighbours are modelled as temporary geometry, influencing the NPC's velocity.
We'll certainly have more to say about this interesting open source library.

### Our Approach

__TODO__ our approach does not use a physics engine. we will avoid trying to make a "full-proof general system". we are interested in easy to understand techniques, which can be composed together.

__TODO__
- DraggablePath component
- two intersecting navpaths
- circle moves along navpath
- can stop/start with terminal

<div
  class="tabs"
  name="nav-collide-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/NavCollide' },
   ]"
></div>

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
