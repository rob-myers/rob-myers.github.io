import { code } from 'model/tabs-lookup';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { Tabs } from 'components/page/Tabs';

import ConnectDemo from 'projects/misc/ConnectDemo';

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
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike), set in space. We'll assume the role of Captain of the spaceship _Gehennom_.

As an important side-effect, a popular approach to frontend development will be presented. The underlying technology is the Markup language HTML, brought to life via CSS, SVG and JavaScript.

---

## Constraints <float rem="1.2">19th July 2021</float>

I've necessarily made a large number of decisions. Here are the important ones, from low-level to high-level.

- Concerning technology:
  - Make a browser-based game.
  - Use CSS/SVG/Images instead of HTMLCanvas/WebGL.
  - Use [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for physics.
  - Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and [Emotion](https://www.npmjs.com/package/@emotion/styled) CSS-in-JS styled components.
  - Use [Preact](https://www.npmjs.com/package/preact) instead of React.
  - Use [NextJS](https://nextjs.org/) as our development environment.
- Concerning game mechanics:
  - Use a realtime birdseye camera, like [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch). 
  - Use procedural level generation, permitting spaceship building/docking.
  - Use the physics engine [Rapier](https://www.npmjs.com/package/@dimforge/rapier2d).
  - Use graphics based on [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html).
  - Use explicitly illustrated NPC decisions as a game mechanic.
- Concerning the setting:
  - The game will be called _Rogue Markup_.
  - The player captains the spaceship _Gehennom_, working for _Unified Transport_.
  - Missions involve personnel transport, cargo transport, and hauling.

Over time we'll clarify these constraints.
But first we emphasise: _finishing a game is really fucking hard_.
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
The underlying missions amount to going from A to B (🎵 ever was it so).
Monotony will be overcome via mission specifics, encountered NPC behaviours, procedural generation, and ship building.
Functionally, think [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) where you can _place_ [room modules](https://steamcommunity.com/sharedfiles/filedetails/?id=175359117) when upgrading or docking.
Graphically, see [Starship Geomorphs 2.0](http://travellerrpgblog.blogspot.com/2018/10/the-starship-geomorphs-book-if-finally.html).

Importantly, it should be easy for other people to extend this game.
We'll achieve this by providing source code, escape hatches to [StackBlitz](https://stackblitz.com/) and [CodeSandbox](https://codesandbox.io/), and clear explanations.
Comments will be shown, so [GitHub](https://github.com/) users can share ideas and links.

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
| Styles | CSS-in-JS styled components via [Emotion](https://www.npmjs.com/package/@emotion/styled). |
| Component Framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Static analysis | [ESLint](https://www.npmjs.com/package/eslint) and also TypeScript via [JSDoc comments](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). |
| Live analysis | [Preact option hooks](https://preactjs.com/guide/v10/options/) and _our own in-browser terminal_. |
| Code viewing | [CodeMirror](https://codemirror.net/) for viewing JavaScript on this site. [FlexLayout](https://github.com/caplin/FlexLayout) provides draggable tabs. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) and [StackBlitz](https://stackblitz.com/) links, using React. |
| Code sharing | [GitHub](https://github.com/) comments (shown on site) e.g. referencing CodeSandbox, StackBlitz. GitHub [repo](https://github.com/rob-myers/rob-myers.github.io) for this site. |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->

Typically we'll present a "project" as a number of tabs, consisting of source code _foo/bar.jsx_, and another tab i.e. the rendered output.


### Quick intro to React

Competing web frameworks exist in the wild, often with their own notion of component.
One popular approach uses React functional components i.e. _JavaScript functions_ which:
- have a single parameter, conventionally called _props_.
- return a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

The argument _props_ is a JavaScript object e.g. \`{ meaningOfLife: 42, ... }\`, defining the component's named inputs.
What is a _virtual_ DOM node?
Well, first consider how they are usually denoted, via syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html).

__TODO__ 
- demo app ConnectDemo
- prepare CodeSandbox link for PanZoom ✅
- prepare StackBlitz and CodeSandbox links for ConnectDemo
- tabbed ConnectDemo here, also with transpiled JSX
- brief overview and point to StackBlitz/CodeSandbox links
- brief discussion of VNode types, using typescript syntax highlighting
  - support typescript syntax highlighting on this site, so can show preact types [Options](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L23) and [VNode](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L96). We'll use Preact on this site, and React on the sandboxes.

        `}/>

        <Markdown children={`

### Hurdle: two viewpoints

__TODO__ introduce our first hurdle

We begin by making the game viewpoints _viewable_.
- Implement a pannable zoomable grid.
- Implement a movable character & Teleglitch-style camera.
- Support switching between these two viewpoints.
- Support desktop & mobile; can optionally run code on [StackBlitz](https://stackblitz.com/) and [CodeSandbox](https://codesandbox.io/).

---

## Pannable Zoomable Grid <float rem="1.2">19th July 2021</float>

        `}/>

        <ConnectDemo />

        <Tabs tabs={[
          { key: 'component', filepath: 'panzoom/PanZoomDemo.jsx' },
          { key: 'code', filepath: 'panzoom/PanZoom.jsx' },
        ]} />

        <br/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <section style={{ background: '#000', height: 400 }}>
          <CodeEditor
            height="400px"
            code={code['panzoom/PanZoom.jsx']}
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
