import Main from 'components/page/Main';
import Sep from 'components/page/Sep';
import Markdown from 'components/page/Markdown';
import Tabs from 'components/page/Tabs';

export default function DraftPage() {
  return (
    <Main>

      <Markdown children={`
## Objective <float rem="1.2">19th July 2021</float>

We are going to make a _Game AI focused_ [roguelike](https://en.wikipedia.org/wiki/Roguelike),
set in the [Traveller universe](https://travellermap.com/?p=-1.329!-23.768!3).

_Why?_

Because NPC behaviour is more interesting than any particular game.
An environment is needed to make it meaningful,
fixed narratives/missions are not.

Our approach will be algorithmic,
yet driven by the environment e.g. thousands of [Traveller-themed assets](http://travellerrpgblog.blogspot.com/2020/08/starship-symbols-book.html).
We'll focus on combining and managing navigation-based behaviours.
Game AI should be compositional, not forced into a straight-jacket.

<!--
Web development permits an open/extendable approach to building a game.
On the other hand, realtime games push the boundaries of traditional web development,
forcing us to take more care than usual.
-->
        `}/>

      <Sep/>

      <Markdown children={`
## Constraints <float rem="1.2">19th July 2021</float>

This project needs a backbone.
We've chosen the underlying technology, low-level game mechanics, and where events take place.

### Technology

<!-- - Use [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for physics. -->
- Use CSS/SVG/PNGs, not HTMLCanvas/WebGL.
- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.
- Use [Preact](https://www.npmjs.com/package/preact) (not React), and [Goober](https://www.npmjs.com/package/goober) (not [Emotion](https://www.npmjs.com/package/@emotion/styled)).
- Use [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to avoid React renders.
- Use [NextJS](https://nextjs.org/) as our dev env.
- Use [CodeSandbox](https://codesandbox.io) to share editable code.
- Support mobile/desktop devices.

### Game mechanics (low-level)

- Use [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html) graphics.
- Use a realtime birdseye camera.
- Use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API).
- Use navigation & raycasting algorithms.
- Use an in-browser terminal.
- Do not use a Physics engine.
<!-- - Use procedural generation for spaceship building. -->


### Setting
  
- The [Traveller Universe](https://travellermap.com/?p=-1.329!-23.768!3).
- Space vehicles/station/docks.
- Buddhist backdrop via [Bardo Thodol](https://en.wikipedia.org/wiki/Bardo_Thodol).
- Horror backdrop via [The Night Land](https://en.wikipedia.org/wiki/The_Night_Land).

Over time we'll clarify the above, but first we emphasise:
> _creating a video game is really fucking hard_.

<!--
Although we'll avoid _fixed_ narratives/missions/levels,
compositional Game AI naturally leads to procedurally generated missions (common amongst Roguelikes).
In this sense we are attemping to create a video game.
-->
Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).
We'll now address them.

### 1. Fun to develop

_Games I want to make_. My underlying motivation is the lack of Game AI resources available on the web.
It is hard to discuss the subject without actually building a game, so I chose a setting and game mechanics which felt fun for me.
I am particularly interested in navigation i.e. combining the movement of many characters in a flexible manner.
<!-- In particular, we'll control and monitor NPC behaviour using an in-browser terminal. -->

### 2. The Result

_Games I want to have made_. As an end result I want a highly replayable tactical/action game sandbox.
Procedurally generated missions will involve going from A to B and doing C (ever was it so).
Monotony will be overcome via encountered NPC behaviours and e.g. ship building.
Functionally, think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) with richer NPCs and the ability to _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading/docking.
Graphically, see Starship Geomorphs 2.0.

It should be easy for others to extend Rogue Markup.
We'll achieve this by providing compositional code, escape hatches to CodeSandbox, and clear explanations.
Comments will be shown so [GitHub](https://github.com/) users can share ideas and links.

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

      <Sep/>

      <Markdown children={`
## Technology  <float rem="1.2">19th July 2021</float>

So, we're building a roguelike, directly on this website.
It will start to get fun once things are moving about.
But first we'll describe the underlying technologies.

| Concept | Technology |
| - | - |
| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober) & programmatically. |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Pathfinding | A port of [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |
| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |
| Live analysis | Our own in-browser terminal. |
| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |
| Code sharing | Show [GitHub](https://github.com/) comments, provide GitHub [repo](https://github.com/rob-myers/rob-myers.github.io). |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->


The early 90s brought three pillars: HTML, CSS and JavaScript.
Whenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.
Our web browser renders the HTML and CSS immediately, and runs the JS to provide interactivity (beyond links, hovers and CSS animations).
More precisely, all subsequent DOM mutations are performed by JavaScript.
It is now common to generate the initial HTML using JS too,
either during a build-step or on a Node.js server.
In particular, JavaScript has become the central web technology.

> ℹ️ _We'll spend the next two sections describing how we use JS._
> _The discussion is full of jargon, but the details can be picked up later on._

### React and Preact

Competing JavaScript frameworks exist, usually with their own notion of _component_.
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
        storeKey="panzoom"
        height={400}
        tabs={[
          { key: 'component', filepath: 'panzoom/PanZoomDemo.jsx' },
          { key: 'code', filepath: 'panzoom/PanZoom.jsx', folds: [{ line: 8, ch: 0 }] },
          { key: 'code', filepath: 'panzoom/PanZoomDemo.jsx' },
        ]}
      />

      <Markdown children={`
The file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom code--panzoom/PanZoom.jsx")) defines two React function components, _PanZoom_ and _Grid_.
Behaviourally:

- _PanZoom_ renders an SVG consisting of its children (the red square in the demo) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.

- _Grid_ renders part of an SVG i.e. two grid patterns.
  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits).

They are JS functions with a single parameter, returning something which looks like HTML (but isn't).
Notice _PanZoom_ renders _Grid_ by using the XML tag \`<Grid/>\`.
Then although React function components are functions, syntactically they are not invoked like functions.
You can also view the demo code [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab"), which permits code editing.

Here's a whirlwind overview of React (and Preact).

- React devs use a grammatical extension of JS with XML called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)).
- React applications are often built by composing React function components, using the XML syntax for their return value.
- Dev tools convert JSX into JS, by replacing XML tags with invocations of the function \`React.createElement\`.
  See [example/jsx-to-js.jsx](#command "open-tab jsx-to-js") below.
- Actually, this website uses Preact, a React alternative with the same API.
  Then \`React.createElement\` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js),
  and makes Preact virtual DOM nodes.
- The root component is usually called _App_.
  Running a React application means [invoking \`ReactDOM.render\`](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab")
  with 2 arguments: \`<App/>\` and a DOM node _el_.

- [\`ReactDOM.render\`](https://github.com/preactjs/preact/blob/master/src/render.js) initially converts \`<App/>\` into a DOM node mounted at _el_.
  A subcomponent may subsequently re-render, recursively recreating a virtual DOM node.
  It is then [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js), and only the difference is applied to the DOM.

<!--
- If \`<App/>\` is a website, it is often [rendered as HTML server-side](https://github.com/preactjs/preact-render-to-string/blob/master/src/index.js), so the client can render it immediately.
  The client then invokes [\`ReactDOM.hydrate\`](https://github.com/preactjs/preact/blob/master/src/render.js) instead of \`ReactDOM.render\`, but with the same arguments.
-->
      `}/>

      <Tabs
        storeKey="jsx-to-js"
        height={340}
        tabs={[
          { key: 'code', filepath: 'example/jsx-to-js.jsx' },
        ]}
      />

      <Markdown children={`
<!--
So, React function components are written using syntactic-sugar (JSX), and composed together like HTML.
We're using Preact (its codebase is smaller, and it has reputation for being faster,
although React has a _much_ wider scope via [custom renderers](https://github.com/chentsulin/awesome-react-renderer)).
Rendering a component involves (re)constructing virtual DOM nodes and diffing them.
Finally, the first render is often precomputed, to load faster.
-->

### React Renders and Web Components

<!--
Websites respond to interaction, sometimes without changing the DOM.
When they do mutate the DOM, they usually don't continually do so.
For example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.
As another example, showing additional search results amounts to a single mutation.
-->

When React renders a component, it computes a rooted subtree of the virtual DOM,
compares the previous one, and patches the DOM.
If many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221) via the ancestral relationship.
Developers can also avoid recreating an entire rooted subtree using [\`React.memo\`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js).
But for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.

However, we are making a realtime video game.
We want to control the rendering as much as possible, to ensure good performance and aid debugging e.g. when many objects are onscreen.
If we allowed React (actually, Preact) to render in response to user interaction, we'd lose this control.
Take another look at _panzoom/PanZoom.jsx_.

      `}/>

      <Tabs
        height={360}
        tabs={[
          { key: 'code', filepath: 'panzoom/PanZoom.jsx' },
          { key: 'code', filepath: 'geom/rect.js' },
        ]}
      />

      <Markdown children={`

_PanZoom_ returns an \`<svg/>\` with a viewBox attribute determined by _state.viewBox_.
When a user zooms via mousewheel, the event handler _state.onWheel_ updates _state.viewBox_.
But updating this variable does not automatically update the virtual DOM.
The canonical React approach would be to re-render, so that _PanZoom_ returns \`<svg/>\` with the updated viewBox, and the DOM-diffing algorithm does the update.
But how do we trigger a re-render?

A React function component is rendered whenever an ancestor is (modulo React.memo), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.

> \`const [data, setData] = React.useState(() => initialState)\`.

These declarations cannot be nested and must occur at the "top-level" of the React function component, always executing in the same order.
This induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109) with their enclosing component.
To change state we execute _setData(nextData)_ e.g. in response to a click. If _nextData_ differs from _data_, the component is re-rendered relative to the new data.

In _panzoom/PanZoom.jsx_ the variable _state_ corresponds to _data_, but there is no correspondent of _setData_.

__TODO__ _we'll control the rendering i.e. React should only render initially or during fast refresh. We'll manipulate the DOM directly using Web Components. By keeping the initial virtual DOM mostly constant, the DOM diffing won't interfere._

__TODO__ Server-side rendering cannot handle DOM mutations, so we don't use SSR.


### CSS inside JS

Traditionally, CSS is provided in separate files,
linked in the \`<head/>\` and referenced by DOM elements via their space-separated attribute \`class\`.
Both _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React component it applies to.
The npm module [Goober](https://www.npmjs.com/package/goober) handles this for us.
      `}/>

      <Sep/>

      <Markdown children={`
## Technology (Part 2)

### Navigation

Pathfinding is central to Game AI.
Our NPCs need to move realistically e.g. they cannot move through walls, windows or locked doors.

      `}/>

      <Tabs
        // enabled
        height={300}
        tabs={[
          { key: 'component', filepath: 'pathfinding/NavDemo.jsx' },
        ]}
      />

      <Markdown children={`
### Raycasting

...
      `}/>

      <Sep/>

      <Markdown children={`
## Technology (Part 3)

### Static Analysis

- Typescript via JSDoc, refering to CodeSandbox.

### Runtime Analysis

- Terminal + Game AI

### Comments

- Display GitHub comments from Issue (build-time)
- Can use anonymous credits to get recent
      `}/>

      <Sep/>

      <Markdown children={`
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
        enabled
        height={400}
        tabs={[
          { key: 'component', filepath: 'geomorph/GeomorphDemo.jsx' },
        ]}
      />

    </Main>
  );
}

const env = {
  test: {},
};
