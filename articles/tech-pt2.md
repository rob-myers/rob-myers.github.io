## Technology (2)

Thus far we've described our objective, constrained our approach, and listed the technologies we'll use.
Concerning technology, we've outlined our chosen notion of _JavaScript component_.
This particular blog is devoted to Game AI related tech i.e. _navigation_ and _raycasting_.

### Navigation

<!-- __TODO__
- Rodney Brooks layers.
- Navigation based Game AI.
- Corner-wrapped Pathfinding only provides part of the 
- No physics engine -->

For the most part, we'll be looking down from above at the interior of spaceships (or _starships_, if you want to get pedantic).
The [crew](https://wiki.travellerrpg.com/Crew) will have tasks e.g. manning the bridge, patrolling the decks, monitoring [low berths](https://wiki.travellerrpg.com/Low_Passage), constrained by sleep patterns, and interruptible by e.g. hardware failures, emergencies etc. 

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