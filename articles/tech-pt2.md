## Technology (2)

Thus far we've described our objective, constrained our approach, and listed the technologies we'll use.
Concerning technology, we've outlined our chosen notion of _JavaScript component_.
This particular blog is devoted to Game AI related tech i.e. _navigation_ and _raycasting_.

### Navigation

<!-- __TODO__
- Rodney Brooks layers.
- Navigation based Game AI.
- Corner-wrapped Pathfinding only provides part of the 
- No physics engine
- Geomorph 101
-->

For the most part, we'll be looking down from above at the interior of spaceships (or _starships_, if you want to get pedantic).
The [crew](https://wiki.travellerrpg.com/Crew) will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage).
These behaviours will be constrained by e.g. sleep patterns, and interruptible by e.g. hardware failures or attacks.

To simulate these behaviours we need to move the crew from A to B.

<!-- Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors. -->

<div
  class="tabs"
  height="400"
  enabled="true"
  tabs="[
     { key: 'component', filepath: 'nav/NavDemo' },
   ]"
></div>

### Raycasting

...