import { useEffect } from 'react';
import { css } from '@emotion/react';

import useCodeStore from 'store/code.store';
import { initialCode } from 'model/code/code.lib';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { TabsDemo } from 'components/page/Tabs';
import PanZoom from 'runtime/components/PanZoom';

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

Roguelike; Built online; AI focus
        `}/>

        <Markdown children={`

## Objectives <float rem="1.2">19th July 2021</float>

We are going to build a game step-by-step directly on this website.
It will be a realtime [roguelike](https://en.wikipedia.org/wiki/Roguelike).
As an important side-effect, we'll see how frontend development works.

### Constraints

For such a project to take shape, a large number of decisions must be made. Here are some of the most important ones.

- Use styled [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) instead of HTMLCanvas or WebGL.
- Use React [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) and Emotion [styled components](https://emotion.sh/docs/styled).
- Use a realtime birdseye camera, inspired by [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch).
- Use procedural level generation, following Teleglitch's method.
- Use simple individual [NPC](https://en.wikipedia.org/wiki/Non-player_character) behaviours, combinable in many ways, to create understandable, repeatable and emergent behaviour.

<!-- It is worth explaining the motivation behind these decisions. -->
Starting and _finishing_ a game is notoriously hard.
The creator of Spelunky suggested [three requirements](https://makegames.tumblr.com/post/1136623767/finishing-a-game).

#### Games I want to make (why the process will be fun)

Experimenting with Game AI (NPC behaviour) can be great fun.
We will combine simple behaviours to obtain complex ones,
the latter arising from the environment and agent interaction, rather than individual thinking or scripted behaviour.
Personally, I really enjoy making artificial worlds and watching them tick.

#### Games I want to have made (caring about the end result)

We'll draw inspiration from [NetHack](https://www.nethack.org/) and other roguelikes - notably Teleglitch. NetHack's 34 year history shows _we needn't spell a story out_.  Teleglitch shows [Quake](https://en.wikipedia.org/wiki/Quake_(video_game))-style gameplay is achievable from a topdown perspective. Roughly speaking, we intend to extend Teleglitch's game mechanic with more complex NPC behaviour, inspired by other roguelikes.

Due to our step-by-step approach, we'll break the end result down into a number of _hurdles_. Here's the first one we care about:
> __First hurdle__. ok


_why do we care about the end result? Could specify 1st hurdle e.g. can move and look with tracking camera on desktop/mobile/CodePen_

#### Games I’m good at making (suitable experience)

Web dev

We're using web development to create the game.
This permits us to build it step-by-step on this website.
We'll display code using [CodeMirror](https://codemirror.net/), transpile [JSX](https://reactjs.org/docs/introducing-jsx.html) using [Babel](https://babeljs.io/) in a webworker, and load modules using the module loader [SystemJS](https://github.com/systemjs/systemjs). We'll also use an in-browser terminal for analysis.

### Stepwise


        `}/>

        <section css={css`width: 400px; height: 400px; position: relative;`}>
          <PanZoom uid="test">
            {/* TODO */}
            <rect x={5} y={5} width={20} height={20} fill="red" />
          </PanZoom>
        </section>

        <Markdown children={`

## Components

_TODO rewrite as 'technology we will use'_

Competing web frameworks exist in the wild, often with their own notion of component.
A popular approach is to use [React functional components](https://reactjs.org/docs/components-and-props.html#function-and-class-components) i.e. _JavaScript functions_ which:
- have a single parameter, conventionally called _props_.
- return a virtual [DOM node](https://developer.mozilla.org/en-US/docs/Web/API/Node).

The single argument _props_ is a JavaScript object defining the component's named inputs.
But what is a _virtual_ DOM node?
First consider how they denoted, via syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html).

_TODO move code inside layout manager_
        `}/>

        <TabsDemo/>

        <br/>

        <Markdown children={`
_TODO support typescript syntax highlighting so can show preact types [Options](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L23) and [VNode](https://github.com/preactjs/preact/blob/7e33abd70ceb32f19e82c281e6b4d35091920f6a/src/internal.d.ts#L96)_

Recall that the only programming language web browsers natively understand is JavaScript.

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

_TODO examples of complex apps built with web dev techniques, e.g. via [Electron](https://www.electronjs.org/) (VSCode and Slack), e.g. via React Native, e.g. the beginnings of WebAssembly_


### Birdseye view

### Intended implementation

We are going to built the game __directly on this website__, using well-established technologies.

<table>
    <tr>
      <th>Concept</th>
      <th>Browser Technology</th>
    </tr>
    <tr>
      <td>Code Editor</td>
      <td><a href="https://codemirror.net/">CodeMirror</a> for viewing and editing JavaScript.</td>
    </tr>
    <tr>
      <td>Component</td>
      <td>
        <a href="https://reactjs.org/docs/components-and-props.html#function-and-class-components">React function components</a> i.e. JavaScript functions which use syntactic sugar known as <a href="https://reactjs.org/docs/introducing-jsx.html">JSX</a>.
      </td>
    </tr>
    <tr>
      <td>Styles</td>
      <td>
        Components can be enriched by runtime CSS. We'll use <a href="https://emotion.sh/">Emotion</a>.
      </td>
    </tr>
    <tr>
      <td>Component Framework</td>
      <td><a href="https://preactjs.com/">Preact</a>, a DOM-diffing alternative to React.</td>
    </tr>
    <tr>
      <td>Devtools</td>
      <td><a href="https://babeljs.io/">Babel</a> in a webworker; <a href="https://github.com/systemjs/systemjs">SystemJS</a> for module loading.</td>
    </tr>
    <tr>
      <td>Static analysis</td>
      <td>Eslint's <a href="https://github.com/eslint/espree">parser and tokenizer</a>.</td>
    </tr>
    <tr>
      <td>Live analysis</td>
      <td>Monitoring via <a href="https://preactjs.com/guide/v10/options/">Preact option hooks</a>, code transforms and our own in-browser terminal.</td>
    </tr>
</table>


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
            code={initialCode['file.js']}
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
