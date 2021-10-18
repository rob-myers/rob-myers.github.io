## Constraints

This project needs a backbone.
We've chosen the underlying technology, low-level game mechanics, and where events take place.

### Technology

We begin with the tools we'll use.  

- Use standard web development, rather than HTMLCanvas and [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).
- Use [NextJS](https://nextjs.org/) as our development environment.
- Use [CodeSandbox](https://codesandbox.io) to share editable code.
- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.
- Use [Preact](https://www.npmjs.com/package/preact) (a React alternative) and [Goober](https://www.npmjs.com/package/goober).
- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.
- Support both mobile and desktop devices.

<!-- NOTE italics inside link currently unsupported -->

The name _Rogue Markup_ refers to the video game _[Rogue](https://en.wikipedia.org/wiki/Rogue_(video_game))_, and the HyperText _Markup_ Language (HTML).
Since HTML may be used in many different ways,
we've clarified our particular path above.
Generally speaking, we'll use standard website technologies e.g. CSS, SVGs, PNGs and the Web Animations API.

<aside>

Although WebGL permits far richer 3D graphics than CSS,
it leads away from the declarative nature of Markup.
Sticking to central web technologies makes our approach relevant to a far larger audience.
We also want to avoid obsessing over graphics, seeking superior Game AI instead.

</aside>

If you're unfamiliar with CodeSandbox (or similar sites), check out  [this example](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").
If you peruse the files, you'll find the rectangle class _Rect_ and a Geomorph PNG.
Our CodeSandboxes use React, whereas this site uses _Preact_.
More on that later.

### Game mechanics

Next, gameplay related constraints.

- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.
- Use a realtime birdseye camera.
- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).
- Use navigation & raycasting algorithms.
- Use an in-browser terminal.
- Do not use a Physics engine.

Let's clarify the above.
We already saw [an example](/pics/g-301--bridge.debug.x2.png "@new-tab") of a Geomorph in the previous article.
Next, by a realtime birdseye camera we just mean a pannable and zoomable SVG.
The Web Animations API provides access to the underlying technology driving CSS animations.
As for navigation and raycasting algorithms, we'll use a [navmesh](https://en.wikipedia.org/wiki/Navigation_mesh#:~:text=A%20navigation%20mesh%2C%20or%20navmesh,video%20game%20AI%20in%202000.) and compute ray/geometry collisions.

Importantly, in order to develop complex Game AI, we'll use a terminal.
Try entering or copy-pasting the commands below
(mobile users may find copy-pasting easier).

  | Category | Examples  |
  | ------- | ---------- |
  | Nav | <span class="cmd">ls</span>, <span class="cmd">pwd</span>, <span class="cmd">cd /home/test</span>, <span class="cmd">cd ..</span> |
  | [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete "@new-tab") | <span class="cmd">echo foo >/home/bar</span>, <span class="cmd">/home/bar</span>, <span class="cmd">cd; rm bar</span> |
  | Out | <span class="cmd">seq 10</span>, <span class="cmd">echo foo{1..5}</span>, <span class="cmd">expr '2**10'</span> |
  | Meta | <span class="cmd">history</span>, <span class="cmd"> declare</span>, <span class="cmd">help</span>, <span class="cmd"> ps</span> |

  <div
    class="tabs"
    name="terminal-demo"
    height="300"
    tabs="[
      { key: 'terminal', session: 'test' },
      { key: 'terminal', session: 'other' },
    ]"
  ></div>

As usual, [Ctrl+C](#command "sigkill test") terminates the "foreground process" e.g. try terminating <span class="cmd">sleep 5</span>.
Pipelines and background processes are also supported.
We'll use terminals to monitor the current state of our Game AI, issue direct commands, and develop long-running behaviour.

### Setting

It remains to constrain the setting.

- Events take place in the [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3), onboard Space vehicles, stations and docks.
- Events are inspired by the [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol),
  >  e.g. Ship AIs may recite it to dying [Low Berth](https://wiki.travellerrpg.com/Low_Berth_Rack "@new-tab") travellers.
- Events are inspired by [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land),
  > e.g. Earth is assumed lost after a Karmic Loop was created, letting in the Watchers and other manifestations from Buddhist hells.

Traveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.
It permits faster than light travel bounded by 6 parsecs per week.
Learn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).
It directly motivated Robert Pearce's Starship Geomorphs, and provides considerable depth.

<!-- <div style="font-size:smaller; padding-bottom: 6px"> -->
<div class="small-print">

_The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright © 1977 – 2021 Far Future Enterprises._

</div>

We'll leverage two additional sources of inspiration i.e. _Liberation Through Hearing in the Intermediate State_ (Bardo Thodol) and a famous Science Fiction story from 1912 (The Night Land).