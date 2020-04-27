## Blog

What is the website about?

> _Getting users to build Game AI._

---

We'll motivate ourselves by writing about it e.g. _concepts covered and how_.

---

We provide the _building blocks_ i.e.

- _prebuilt levels_ with:
  - navigable navmesh
  - tables/icons/lights
  - triggers (visible to user)
- _an interactive shell_ with additional _level-specific commands_:
  - `spawn` actors
  - `list` level items
  - compute `nav` paths
  - actor moves via `goto`
  - actor sees via `look`

---

A _blog post_ might be:
> 1. an example behaviour e.g. `find key and open door`
> 1. a problem for users with an example solution
> 1. a mini-game e.g. `get to the exit without being seen`.

In the first two cases the user is encouraged to code.
In the 3rd case the user should play, although the (possibly read-only) console may provide auxiliary information.


---

<!-- Need a story? _No_.

> No need for setting, plot, characters, dialogue.
> <br>
> No need for neat isolated package.
> <br>
> No need to fudge Game AI for appearances.

> hmm... some kind of _setting_ may still be warranted.
> Game AI puzzles... in context of what?  -->


---
<!-- 
Examples:

- Player can walk around.
- He asked her a question. She paused, then slowly walked away.
- He was sitting on a chair. He got up, picked up the gun, and walked out of the room.
- They were waiting for him. He didn't even know what hit him.
- The family sat down for dinner.
- Bob avoids Alice. -->

<!-- Importantly, I must enjoy making it. -->


## Assets

### `icon`

### `light`

Has radius i.e. `max(rect.width, rect.height)`.

### `table`

Obstruction.
Currently always has drop-shadow.
