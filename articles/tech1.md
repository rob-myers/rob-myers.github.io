## Tech (js)

The early 90s brought three pillars: HTML, CSS, JavaScript (JS).
Whenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.
Our web browser renders the HTML and CSS immediately,
and executes the JS to provide interactivity.

<aside>

More precisely, all _[DOM](https://en.wikipedia.org/wiki/Document_Object_Model#JavaScript) mutations_ are performed by JavaScript.
The DOM is the programmatic interface to the current _document_ viewed in the browser.
It amounts to parsed HTML decorated with matching CSS and bound JS, together with APIs for reading and modifying it.

</aside>

Although HTML, CSS and JS are separate standards, 
it is now common to generate _both_ HTML and CSS using JS.
This is possible via _Node.js Server-Side Rendering_ and _CSS-in-JS_, respectively.
They counter the fundamental asymmetry between the _initial state_ of the document (HTML and CSS) and _all subsequent states_ (orbit of JS executions).


### React Function Components

JS can perform arbitrary computations, but its central purpose is DOM mutation.
Then JS is commonly broken down into _JavaScript components_, instantiated via XML tags.
If the JavaScript component is called `MyComponent`, the associated tag will be `<MyComponent />` or perhaps `<my-component />`.
Intuitively, HTML is extended with these custom tags, which ultimately unwind into plain old HTML.

Competing notions of JavaScript component exist in the wild.
One popular approach is _React function components_.
They are just JavaScript functions with constraints on their parameters and return value.

- They have a single parameter conventionally called _props_.
  It is a JavaScript `Object` defining the component's named inputs,
  and possibly special properties like _children_, _key_ and _ref_.

- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).
  This returned value ultimately unwinds to an HTML fragment,
  and may depend on the component's props and internal state (via [hooks](https://reactjs.org/docs/hooks-intro.html)).

React developers use a grammatical extension of JavaScript called **JSX**.
We already mentioned the idea of extending HTML with custom XML tags.
JSX goes further by reinterpreting XML inside a grammatical extension of JavaScript.

<aside>

JSX freely combines JS with XML, so arbitrary JavaScript values can be passed to tag attributes, and XML can be passed around as a JavaScript value. Inductively closing these capabilities leads naturally to JSX, making this grammar particularly suitable for building dynamic DOM trees.

</aside>

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

The file _panzoom/PanZoom.jsx_ (see [tab above](#command "open-tab panzoom panzoom/PanZoom.jsx")) defines two React function components.
One called _PanZoom_.
Another called _Grid_.
Behaviourally:

- _PanZoom_ renders an SVG containing _children_ (an image provided in _PanZoomDemo_) and `<Grid />`. Over time it adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.

- _Grid_ renders part of an SVG i.e. two grid patterns.
  They repeat squares of size 10x10 and 60x60 in abstract [SVG user units](https://www.w3.org/TR/SVG2/coords.html#TermUserUnits).

  <aside title="svg-user-units">
  
  SVG user units become concrete via the `<svg>`'s viewBox attribute and its width/height in the DOM.
  We'll follow a convention based on the work of Robert Pearce and Eric B. Smith: 
  > 60 abstract user units (one large grid square) correspond to 1.5 meters.

  In fact, 1.5m comes from a Traveller convention concerning [deck plans](https://wiki.travellerrpg.com/Deck_Plan).

  </aside>

The above JS functions both have a single parameter `props`.
Moreover, they both return something which looks like HTML but isn't.
Then what does the XML-like value returned by `PanZoom` actually mean?
What are React function components actually returning?
<!-- For example, _PanZoom_ renders _Grid_ by using the XML tag `<Grid/>`.
Notice that React function components are functions, but syntactically they are not invoked like functions i.e. we don't write `Grid(props)`. -->

Here's a whirlwind overview.

- React devs use a grammatical extension of JavaScript called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript) "@new-tab"), permitting XML syntax.
- React applications are built by composing together React function components. A typical React function component will return XML syntax referencing one or more other components.

- Dev tools convert JSX into JS by replacing XML tags with invocations of `React.createElement` (see [example below](#command "open-tab jsx-to-js")).
- **This website actually uses _Preact_**, a React alternative with the same API.
  Then `React.createElement` is [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js "@new-tab"),
  and creates Preact virtual DOM nodes.
- The root component of an application is usually called _App_.
  Running a React application means invoking `ReactDOM.render`
  with two arguments: `<App/>` and a DOM node _el_. See how we bootstrap examples on [CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@new-tab").

- [ReactDOM.render](https://github.com/preactjs/preact/blob/master/src/render.js "@new-tab") initially converts `<App/>` into a DOM node mounted at _el_.
  Later a subcomponent may "re-render", recursively recreating a virtual DOM node.
  It is [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js "@new-tab")  and only the difference is applied to the DOM.

<div
  class="tabs"
  name="jsx-to-js"
  height="340"
  tabs="[ { key: 'code', filepath: 'example/jsx-to-js.jsx' } ]"
></div>

<aside>

Our whirlwind overview attempts to provide the gist.
Actually, React is notoriously hard to understand. 
The internet is awash with poor explanations and cargo cult mentalities.
However, React is probably the most popular JavaScript component framework;
if you want to understand modern web development, it is arguably unavoidable.

</aside>

### React Renders

<!--
Websites respond to interaction, sometimes without changing the DOM.
When they do mutate the DOM, they usually don't continually do so.
For example, zooming a map can be done with a CSS transform and a pre-existing CSS transition.
As another example, showing additional search results amounts to a single mutation.
-->

When React renders a component, it invokes the respective function.
The return value of the function is a JavaScript representation of a DOM subtree.
This representation is usually referred to as "Virtual DOM".
React compares this JavaScript value to the previous one, and patches the DOM accordingly.
If many components change in a small amount of time, [some renders are automatically avoided](https://github.com/preactjs/preact/blob/ebd87f3005d9558bfd3c5f38e0496a5d19553441/src/component.js#L221 "@new-tab") via the ancestral relationship.
Developers can also avoid recreating a particular rooted subtree using [`React.memo`](https://github.com/preactjs/preact/blob/master/compat/src/memo.js "@new-tab").
But for many websites, the virtual DOM manipulations are neither too large nor too frequent, and React developers may simply ignore their overhead.

However, we are making a realtime video game.
We want to control the rendering as much as possible, to ensure good performance and aid debugging.
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

A React function component is rendered whenever an ancestor is (modulo `React.memo`), or if its internal state changes. Internal state is represented using the [React.useState hook](https://reactjs.org/docs/hooks-state.html) e.g.

> `const [value, setValue] = React.useState(() => initialValue);`

These declarations cannot be nested, must occur at the "top-level" of the React function component, and must always execute in the same order.
This induces a [well-defined association](https://github.com/preactjs/preact/blob/98f130ee8695c2b4f7535205ddf02168192cdcac/hooks/src/index.js#L109 "@new-tab") with their enclosing component.
To change state we execute `setValue(nextValue)` e.g. in response to a click. If `nextValue` differs from `value`, the function `setValue` causes the component to re-render where now `React.setState(...)[0]` has the new value.
This propagation of internal state is possible because a component's hooks must always execute in the same order.

### Avoiding React Renders

In _panzoom/PanZoom.jsx_, the variable `state` is the value of an internal state variable i.e. deconstructed from a `React.useState` hook. Observe that we do not deconstruct the setter (`setValue` in the terminology of the previous section).
Why?
Because we decided to never inform React we've changed `state`, despite mutating it on mouse and pointer events.
Instead we directly mutate the DOM via:

> ``state.root.setAttribute( 'viewBox', `${state.viewBox}` );``

<!-- By the way, `` `${state.viewBox}` `` amounts to `state.viewBox.toString()` which is defined in [geom/rect.js](#command "open-tab panzoom-again geom/rect.js"). -->

Then as far as React is concerned, nothing has changed.
Furthermore if React renders the component for another reason, it'll use the mutated `state` to set the viewBox attribute (producing no change).
> But why not just use a setter `setState`?

Because we avoid needlessly recomputing `children` and `<Grid />` whenever the player pans or zooms.
Our game may contain many elements, and we'd rather not needlessly recompute their virtual DOM tens of times per second.

<!-- The above situation is handled by a single DOM mutation.
In more complex situations we might integrate [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
More on that later. -->

<!-- ### CSS inside JS

Traditionally, CSS is provided in separate files,
linked in the `<head/>` and referenced by DOM elements via their space-separated attribute `class`.
Both _PanZoom_ and _PanZoomDemo_ above are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React component it applies to.
The npm module [Goober](https://www.npmjs.com/package/goober) handles this for us. -->

### React Refresh

Finally, we further justify our somewhat strange usage of `React.useState` i.e. _sans the setter_.
Since we only ever mutate the state, `React.useRef` may seem more suitable.
However, there's something special about `React.useState`.

Whilst working in a suitably tooled development environment, it is possible to textually edit React components [without losing the internal state of their instances](https://www.npmjs.com/package/react-refresh) (the deconstructed values of `React.useState` hooks).
See this in action by editing one of our CodeSandboxes.
This important devtool is known as [react-refresh](https://www.npmjs.com/package/react-refresh) (see also [preact/prefresh](https://github.com/preactjs/prefresh)).
It will help us develop sophisticated Game AI.
