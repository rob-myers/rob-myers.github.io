import { code } from 'model/tabs-lookup';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { Tabs } from 'components/page/Tabs';

import GeomorphTest from 'projects/geomorph/GeomorphTest';

const env = {};

export default function IndexPage() {
  return (
    <Main>
      <Section>

        <Markdown title children={`
# Rogue Markup

Roguelike; Built online; Game AI focus
        `}/>

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
- Use [Preact](https://www.npmjs.com/package/preact) instead of React and [Goober](https://www.npmjs.com/package/goober) instead of [Emotion](https://www.npmjs.com/package/@emotion/styled).
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
| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. JavaScript functions using syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html). |
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

- They have a single parameter, conventionally called _props_.
  > It is a JavaScript object defining named inputs and the special properties _children_, _key_ and _ref_.
- They must return either null or a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).
  > It amounts to an HTML fragment which should be rendered.

Let's try to understand how React function components actually work.
Consider some code:
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

The file _panzoom/PanZoom.jsx_ defines two React function components i.e. _PanZoom_ and _Grid_.
The component _PanZoom_ defines a pannable and zoomable grid.
You can seen it in action by clicking the other tabs above, or by viewing [this CodeSandbox](https://codesandbox.io/s/rogue-markup-panzoom-yq060?file=/src/panzoom/PanZoom.jsx "@external").
Semantically:
- _PanZoom_ renders an SVG consisting of its children (the red square in the demo) and _Grid_. It adjusts the [SVG viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) in response to mouse/pointer events.
- _Grid_ renders part of an SVG i.e. a grid obtained by repeating a 10x10 unit pattern.

But how does this actually work?

PanZoom and Grid return something which looks like HTML, but isn't.
Recall the three pillars: HTML, CSS and JavaScript (JS), born in the early 1990s.
Technically, only HTML is needed to create a website, because CSS can be included via _\\<style\\>_ tags and JS via _\\<script\\>_ tags.
But of the three pillars, JS is the only programming language, the only way to dynamically change HTML and CSS.
For reasons of uniformity, it is increasingly common for the initial HTML and CSS to be generated by JS too.

Although JavaScript can be directly embedded inside HTML,
one cannot write fragments of HTML syntax inside JS without using strings.
React developers use a grammatical extension of JS called [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)) (see our code above),
naturally combining JavaScript and XML syntax.
It is the canonical way to write React components, and becomes meaningful when it is transpiled (converted) back into JavaScript:
        `}/>

        <Tabs
          tabs={[
            { key: 'code', filepath: 'example/without-jsx.js', folds: [{ line: 9, ch: 0 }] },
            { key: 'code', filepath: 'example/with-jsx.jsx' },
          ]}
          height="400px"
        />

        <Markdown children={`
The angled XML brackets are replaced by invocations of a specific function i.e. _React.createElement_.
Its parameters are determined by the local structure of the XML tag.
The 1st corresponds to the tag name,
the 2nd to the tag's attributes, and the rest to the tag's children.
The recursive nature of XML is replaced by the recursive nature of function calls.
Then to understand what PanZoom and Grid are returning _we need to understand React.createElement_.

This website is built using Preact, a popular alternative to React.
Technically speaking, _react_ and _react-dom_ are understood as aliases for the npm module [@preact/compat](https://www.npmjs.com/package/@preact/compat).
I chose Preact because it has the same API as React, but with a much smaller codebase, making it much easier to understand.
Then React.createElement refers to Preact's createElement, which amounts to the following code:
        `}/>

        <section>
          <CodeEditor
            height="300px"
            code={code['example/create-element.js']}
            lineNumbers
            readOnly
          />
        </section>

        <Markdown children={`

The above creates a Preact VNode i.e. a JavaScript object with properties _type_, _props_, _key_, _ref_, and some additional internal ones. 


__TODO__
- simplified version of Preact [createElement](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/create-element.js#L14)
- createElement for case of function component
- explain ReactDOM.render
- our interest in performance

<!-- Consider how they are usually denoted, via syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html). -->

### Physics Engine

- Raycast test
- Dynamic collison test

### Static and Runtime Analysis

- Typescript via JSdoc, refering to CodeSandbox.
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

## Realtime Camera <float rem="1.2">19th July 2021</float>

We begin by making the game viewpoints _viewable_.
- Implement a pannable zoomable grid.
- Implement a movable character & Teleglitch-style camera.
- Support switching between these two viewpoints.
- Support desktop & mobile; can optionally run code on [CodeSandbox](https://codesandbox.io/).


        `}/>

        <br/>
        <br/>

        <section>
          <CodeEditor
            height="300px"
            code={code['panzoom/PanZoom.jsx']}
            lineNumbers
            readOnly
            folds={[{ line: 9, ch: 0 }]} // 1-based line 10
          />
        </section>

        <br/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
