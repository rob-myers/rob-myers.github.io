## Tech (js)

The early 90s brought three pillars:
- HTML
- CSS
- JavaScript (JS).
Whenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.
Our web browser renders the HTML and CSS immediately, and runs the JS to provide interactivity.

<aside>

More precisely, all subsequent [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#JavaScript) mutations are performed by JavaScript.
The DOM is the programmatic interface to the current _document_ viewed in the browser.
It amounts to parsed HTML decorated with matching CSS and bound JS, together with APIs for reading and modifying it.

</aside>

Although HTML, CSS and JS are separate standards, 
it is now common to generate the HTML using JS (Server-Side Rendering),
and also the CSS using JS (CSS-in-JS).
In particular, JavaScript has become the central web technology.


### React Function Components

Although JS can perform arbitrary computations, its central purpose is to mutate the DOM.
Such JavaScript is often broken down into named _components_, instantiated via XML tags.
Competing notions exist in the wild, a popular approach being _React function components_.
They are just JavaScript functions with constraints on their parameters and return value.

- They have a single parameter, usually called _props_.
  It is a JavaScript object defining the component's named inputs,
  and possibly special properties like _children_, _key_ and _ref_.

- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).
  This returned value ultimately amounts to an HTML fragment to be rendered,
  and may depend on the component's props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).

React developers use a grammatical extension of JavaScript called JSX.
It freely combines JS with XML, so JavaScript values can be passed to arbitrary attributes, and XML can be passed around as a JavaScript value. Inductively closing these capabilities leads naturally to JSX, making this grammar particularly suitable for building dynamic DOM trees.

Consider an example, a pannable/zoomable grid (also [on CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@new-tab")).

<div
  class="tabs"
  height="400"
  name="panzoom"
  tabs="[
    { key: 'component', filepath: 'example/PanZoomDemo' },
    { key: 'code', filepath: 'panzoom/PanZoom.jsx', folds: [{ line: 9, ch: 0 }] },
    { key: 'code', filepath: 'example/PanZoomDemo.jsx' },
  ]"
></div>

The file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom panzoom/PanZoom.jsx")) defines two React function components, _PanZoom_ and _Grid_.
Behaviourally:

- _PanZoom_ renders an SVG consisting of its children (the Geomorph image provided in _PanZoomDemo_) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.

- _Grid_ renders part of an SVG i.e. two grid patterns.
  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits).

  <aside>
  
  SVG user units become concrete via the `<svg>`'s viewBox attribute and its width/height in the DOM.
  We'll follow a convention based on the work of Robert Pearce and Eric B. Smith: 
  > 60 abstract user units (one large grid square) correspond to 1.5 meters.

  In fact, 1.5m comes from a Traveller convention concerning [deck plans](https://wiki.travellerrpg.com/Deck_Plan).

  </aside>

The above two JS functions each have a single parameter `props`, and return something which looks like HTML (but isn't).
For example, _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.
Then although React function components are functions, syntactically they are not invoked like functions (we don't write `Grid(props)`).
Then what does this XML syntax mean?
What are React function components actually returning?

Here's a whirlwind overview.

- React devs use a grammatical extension of JavaScript called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript) "@new-tab"), which permits XML syntax.
- React applications are built by composing together React function components. A typical React function component will return XML syntax referencing one or more other components.

- Dev tools convert JSX into JS by replacing XML tags with invocations of `React.createElement` (see [example below](#command "open-tab jsx-to-js")).
- This website actually uses _Preact_, a React alternative with the same API.
  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js "@new-tab"),
  and creates Preact virtual DOM nodes.
- The root component is usually called _App_.
  Running a React application means invoking `ReactDOM.render`
  with 2 arguments: `<App/>` and a DOM node _el_. See how we bootstrap examples on [CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab").

- [ReactDOM.render](https://github.com/preactjs/preact/blob/master/src/render.js "@new-tab") initially converts `<App/>` into a DOM node mounted at _el_.
  A subcomponent may re-render, recursively recreating a virtual DOM node.
  It is [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js "@new-tab")  and only the difference is applied to the DOM.

<div
  class="tabs"
  name="jsx-to-js"
  height="340"
  tabs="[ { key: 'code', filepath: 'example/jsx-to-js.jsx' } ]"
></div>

### React Renders

<!--
Websites respond to interaction, sometimes without changing the DOM.
When they do mutate the DOM, they usually don't continually do so.
For example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.
As another example, showing additional search results amounts to a single mutation.
-->

When React renders a component, it computes a rooted subtree of the virtual DOM,
compares the previous one, and patches the DOM.
If many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221 "@new-tab") via the ancestral relationship.
Developers can also avoid recreating an entire rooted subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js "@new-tab").
But for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.

However, we are making a realtime video game.
We want to control the rendering as much as possible, to ensure good performance and aid debugging e.g. when many objects are onscreen.
If we allowed React (actually, Preact) to render in response to user interaction, we'd lose this control.
Take another look at _panzoom/PanZoom.jsx_.

<div
  class="tabs"
  height="360"
  name="panzoom-again"
  tabs="[
    { key: 'code', filepath: 'panzoom/PanZoom.jsx', idSuffix: '1' },
    { key: 'code', filepath: 'geom/rect.js' },
  ]"
></div>

_PanZoom_ returns an `<svg/>` with a viewBox attribute determined by `state.viewBox`.
When a user zooms via mousewheel, the event handler `state.onWheel` updates `state.viewBox`.
But updating this variable does not automatically update the virtual DOM.
Usually one would _trigger a re-render_, so that _PanZoom_ returns `<svg/>` with the updated viewBox, and the DOM-diffing algorithm does the update.
But how do we trigger a re-render?

### Internal state via `useState`

A React function component is rendered whenever an ancestor is (modulo React.memo), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.

> `const [value, setValue] = React.useState(() => initialValue);`

These declarations cannot be nested, must occur at the "top-level" of the React function component, and must always execute in the same order.
This induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109 "@new-tab") with their enclosing component.
To change state we execute `setValue(nextValue)` e.g. in response to a click. If `nextValue` differs from `value`, the function `setValue` causes the component to re-render where now `React.setState(...)[0]` has the new value.
This propagation of internal state is possible because a component's hooks must always execute in the same order.

### Avoiding React Renders

In _panzoom/PanZoom.jsx_, `value` corresponds to `state` but there is no correspondent of `setValue`.
Why?
Because we never inform React we've changed `state`, despite mutating it on mouse and pointer events.
Instead we directly mutate the DOM via:

> ``state.root.setAttribute( 'viewBox', `${state.viewBox}` );``

<!-- By the way, `` `${state.viewBox}` `` amounts to `state.viewBox.toString()` which is defined in [geom/rect.js](#command "open-tab panzoom-again geom/rect.js"). -->

As far as React is concerned, nothing has changed.
Furthermore if React renders the component for another reason, it'll use the mutated `state` to set the viewBox attribute (producing no change).
Why not use `setState`?
Because we avoid needlessly recomputing `<Grid />` and `children` whenever the player pans or zooms.
Our game may contain many elements, and we'd rather not needlessly recompute their virtual DOM tens of times per second.

Finally, should we really use `React.useState` as above?
It seems a little strange to ignore the state setter.
Direct DOM mutation provides performance benefits, that has been our justification so far.
But there is actually another reason specific to `React.useState`.

__TODO__ runtime vs devtime; in devtime can use fast refresh e.g. preserve state when changing a components return value. Can see benefits of fast refresh on CodeSandbox.

<!-- The above situation is handled by a single DOM mutation.
In more complex situations we might integrate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
More on that later. -->

<!-- ### CSS inside JS

Traditionally, CSS is provided in separate files,
linked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.
Both _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React component it applies to.
The npm module [Goober](https://www.npmjs.com/package/goober) handles this for us. -->
