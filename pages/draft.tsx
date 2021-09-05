import Title from 'components/page/Title';
import Gap from 'components/page/Gap';
import Main from 'components/page/Main';
import Markdown from 'components/page/Markdown';
import Tabs from 'components/page/Tabs';
import Terminal from 'components/sh/Terminal';

export default function IndexPage() {
  return (
    <Main>
      <Title />

      <Markdown top bot children={`
## Objective <float rem="1.2">19th July 2021</float>

We are going to build a video game step-by-step on this website.
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike), set in space. We'll assume the role of Captain of the starship _Gehennom_.

But what's special about this game?

1. We'll build it using standard web development techniques.
3. We'll set it in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3), using [thousands of freely available assets](http://gurpsland.no-ip.org/geomorphs/).
3. We'll expose its Game AI via an in-browser terminal.

<!--
Web development permits an open/extendable approach to building a game.
On the other hand, realtime games push the boundaries of traditional web development,
forcing us to take more care than usual.
Finally, by emphasising programmable and monitorable Game AI,
we hope to avoid unextendable icebergs of code.
-->
        `}/>

      <Gap/>

      <Markdown top bot children={`
## Constraints <float rem="1.2">19th July 2021</float>

This project needs a backbone.
We've decided the technology to use, the low-level game mechanics, and the underlying setting where events take place.

### Technology

- Create a web game for mobile and desktop devices.
- Use CSS/SVG/PNGs instead of HTMLCanvas/WebGL.
- Use [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for simulating physics.
- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.
- Use [Preact](https://www.npmjs.com/package/preact) instead of React, and [Goober](https://www.npmjs.com/package/goober) instead of [Emotion](https://www.npmjs.com/package/@emotion/styled).
- Use and mutate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.
- Use [NextJS](https://nextjs.org/) as our development environment.
- Use [CodeSandbox](https://codesandbox.io) to share editable code.

### Game mechanics (low-level)

- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) as the graphical style.
- Use a realtime birdseye camera like [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch). 
- Use [Recast](https://github.com/recastnavigation/recastnavigation) to generate navmeshes.
- Use [a recent port](https://www.npmjs.com/package/box2d-wasm) of the physics engine [Box2D](https://github.com/erincatto/box2d).
- Use procedural generation for spaceship building.
- Use the terminal to program and monitor Game AI.

### Setting
  
- The title of the game is _Rogue Markup_.
- The events take place in the [Traveller Universe](https://travellermap.com).
- The player is the Captain of the starship _Gehennom_.
- The player works for _Unified Transport_, providing cargo/personnel transport and hauling services.

Over time we'll clarify the above,
but first we emphasise:
> _finishing a video game is really fucking hard_.

Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game). We'll now address them.

### 1. Fun to develop

_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.
It is hard to discuss Game AI without actually building a game, so I chose a setting and game mechanics which felt fun for me.
In particular, we'll control and monitor NPC behaviour using an in-browser terminal.

<!--
Complexity will arise from the environment and agent interaction, rather than complex individual thinking or scripted behaviour.
Simple interacting robots fits the space travel theme nicely.
They're also analogous to UI components: parallel systems with some intercommunication.
-->

### 2. The Result

_Games I want to have made_. As an end result I want a highly replayable space travel game.
The underlying missions amount to going from A to B (ever was it so).
Monotony will be overcome via mission specifics, encountered NPC behaviours, procedural generation, and ship building.
Functionally, think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) where you can _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading or docking.
Graphically, check out Starship Geomorphs 2.0.

It should be easy for other people to extend this game.
We'll achieve this by providing source code, escape hatches to CodeSandbox, and clear explanations.
Comments will be shown so that [GitHub](https://github.com/) users can share ideas and links.

<!--
[NetHack](https://en.wikipedia.org/wiki/NetHack)'s ≥ 34 year history shows _we needn't spell out a story_.
-->
<!--
We'll add cameras, guards, doors, keys, weapons etc.
All NPC decisions will be depicted graphically, such as future navpaths with probabilistic branches.
-->

### 3. Experience

_Games I’m good at making_. I work as a web developer, using React and CSS-in-JS on a daily basis. 
I have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,
so won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.
I have also created similar game mechanics _many_ times over the years.
Here's hoping my chain of unfinished projects is coming to a close!
      `}/>

      <Gap/>

      <Markdown top children={`
## Technology  <float rem="1.2">19th July 2021</float>

So we're going to build a video game, directly on this website.
It will start getting fun once things are moving around under our control.
But first we'll describe the underlying browser-based technologies we intend to use.

| Concept | Browser Technology |
| - | - |
| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober), and programmatically. |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Pathfinding | Offline navmeshes, and a port of [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |
| Physics engine | [WebAssembly port](https://www.npmjs.com/package/box2d-wasm) of [Box2D](https://github.com/erincatto/box2d). |
| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html), and also [ESLint](https://www.npmjs.com/package/eslint). |
| Live analysis | Our own in-browser terminal. |
| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |
| Code sharing | [GitHub](https://github.com/) comments shown on site; GitHub [repo](https://github.com/rob-myers/rob-myers.github.io) for this site. |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->

### React and Preact

Competing web frameworks exist in the wild, often with their own notion of component.
One popular approach uses _React function components_, which are just JavaScript functions with constraints on their parameters and return values.

- They have a single parameter, conventionally called _props_.

  It is a JavaScript object defining the component's named inputs,
  and possibly special properties like _children_, _key_ and _ref_.

- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

  This returned value amounts to an HTML fragment to be rendered,
  and may depend on the component's props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).

React developers use a grammatical extension of JavaScript called JSX.
It permits composing components using an XML-like syntax, to obtain the desired dynamic DOM tree.
Let's consider an example, a pannable and zoomable grid.
      `}/>

      <Tabs
        height={400}
        tabs={[
          { key: 'component', filepath: 'panzoom/PanZoomDemo.jsx' },
          { key: 'code', filepath: 'panzoom/PanZoom.jsx', folds: [{ line: 8, ch: 0 }] },
          { key: 'code', filepath: 'panzoom/PanZoomDemo.jsx' },
        ]}
      />

      <Markdown children={`

The file _panzoom/PanZoom.jsx_ (see tab above) defines two React function components, _PanZoom_ and _Grid_.
Behaviourally:

- _PanZoom_ renders an SVG consisting of its children (the red square in the demo) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.

- _Grid_ renders part of an SVG i.e. a grid obtained by repeating a 10x10 unit pattern.

They are JS functions with a single parameter, returning something which looks like HTML (but isn't).
Notice _PanZoom_ renders _Grid_ by using the XML tag _\\<Grid\\>_.
Then although React function components are functions, syntactically they are not invoked like functions.
You can also view the demo code [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab"), which permits code editing.

Here's a whirlwind overview of React (and Preact).

- React devs use a grammatical extension of JS called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)), permitting XML syntax.
- React applications are often built by composing React function components, using the XML syntax for their return value.
- Dev tools convert JSX into JS, by replacing XML tags with invocations of the function _React.createElement_.
  Please see _example/jsx-to-js.jsx_ further below.
- Actually, this website uses Preact, an alternative to React with the same API.
  Then _React.createElement_ is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js),
  and constructs Preact virtual DOM nodes.
- The root component is usually called _App_.
  Running a React application means [invoking _ReactDOM.render_](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab")
  with 2 arguments: _\\<App/\\>_ and an extant DOM node _el_.
- [_ReactDOM.render_](https://github.com/preactjs/preact/blob/master/src/render.js) initially converts _\\<App/\\>_ into a DOM node mounted at _el_.
  A subcomponent may subsequently re-render, recursively recreating a virtual DOM node.
  It is then [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js), and only the difference is applied to the DOM.
- If _\\<App/\\>_ is a website, it is often [rendered server-side](https://github.com/preactjs/preact-render-to-string/blob/master/src/index.js) so the client can render the HTML immediately.
  Afterwards, the client invokes [_ReactDOM.hydrate_](https://github.com/preactjs/preact/blob/master/src/render.js) instead of _ReactDOM.render_, but with the same arguments.

      `}/>

      <Tabs
        height={360}
        indent="var(--list-indent)"
        tabs={[
          { key: 'code', filepath: 'example/jsx-to-js.jsx' },
        ]}
      />

      <Markdown bot children={`

So, React function components are written using syntactic-sugar (JSX), and composed together in the same way as HTML.
We're actually using Preact: its codebase is smaller, and it has reputation for being faster
(although React has a _much_ wider scope via [custom renderers](https://github.com/chentsulin/awesome-react-renderer)).
Rendering a component involves (re)constructing virtual DOM nodes and diffing them.
Finally, the initial render of a website is often precomputed, so it loads faster.

<!--
There's more to say e.g. how React function components represent internal state,
but we've said more than enough for now.
-->

### React Renders and Web Components

__TODO__ _we'll control the rendering i.e. React should only render initially or during fast refresh. We'll manipulate the DOM directly using Web Components. By keeping the initial virtual DOM mostly constant, the DOM diffing won't interfere._

### CSS inside JS

Traditionally, CSS is provided in separate files,
linked in the _\\<head\\>_ and referenced by DOM elements via their class attribute.
Both _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React component it applies to.
The npm module [Goober](https://www.npmjs.com/package/goober) handles this for us.
      `}/>

      <Gap/>

      <Markdown top children={`
## Technology (Part 2)

### Navigation

Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors.

      `}/>

      <Tabs
        height={300}
        tabs={[
          { key: 'component', filepath: 'pathfinding/NavDemo.jsx' },
        ]}
      />

      <Markdown bot children={`
### Physics engine

We need a Physics engine:
- Raycasting
- Triggers
- Collision detection
      `}/>

      <Tabs
        height={300}
        tabs={[
          { key: 'component', filepath: 'physics/PhysicsDemo.jsx' },
        ]}
      />

      <Gap/>

      <Markdown top bot children={`
## Technology (Part 3)

### Static and Runtime Analysis

- Typescript via JSDoc, refering to CodeSandbox.
- Terminal + Preact hooks
- Terminal + Game AI

### Comments

- Display GitHub comments from Issue (build-time)
- Can use anonymous credits to get recent
      `}/>

      <Gap/>

      <Markdown top children={`
## Starship Geomorphs <float rem="1.2">19th July 2021</float>

### Filesystem structure

media
- Starship Geomorphs 2.0.pdf (Original source)
- Starship Symbols.pdf (Original source)
- Geomorphs.zip (Transparent PNGs obtained from Starship Geomorphs 2.0)
- SymbolsHighRes.zip (Transparent PNGs obtained from Starship Symbols)

media/Geomorph
- PNGs of lower quality (relatively).
- Extracted from "Starship Geomorphs 2.0.pdf" by ... 

media/Symbols
- PNGs of higher quality.
- Extracted from "Starship Symbols.pdf" by ... 

media/scripts
- ts-node scripts launched via npm scripts
- Directories generated by scripts
- media/geomorph-edge (Edge Geomorphs)
- media/symbol-bridge
- media/symbol-dock-small-craft
- media/symbol-staterooms
- media/symbol-lounge
- media/symbol-root

public/png
- PNGs from media/symbol-* with labels removed

public/svg
- Enriched symbols
- Geomorph hulls
      `}/>

      <Tabs
        height={400}
        tabs={[
          { key: 'component', filepath: 'geomorph/GeomorphTest.jsx' },
        ]}
      />
      <Tabs
        height={400}
        tabs={[
          { key: 'component', filepath: 'geomorph/GeomorphTest2.jsx' },
        ]}
      />

      <Markdown bot children={`
## Movement <float rem="1.2">19th July 2021</float>

- Navigation
- Follow camera
- Map view
      `}/>

      <Gap/>

      <section style={{ height: 200 }}>
        <Terminal sessionKey="test" env={env.test} />
      </section>

      <Gap/>

      <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
      `}/>
    </Main>
  );
}

const env = {
  test: {},
};
