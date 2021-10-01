## Constraints

This project needs a backbone.
We've chosen the underlying technology, low-level game mechanics, and where events take place.

### Technology

- Use CSS/SVG/PNGs, not HTMLCanvas/WebGL.
- Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.
- Use [Preact](https://www.npmjs.com/package/preact) (like React), and [Goober](https://www.npmjs.com/package/goober) (like [Emotion](https://www.npmjs.com/package/@emotion/styled)).
- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.
- Use [NextJS](https://nextjs.org/) as our dev env.
- Use [CodeSandbox](https://codesandbox.io) to share editable code.
- Support mobile/desktop devices.

<aside>

  Here's our first [CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx  "@new-tab").
  Perusing the files, you'll find the rectangle class _Rect_ and a Geomorph PNG.
  Our CodeSandboxes use React, whereas this site uses _Preact_.
  More on that later.

</aside>


### Game mechanics

- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) for graphics.
- Use a realtime birdseye camera.
- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).
- Use navigation & raycasting algorithms.
- Use an in-browser terminal.
- Do not use a Physics engine.

<aside>

  Building user interfaces is _hard_.
  We'll avoid many difficulties by using an in-browser terminal.
  Try these commands:
  - `ls`, `pwd`, `cd /home/test`, `cd ..`, `/home`
  - `seq 10`, `history`, `declare`, `help`
  - `echo foo{1..5}`, `expr '2 ** 10'`
  - `expr window | map Object.keys | split`

  <div
    class="tabs"
    height="300"
    tabs="[ { key: 'terminal', session: 'test' } ]"
  ></div>

  As usual, Ctrl+C terminates the "foreground process".

</aside>


### Setting

- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).
- Space vehicles, stations, and docks.
- Buddhist backdrop via [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).
- Horror backdrop via [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).

<aside>

  Traveller is a Futuristic pen-and-paper Role-playing Game, created in the late 70s.
  It permits faster than light travel, at ≤ 6 parsecs per week.
  Learn more on the [wiki](https://wiki.travellerrpg.com/Jump_Drive), the [official site](https://www.farfuture.net/) or explore [Traveller Map](https://travellermap.com/).
  It directly motivated Robert Pearce's Starship Geomorphs, and provides considerable depth.

  <div style="font-size:smaller; padding-bottom: 6px">

  _The Traveller game in all forms is owned by [Far Future Enterprises](https://www.farfuture.net/). Copyright © 1977 – 2021 Far Future Enterprises._
  </div>

</aside>

Over time we'll clarify the above constraints, but first we emphasise:
> _creating a video game is really fucking hard_.

Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).
We'll address them.

### 1. Fun to develop

_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.
It is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.
I am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.

### 2. The Result

_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.
Procedurally generated missions will involve going from A to B and doing C (ever was it so).
Monotony will be overcome via encountered NPC behaviours and e.g. ship building.
Functionally, think [Teleglitch](https://www.youtube.com/results?search_query=Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.
Graphically, see Starship Geomorphs 2.0.

Rogue Markup will be easy to extend.
We'll achieve this via compositional code, escape hatches to CodeSandbox, clear explanations, and [GitHub](https://github.com/) comments.

### 3. Experience

_Games I’m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. 
I have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,
so won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.
I have also created similar game mechanics _many_ times over the years.
Here's hoping my chain of unfinished projects is coming to a close!