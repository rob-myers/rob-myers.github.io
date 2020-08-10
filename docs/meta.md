## Overall approach

### @10th-aug-2020

1. New branch `sans-monaco-2020` without monaco editor.
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
