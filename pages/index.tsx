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

We are going to build a game step-by-step.
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike), set in space. We'll assume the role of Captain of the spaceship _Gehennom_.

As an important side-effect, a popular approach to frontend development will be exposed. Our underlying technology of choice is the Markup language HTML, particularly [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics), brought to life via CSS and JavaScript.

---

## Constraints <float rem="1.2">19th July 2021</float>

I've necessarily made a large number of decisions. Here are the important ones, from low-level to high-level.

- Use browser-based technologies.
  - Use CSS and SVG instead of HTMLCanvas or WebGL.
  - Use [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and Emotion [styled components](https://emotion.sh/docs/styled).
  - Use [Preact](https://preactjs.com/) instead of React.
- Use game mechanics inspired by [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) and other roguelikes.
  - Use a realtime birdseye camera.
  - Use procedural level generation, compatible with spaceship building/docking.
- Use explicitly illustrated NPC decisions as a game mechanic.
- The Player captains the spaceship _Gehennom_ and works for the corporation _Unified Transport_. Missions involve personnel transport, cargo transport, and hauling.

Over time we'll clarify the above constraints.
But first we must emphasise: _finishing a game is notoriously hard_.
Spelunky's creator suggested [three important requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game). We'll now address them.

### 1. Fun to develop (Games I want to make)

_Rogue Markup_ will be fun to develop because I enjoy experimenting with NPC behaviour, particularly in an open extensible way. One underlying motivation is the lack of Game AI resources available on the web. However, it is hard to discuss Game AI without actually building a game, so I chose a setting and game mechanics which seemed fun to me.

<!--
Complexity will arise from the environment and agent interaction, rather than complex individual thinking or scripted behaviour.
Simple interacting robots fits the space travel theme nicely.
They're also analogous to UI components: parallel systems with some intercommunication.
-->

### 2. The Result (Games I want to have made)

As an end result I want a _highly replayable space travel game_.
The underlying missions amount to going from A to B (ever was it so).
Monotony will be overcome via mission specifics, encountered NPC behaviours, procedural generation, and ship building.
Think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) where you can _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading or docking.

Importantly, I want the game to be extensible.
We'll achieve this by providing source code, escape hatches to [StackBlitz](https://stackblitz.com/) and [CodeSandbox](https://codesandbox.io/), and clear explanations.
Comments will be shown, so [GitHub](https://github.com/) users can share their own ideas and links.

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

## Technology and Hurdles  <float rem="1.2">19th July 2021</float>

We will build the game using the following technologies.

| Concept | Browser Technology |
| - | - |
| Component | React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. JavaScript functions using syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html). |
| Styles | Components will be styled using runtime CSS via [Emotion](https://emotion.sh/). |
| Component Framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Live analysis | Via [Preact option hooks](https://preactjs.com/guide/v10/options/) and our own in-browser terminal. |
| Code viewing | [CodeMirror](https://codemirror.net/) for viewing  JavaScript on the site. [FlexLayout](https://github.com/caplin/FlexLayout) provides tabs and windows. |
| Code editing | We'll provide links on [StackBlitz](https://stackblitz.com/), [CodeSandbox](https://codesandbox.io/). |
| Code sharing | [GitHub](https://github.com/) comments (shown on the site) and StackBlitz, CodeSandbox. |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->

<!-- A notable omission is TypeScript. -->

Typically we'll present a "project" as a number of tabs, consisting of source code _foo/bar.jsx_, and a single tab named _App_ (the output).


### Quick intro to React

Competing web frameworks exist in the wild, often with their own notion of component.
Currently, a very popular approach is to use React functional components i.e. _JavaScript functions_ which:
- have a single parameter, conventionally called _props_.
- return a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

The single argument _props_ is a JavaScript object defining the component's named inputs.
But what is a _virtual_ DOM node?
First consider how they are usually denoted, via syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html).

__TODO__ demo app where can connect polygons together

__TODO__ tabs with the code, transpiled jsx, and app

__TODO__ it works on StackBlitz and CodeSandbox

__TODO__ support typescript syntax highlighting so can show preact types [Options](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L23) and [VNode](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L96)

        `}/>

        <Markdown children={`

### Hurdle: two-viewpoints

__TODO__ introduce our first hurdle

We begin by making the game viewpoints _viewable_.
- Implement a pannable zoomable grid.
- Implement a movable character & Teleglitch-style camera.
- Support switching between these two viewpoints.
- Support desktop & mobile; can optionally run code on [StackBlitz](https://stackblitz.com/) and [CodeSandbox](https://codesandbox.io/).

---

## Pannable Zoomable Grid <float rem="1.2">19th July 2021</float>

        `}/>

        <TabsDemo/>

        <br/>

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
