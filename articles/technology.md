## Technology

So, we're building a roguelike, directly on this website.
It will start to get fun once things are moving about.
Let us describe the underlying technologies.

| Concept | Technology |
| ------- | ---------- |
| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Pathfinding | Based on [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |
| Raycasting | Basic geometry and spacial partitions.  |
| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |
| Live analysis | In-browser terminal, via [xterm.js](https://www.npmjs.com/package/xterm) and [mvdan-sh](https://www.npmjs.com/package/mvdan-sh). |
| Scripting | [TS Node](https://www.npmjs.com/package/ts-node) i.e. Node.js with types. |
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

Competing JavaScript frameworks exist, often with their own notion of component.
One popular approach uses _React function components_, which are just JavaScript functions with constraints on their parameters and return value.

- They have a single parameter, conventionally called _props_.

  It is a JavaScript object defining the component's named inputs,
  and possibly special properties like _children_, _key_ and _ref_.

- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

  This returned value ultimately amounts to an HTML fragment to be rendered,
  and may depend on the component's props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).

React developers use a grammatical extension of JavaScript called JSX.
It permits composing components using an XML-like syntax, to obtain the desired dynamic DOM tree.
Let's consider an example, a pannable and zoomable grid (also [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab")).

<div
  class="tabs"
  height="400"
  store-key="panzoom"
  tabs="[
    { key: 'component', filepath: 'panzoom/PanZoomDemo' },
    { key: 'code', filepath: 'panzoom/PanZoom.jsx', folds: [{ line: 8, ch: 0 }] },
    { key: 'code', filepath: 'panzoom/PanZoomDemo.jsx' },
  ]"
></div>

The file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom code--panzoom/PanZoom.jsx")) defines two React function components, _PanZoom_ and _Grid_.
Behaviourally:

- _PanZoom_ renders an SVG consisting of its children (the Geomorph image provided in _PanZoomDemo_) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.

- _Grid_ renders part of an SVG i.e. two grid patterns.
  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits).

  <aside>
  
  SVG user units become concrete via the `<svg>`'s viewBox attribute and its width/height within the DOM.
  We'll follow a convention based on the work of Robert Pearce and Eric B. Smith. That is, 60 abstract user units (one large grid square) correspond to 1.5 meters.
  </aside>

The above two JS functions each have a single parameter `props`, and return something which looks like HTML (but isn't).
For example, _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.
Then although React function components are functions, syntactically they are not invoked like functions i.e. we do not write `Grid(props)`.
But what are React function components actually returning?
Here's a whirlwind overview.

- React devs use a grammatical extension of JS with XML called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)).
- React applications are built by composing React function components, using the XML syntax for their return value.
- Dev tools convert JSX into JS by replacing XML tags with invocations of the function `React.createElement` ([example/jsx-to-js.jsx](#command "open-tab jsx-to-js")).
- This website actually uses _Preact_, a React alternative with the same API.
  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js),
  and creates Preact virtual DOM nodes.
- The root component is usually called _App_.
  Running a React application means [invoking `ReactDOM.render`](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab")
  with 2 arguments: `<App/>` and a DOM node _el_.

- [`ReactDOM.render`](https://github.com/preactjs/preact/blob/master/src/render.js) initially converts `<App/>` into a DOM node mounted at _el_.
  A subcomponent may re-render, recursively recreating a virtual DOM node.
  It is [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js) and only the difference is applied to the DOM.

<div
  class="tabs"
  height="340"
  store-key="jsx-to-js"
  tabs="[ { key: 'code', filepath: 'example/jsx-to-js.jsx' } ]"
></div>

### Avoiding React Renders

<!--
Websites respond to interaction, sometimes without changing the DOM.
When they do mutate the DOM, they usually don't continually do so.
For example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.
As another example, showing additional search results amounts to a single mutation.
-->

When React renders a component, it computes a rooted subtree of the virtual DOM,
compares the previous one, and patches the DOM.
If many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221) via the ancestral relationship.
Developers can also avoid recreating an entire rooted subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js).
But for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.

However, we are making a realtime video game.
We want to control the rendering as much as possible, to ensure good performance and aid debugging e.g. when many objects are onscreen.
If we allowed React (actually, Preact) to render in response to user interaction, we'd lose this control.
Take another look at _panzoom/PanZoom.jsx_.

<div
  class="tabs"
  height="360"
  store-key="panzoom-again"
  tabs="[
    { key: 'code', filepath: 'panzoom/PanZoom.jsx' },
    { key: 'code', filepath: 'geom/rect.js' },
  ]"
></div>

_PanZoom_ returns an `<svg/>` with a viewBox attribute determined by `state.viewBox`.
When a user zooms via mousewheel, the event handler `state.onWheel` updates `state.viewBox`.
But updating this variable does not automatically update the virtual DOM.
Usually one would _trigger a re-render_, so that _PanZoom_ returns `<svg/>` with the updated viewBox, and the DOM-diffing algorithm does the update.
But how do we trigger a re-render?

A React function component is rendered if an ancestor is (modulo React.memo), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.

> `const [value, setValue] = React.useState(() => initialValue)`

These declarations cannot be nested, must occur at the "top-level" of the React function component, and must always execute in the same order.
This induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109) with their enclosing component.
To change state we execute `setValue(nextValue)` e.g. in response to a click. If `nextValue` differs from `value`, the function `setValue` causes the component to re-render (i.e. be invoked) where `value` has the new value.

In _panzoom/PanZoom.jsx_, `value` corresponds to `state` but there is no correspondent of `setValue`.
Why?
Because we never inform React we've changed `state`, despite mutating it on mouse and pointer events.
Instead, we directly mutate the DOM via:

> ``state.root.setAttribute('viewBox', `${state.viewBox}`);``

<!-- By the way, `` `${state.viewBox}` `` amounts to `state.viewBox.toString()` which is defined in [geom/rect.js](#command "open-tab panzoom-again code--geom/rect.js"). -->

As far as React is concerned nothing has changed.
Also, if React renders for another reason (e.g. an ancestral render), it'll use the mutated `state` to set the viewBox attribute (so, no change).
Why bother though?
To avoid needlessly recomputing `<Grid />` and `children` whenever we pan or zoom.
Our game may contain many elements, and we'd rather not recompute their virtual DOM many times per second.

The above situation is handled by a single DOM mutation.
In more complex situations we'll integrate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
More on that later.

<!-- ### CSS inside JS

Traditionally, CSS is provided in separate files,
linked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.
Both _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React component it applies to.
The npm module [Goober](https://www.npmjs.com/package/goober) handles this for us. -->
