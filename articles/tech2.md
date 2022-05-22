## Tech (ai)

<!-- We've described our objective, constrained our approach and listed the technologies we'll use.
We now turn to Game AI. -->

### Overview

_The Last Redoubt_ will present a birdseye viewpoint of the interior of starships.
The [crew](https://wiki.travellerrpg.com/Crew "@new-tab") will have tasks, such as manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage "@new-tab").
These behaviours will be constrained by e.g. sleep patterns, the behaviour of others, and hardware failures.

But how do video games implement these behaviours?
Well, there are three standard systems:

- **Navigation**: _planning e.g. route from A to B._
- **Animation**: _realism (e.g. limbs) and visual cues._
- **Physics**: _collision detection, force-driven rigid bodies, raycasting_.

Navigation is of central importance to us, and will be discussed shortly.
As for animation, we won't obsess over realism,
but we'll need visual cues to indicate NPC actions.
We also want a _sense of flow_, achieved via interdependent concurrent animations.
As for a physics engine, we [mentioned](1#constraints--game-mechanics "@anchor") we won't be using one. In fact:

- Collision detection will be handled at the level of navigation.
- Force-based motion will be simulated via the Web Animations API.

In the rest of this article we'll discuss Navigation and Raycasting in detail.

### Static Navigation

To move an NPC from **A** to **B**, we need a respective path.
This might simply be a straight line e.g. when an item is directly within grasp.
However, usually there are objects to be avoided: static ones like walls, dynamic ones like NPCs.

Sans dynamic objects, a canonical approach exists.
- The navigable area is represented by _polygons_ ([possibly with holes](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6)),
  with **A** and **B** inside them.
- These polygons can be _triangulated_ i.e. partitioned into triangles with disjoint interiors.
  Thin or large triangles can be avoided via _[Steiner points](https://en.wikipedia.org/wiki/Steiner_point_(computational_geometry))_.
- The triangulation induces an undirected graph.
  > A **Navgraph** is an undirected graph whose 
  > nodes are _the triangles of the provided triangulation_.
  > Two nodes are connected if and only if _their respective triangles share exactly one edge._

For example, the grey triangles below collectively induce the red navgraph.

<div
  class="tabs"
  name="nav-graph-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/SvgNavGraph#301' },
     { key: 'component', filepath: 'example/SvgNavGraph#302' },
   ]"
></div>

__TODO__ Mention triangle-wasm CodeSandbox


Technically, an undirected graph is just a _symmetric binary relation_.
We have made it concrete by depicting each node as the centroid of its respective triangle.
This is a standard convention, although triangles have more than one [notion of center](https://en.wikipedia.org/wiki/Triangle_center).
It provides a weight for each edge i.e. the distance between the centroids.
Then the length of a path through the undirected graph may be defined as the sum of its edge's weights.

<aside title="why-we-abstract">

Searching for paths through the embedded undirected graph is much easier than searching the navigable polygons.
There are far fewer possibilities.
However, NPCs won't actually follow these embedded paths (for realism),
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
     { key: 'component', filepath: 'example/SvgStringPull' },
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
An NPC will be driven by its own force, plus other forces induced by the position and velocity of nearby NPCs.

<aside>

For example, **obstacle avoidance** works by driving close characters apart.
A suitable force is applied orthogonal to the NPC's direction of travel.

</aside>

However, one cannot expect the vector sum of forces to capture complex interactions between multiple characters.
Reynolds introduced Steering Behaviours as part of a pipeline:
> _action selection_ → _steering_ → _animation_.

In practice, one must rely _heavily_ on action selection to avoid unrealistic behaviour such as oscillation and deadlock.

There is another well-known approach i.e. [Detour](https://github.com/recastnavigation/recastnavigation#detour) and in particular _DetourCrowd_, providing a sophisticated solution to multiple character navigation.
It has been [ported to JS](https://github.com/BabylonJS/Extensions/tree/master/recastjs) in BabylonJS,
and also [integrated](https://docs.unrealengine.com/4.27/en-US/API/Runtime/Navmesh/DetourCrowd/dtCrowd/) into the Unreal Engine.

In Detour, a collection of NPCs is conceptualised as a _Crowd_.
One requests the Crowd to move individual NPCs to particular targets.
An updater function must be executed each frame.
For each fixed NPC, its nearby neighbours are modelled as temporary geometry, influencing the NPC's velocity.
We'll have more to say about this impressive open source library.

### Navigation: Our Approach

So how will we approach this difficult problem?
Well, we won't solve it generally.
That is,
> _we don't seek a black box, magically producing collision-free concurrent navigation_.

We're happy to take things slow.
Let's start with two colliding NPCs.
We'll detect their imminent collision, and then stop them both.

<div
  class="tabs"
  name="nav-collide-demo"
  height="400"
  enabled="false"
  tabs="[]"
></div>

__TODO__
- DraggablePath component ✅
- Circle moves along navpath ✅
- Componentise and improve
- Detect future collision for 2 paths
- Combine with terminal?

### Raycasting

__TODO__
- illustrate line-seg vs line-seg intersection with initial space partitioning
- navigation through auto-opening doors
- combine with terminal?

<div
  class="tabs"
  name="nav-doors-demo"
  height="400"
  enabled="false"
  tabs="[
     { key: 'component', filepath: 'example/SvgDoorsDemo#101' },
     { key: 'component', filepath: 'example/SvgDoorsDemo#301' },
   ]"
></div>
