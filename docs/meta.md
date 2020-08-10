## Overall approach

### @10th-aug-2020

1. New branch `blog-aug-2020` without monaco editor.
2. Stepwise AI development presented as development of brain interface.
3. Game style: teleglitch.
4. Setting: brain exploration and extraction; buddhist hells and heavens.
5. Story: developed via blog.


## Technical approach

Our web-based engine has three parts:

### __geom__
> Rectilinear levels specified via `react` components.
> Auto-generated navmesh with minimal number of rectangles.
> Truly optimal path-finding via recent [Polyanya algorithm](#cite-polyanya).

### __view__
> top-down view with 3d walls via `react`, `SVG` and `CSS3`.

### __bots__
> CLI-style behaviour specification via `rxjs`. -->


<!-- 

---

# What

We propose a standardized approach to Game AI:
> a particular way of _writing_, _playing_ and _editing_ character behaviour.

The entire system runs online right here; it also integrates into a modern web development environment. Our target audience is anyone interested in simulating human behaviour.

# Why

Games permit an individual or small team to communicate an experience/simulation/story to many people. However, it is particularly difficult to design the behaviour of non-player characters.

By providing a prototyping tool with easily migratable behaviours, we hope to help others make better games with less effort. Although each game has its nuances, there is sufficient common ground for abstraction e.g. the subsections of [_AI for Games_](#cite-ai-for-games) have changed little from 2004 (1st edition) to 2019 (3rd edition).


# How
