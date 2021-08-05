import { useEffect } from 'react';
import useCodeStore from 'store/code.store';
import { initialCode } from 'model/code/code';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { TabsDemo } from 'components/page/TabsDemo';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
# Rogue Markup

Roguelike; Built online; Game AI focus
        `}/>

        <Markdown children={`

## Objective <float rem="1.2">19th July 2021</float>

We're going to build a game step-by-step, directly on this website.
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike), set in space. We'll assume the role of Captain of the spaceship _Gehennom_.

As an important side-effect, we'll see how modern frontend development works. Our technology of choice is the Markup language HTML, particularly [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics), brought to life via CSS and JavaScript.

---

## Constraints <float rem="1.2">19th July 2021</float>

I've made a number of decisions. Here are the important ones, from low to high-level.

- Use browser-based technologies.
- Use CSS and [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) instead of HTMLCanvas or WebGL.
- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and Emotion [styled components](https://emotion.sh/docs/styled).
- Use a realtime birdseye camera, inspired by [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch).
- Use procedural level generation, following Teleglitch's method.
- Use spaceship building and docking to justify procedural generation.
- Use simplistic individual [NPCs](https://en.wikipedia.org/wiki/Non-player_character), combinable in many ways, yielding understandable, repeatable and emergent behaviour. Avoid scripted behaviour.
- Player captains a spaceship, providing transport, hauling and shipping services.

Over time we'll clarify the above constraints.
But first we must emphasise: _finishing a game is notoriously hard_.
Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game). We'll now address them.

### 1. Fun to develop (Games I want to make)

Experimenting with Game AI (NPC behaviour) is fun.
Complexity will arise from the environment and agent interaction, rather than complex individual thinking or scripted behaviour.
Simple interacting robots fits the space travel theme nicely.
They're also analogous to UI components: parallel systems with some intercommunication.


### 2. The Result (Games I want to have made)

As an end result I want a _highly replayable space travel game_.
The underlying missions amount to going from A to B (ever was it so).
Monotony will be overcome via mission specifics, interesting encounters, the ability to choose the route, and ship building.
Think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) where you can place "[modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117)" when upgrading or docking.

Importantly, I also want the game to be extensible.
We'll achieve this by providing source code, escape hatches to [StackBlitz](https://stackblitz.com/), and clear explanations.
Comments will be shown, so that [GitHub](https://github.com/) users can share their own StackBlitz links.

<!--
[NetHack](https://en.wikipedia.org/wiki/NetHack)'s ≥ 34 year history shows _we needn't spell out a story_.
Teleglitch shows survival-horror is achievable from a birdseye perspective. We'll adapt Teleglitch's procedural generation, viewpoint, and dread.
-->

<!--
We'll add cameras, guards, doors, keys, weapons etc.
All NPC decisions will be depicted graphically, such as future navpaths with probabilistic branches. The player must get from A to B (_ever was it so_), the encountered behaviour being the interesting bit.
-->

### 3. Experience (Games I’m good at making)

I work as a web developer, using React & Emotion on a daily basis. 
I have a [strong background](https://dblp.org/pid/81/8748.html) in Theoretical Computer Science,
so I won't confuse Game AI with AI, nor fall prey to the Deep Learning hype.
I have also created similar game mechanics _many_ times over the years.
Here's hoping my chain of unfinished projects is coming to a close!


---

## Plan <float rem="1.2">19th July 2021</float>

### Running code

We are going to build a game directly on this website.
We'll not only provide the source code, but also a kind of _development environment_.
Typically an example project will be presented as a number of tabs, consisting of source code files _foo/bar.jsx_, and a single tab named _App_ - the rendered output of the collective source code.
In order to render the source, we'll [transpile](https://stackoverflow.com/a/44932758/2917822) it using [Babel](https://babeljs.io/) in a webworker and load using [SystemJS](https://github.com/systemjs/systemjs).

This is a non-standard approach.
Usually frontend developers write code on their own computers using their own development environment.
In production (i.e. on a website) the code has already been transpiled and minified, so the browser can immediately render it. __FROM HERE__

__TODO__ intended implementation table here

__TODO__ describe online dev env approach

### A Tale of Two Viewpoints

We begin by making the game viewpoints _viewable_.

- Implement a pannable zoomable grid.
- Implement a movable character & Teleglitch-style camera.
- Support switching between these two viewpoints.
- Support desktop & mobile; can optionally run code on [StackBlitz](https://stackblitz.com/).

<!-- We need an approximation of a development environment:
> We'll display code using [CodeMirror](https://codemirror.net/), transpile it from [JSX](https://reactjs.org/docs/introducing-jsx.html) via [Babel](https://babeljs.io/) in a webworker, and load using [SystemJS](https://github.com/systemjs/systemjs). We'll provide a terminal, and escape hatches to StackBlitz. -->

---

## Pannable Zoomable Grid <float rem="1.2">19th July 2021</float>

        `}/>

        <TabsDemo/>

        <Markdown children={`

_TODO rewrite below_

Competing web frameworks exist in the wild, often with their own notion of component.
A popular approach is to use [React functional components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. _JavaScript functions_ which:
- have a single parameter, conventionally called _props_.
- return a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

The single argument _props_ is a JavaScript object defining the component's named inputs.
But what is a _virtual_ DOM node?
First consider how they denoted, via syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html).


_TODO support typescript syntax highlighting so can show preact types [Options](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L23) and [VNode](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L96)_

        `}/>

        <section style={{ background: 'black', height: 212 }}>
          <CodeEditor
              height="auto"
              padding="16px 0"
              lineNumbers
              readOnly
              code={`
import { useState } from '@test/preact/hooks';

export default function App() {
  const [n, setN] = useState(1);
  return (
    <div onClick={_ => setN(n + 1)}>
      {[...Array(n)].map(i => <div key={i}>Hello, world!</div>)}
    </div>
  );
}
          `} />
        </section>

        <Markdown children={`

<br/>


### Intended implementation

We are going to built the game __directly on this website__, using well-established technologies.

| Concept | Browser Technology |
| - | - |
| Code Editor | [CodeMirror](https://codemirror.net/) for viewing and editing JavaScript. |
| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. JavaScript functions which use syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html) |
| Styles | Components can be enriched by runtime CSS. We'll use [Emotion](https://emotion.sh/). |
| Component Framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Devtools | [Babel](https://babeljs.io/) in a webworker; [SystemJS](https://github.com/systemjs/systemjs) for module loading. |
| Live analysis | Monitoring via [react option hooks](https://preactjs.com/guide/v10/options/), code transforms and our own in-browser terminal. |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->

<!-- A notable omission is TypeScript. -->

        `}/>

        <Markdown children={`

_TODO hookup babel transpilation of jsx using forked @babel/standalone_
        `}/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <section style={{ background: '#000', height: 400 }}>
          <CodeEditor
            height="400px"
            code={initialCode['PanZoom.jsx']}
            lineNumbers
          />
        </section>

        <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
