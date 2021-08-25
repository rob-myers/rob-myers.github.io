import { code } from 'model/tabs-lookup';

import Markdown from 'components/page/Markdown';
import CodeEditor from 'components/code/WrappedCodeEditor';
import Terminal from 'components/sh/Terminal';
import Tabs from 'components/page/Tabs';
import Title from 'components/page/Title';
import GeomorphTest from 'projects/geomorph/GeomorphTest';

export default function IndexPage() {
  return (
    <div className="main">
      <section>

        <Title />

        <Markdown children={`

## Objective <float rem="1.2">19th July 2021</float>

We are going to build a video game step-by-step on this website.
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike), set in space. We'll assume the role of Captain of the starship _Gehennom_.

As an important side-effect, a popular approach to frontend development will be presented. The underlying technology is the Markup language HTML, brought to life via CSS, SVG and JavaScript.

---

## Constraints <float rem="1.2">19th July 2021</float>

I've necessarily made a large number of decisions. Here are the important ones, from low-level to high-level.

### Concerning technology

- We'll make a browser-based game.
- Use CSS/SVG/PNGs instead of HTMLCanvas/WebGL.
- Use [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for simulating physics.
- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and CSS-in-JS.
- Use [Preact](https://www.npmjs.com/package/preact) instead of React, and [Goober](https://www.npmjs.com/package/goober) instead of [Emotion](https://www.npmjs.com/package/@emotion/styled).
- Use [NextJS](https://nextjs.org/) as our development environment.
- Use [CodeSandbox](https://codesandbox.io) to share editable code.

### Concerning game mechanics

- Use a realtime birdseye camera, like [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch). 
- Use the physics engine [Rapier](https://www.npmjs.com/package/@dimforge/rapier2d).
- Use procedural generation e.g. spaceship building/docking.
- Use explicitly illustrated NPC decisions as a game mechanic.

### Concerning the setting
  
- The title of the game is _Rogue Markup_.
- The player captains the starship _Gehennom_, working for _Unified Transport_.
- The missions involve personnel transport, cargo transport, and hauling.
- The graphical style is based on [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html).

Over time we'll clarify these constraints.
But first we emphasise:
> _finishing a game is really fucking hard_.

Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game). We'll now address them.

### 1. Fun to develop (Games I want to make)

_Rogue Markup_ will be fun to develop because I enjoy experimenting with NPC behaviour.
One of our underlying motivations is the lack of Game AI resources available on the web.
It is hard to discuss Game AI without actually building a game, so I chose a setting and game mechanics which felt fun for me.

<!--
Complexity will arise from the environment and agent interaction, rather than complex individual thinking or scripted behaviour.
Simple interacting robots fits the space travel theme nicely.
They're also analogous to UI components: parallel systems with some intercommunication.
-->

### 2. The Result (Games I want to have made)

As an end result I want a _highly replayable space travel game_.
The underlying missions amount to going from A to B (ever was it so).
Monotony will be overcome via mission specifics, encountered NPC behaviours, procedural generation, and ship building.
Functionally, think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) where you can _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading or docking.
Graphically, see [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html).

Importantly, it should be easy for other people to extend this game.
We'll achieve this by providing source code, escape hatches to [CodeSandbox](https://codesandbox.io/), and clear explanations.
Comments will be shown so that [GitHub](https://github.com/) users can share ideas and links.

<!--
[NetHack](https://en.wikipedia.org/wiki/NetHack)'s ≥ 34 year history shows _we needn't spell out a story_.
-->
<!--
We'll add cameras, guards, doors, keys, weapons etc.
All NPC decisions will be depicted graphically, such as future navpaths with probabilistic branches.
-->

### 3. Experience (Games I’m good at making)

I work as a web developer, using React & Emotion on a daily basis. 
I have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,
so won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.
I have also created similar game mechanics _many_ times over the years.
Here's hoping my chain of unfinished projects is coming to a close!

---

## Technology  <float rem="1.2">19th July 2021</float>

We will build the game using the following technologies.

| Concept | Browser Technology |
| - | - |
| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. JavaScript functions using syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html) and internal state via [hooks](https://reactjs.org/docs/hooks-intro.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Physics engine | The WebAssembly module [Rapier](https://www.npmjs.com/package/@dimforge/rapier2d). |
| Static analysis | [ESLint](https://www.npmjs.com/package/eslint) and also TypeScript via [JSDoc comments](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). |
| Live analysis | [Preact option hooks](https://preactjs.com/guide/v10/options/) and _our own in-browser terminal_. |
| Code viewing | [CodeMirror](https://codemirror.net/) for viewing JavaScript on this site. [FlexLayout](https://github.com/caplin/FlexLayout) provides draggable tabs. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |
| Code sharing | [GitHub](https://github.com/) comments shown on site; GitHub [repo](https://github.com/rob-myers/rob-myers.github.io) for this site. |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->
<!-- Typically we'll present a "project" as a number of tabs, consisting of source code _foo/bar.jsx_, and another tab i.e. the rendered output. -->

We want to create a video game explicitly, exposing the code and underlying thought process.
Then it is worth explaining these technologies before using them.

### React, Styles and Preact

Competing web frameworks exist in the wild, often with their own notion of component.
One popular approach uses _React function components_, which are just JavaScript functions with constraints on their parameters and return values.
In particular:

- They have a single parameter, conventionally called _props_.
  
  It is a JavaScript object defining named inputs, and possibly special properties like _children_, _key_ and _ref_.
- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).
  
  The returned value is an HTML fragment to be rendered.
  It may depend on the component's props and internal state.

React developers compose components together using an XML-like syntax, yielding the desired dynamic DOM tree.
It is worth being a bit more precise, so consider some code.
        `}/>

        <Tabs
          tabs={[
            { key: 'code', filepath: 'panzoom/PanZoom.jsx', folds: [{ line: 9, ch: 0 }] },
            { key: 'component', filepath: 'panzoom/PanZoomDemo.jsx' },
            { key: 'code', filepath: 'panzoom/PanZoomDemo.jsx' },
          ]}
          height="400px"
        />

        <Markdown children={`

The file _panzoom/PanZoom.jsx_ defines two React function components, namely _PanZoom_ and _Grid_.
They are JavaScript functions with a single parameter, returning something which looks like HTML (but isn't).
_PanZoom_ defines a pannable and zoomable grid.
To see it in action click the other tabs above, or view [this CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@external").
Behaviourally:
- _PanZoom_ renders an SVG consisting of its children (the red square in the demo) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.
- _Grid_ renders part of an SVG i.e. a grid obtained by repeating a 10x10 unit pattern.

Notice _PanZoomDemo_ renders _PanZoom_ by using the XML tag _\\<PanZoom\\>_.
Then although React function components are functions, they are not invoked like functions.
We now provide more details of a general nature.

- React developers use a grammatical extension of JS called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)), naturally combining JavaScript and XML syntax.
- Dev tools convert JSX into JS, by replacing XML tags with invocations of the function _React.createElement_.
  `}/>

  <CodeEditor
    margin="0 0 0 40px"
    height="310px"
    code={code['example/jsx-to-js.jsx']}
    lineNumbers
    readOnly
  />

  <Markdown children={`

- This website uses Preact instead of React. Technically, _react_ and _react-dom_ are aliases for the npm module [@preact/compat](https://www.npmjs.com/package/@preact/compat).
  As a result, React.createElement corresponds to [this function](https://github.com/preactjs/preact/blob/master/src/create-element.js),
  and constructs Preact VNode's (virtual DOM nodes).
- The root component is conventionally called _App_.
  Running a React application amounts to [invoking _ReactDOM.render_](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/index.js "@external")
  with two arguments: _\\<App/\\>_ and an extant DOM node _el_.
  The [render function](https://github.com/preactjs/preact/blob/master/src/render.js) initially converts the virtual DOM tree into an actual DOM tree mounted at _el_.
  Subsequent changes are [diffed](https://github.com/preactjs/preact/blob/master/src/diff/index.js), and only the difference is applied to the DOM.

<!--
Recall the three pillars: HTML, CSS and JavaScript (JS), born in the early 1990s.
Technically, only HTML is needed to create a website, because CSS can be included via _\\<style\\>_ tags and JS via _\\<script\\>_ tags.
But of the three pillars, JS is the only programming language, the only way to dynamically change HTML and CSS.
For reasons of uniformity, it is increasingly common for the initial HTML and CSS to be generated by JS too.
-->

So React function components are JavaScript functions.
They are written using XML syntax via JSX, and are composed together in the same way as HTML.
There's a lot more to say about them e.g. how they represent internal state.
But we've said more than enough for now.
We'll close this subsection with two related remarks.

#### Preact vs React

This website is built using Preact, a popular alternative to React with the same API.
It has a much smaller codebase (easier to understand),
and provides hooks into its underlying operations (allowing performance monitoring).
Preact has a reputation for being faster,
although React has a _much_ wider scope via [custom renderers](https://github.com/chentsulin/awesome-react-renderer).
    
#### CSS in JavaScript

Traditionally, CSS is provided in separate files (possibly transpiled from SCSS), linked in the _\\<head\\>_ and referenced by DOM elements via their class attribute.
Since JSX extends JS and _class_ is a [reserved word](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class),
React uses the _className_ attribute instead.

Both _PanZoom_ and _PanZoomDemo_ are styled using CSS-in-JS.
This means the CSS is written inside JS or JSX files, often together with the React components it applies to.
We use the npm module [goober](https://www.npmjs.com/package/goober).

### Physics Engine

__TODO__ from here

- Raycast test
- Dynamic collison test

### Static and Runtime Analysis

- Typescript via JSDoc, refering to CodeSandbox.
- Terminal + Preact hooks
- Terminal + Game AI

### Comments

- Display GitHub comments from Issue (build-time)
- Can use anonymous credits to get recent

---

## Starship Geomorphs <float rem="1.2">19th July 2021</float>

__TODO__ 
- GeomorphDemo
- prepare CodeSandbox links for GeomorphDemo
        `}/>

        <GeomorphTest />

        <Markdown children={`

---

## Movement <float rem="1.2">19th July 2021</float>

- Navigation
- Follow camera
- Map view
- Support mobile too
- CodeSandbox
        `}/>

        <br/>
        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env.test} />
        </section>

        <br/>

        <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
        `}/>

      </section>
    </div>
  );
}

const env = {
  test: {},
};
