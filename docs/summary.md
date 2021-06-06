## Summary

This website has source material,
> all commonly recognisable conventions and devices used to present virtual characters and their environments.

Video games are where these [tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/VideoGameTropes) usually live. The objective of this website it to explicitly implement them using three main ingredients:

- [three.js](https://en.wikipedia.org/wiki/Three.js) (3d web library)
- [behaviour trees](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control)) (graphical behaviour-building technique)
- [online javascript editor](https://en.wikipedia.org/wiki/Ace_(editor)) (where base behaviours are written)

The implementations will be minimalistic: _just enough to capture the idea_.


## Why?

- Games focus on User Experience, not "Rich Behaviour".
- Games are burdened by setting, progression and graphics/design,
- However, these same "burdens" bring virtual characters to life.
- To improve virtual character behaviour without things becoming meaningless, we'll try to leverage the vast panolpy of existing games.
- Finally, behaviour trees are increasingly relevant to [robotics](https://behavior-trees-iros-workshop.github.io/).


## Technical

- 3d via `three.js`
- 3d navigation via `recast-detour`
- 2d physics via `@box2d/core`
  - https://github.com/Lusito/box2d.ts
- graph editing via `react-flow-renderer`

## Resources

- https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control)
- https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter06_The_Behavior_Tree_Starter_Kit.pdf
- https://cs.uns.edu.ar/~ragis/Agis%20et%20al.%20(2020)%20-%20An%20event-driven%20behavior%20trees%20extension%20to%20facilitate%20non-player%20multi-agent%20coordination%20in%20video%20games.pdf
