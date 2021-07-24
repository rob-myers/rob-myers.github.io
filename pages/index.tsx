import { useEffect } from 'react';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';
import { initialCode } from 'model/code/code.lib';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
# react retrace

tracing frontend development
        `}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">19th July 2021</float>

Frontend web development is something of a dark art.
Many still believe JavaScript is an inferior language, despite the lack of any fair comparison:
> _the only programming language web browsers understand is JavaScript_.

Its syntax is often criticised. This certainly _was_ a problem, but has been solved over the last 10 years via language revisions, intellisense, TypeScript and code-transforms.
Some engineers even view the declarative nature of HTML and CSS with suspicion. Again, what is the alternative?

On the other hand, detractors may just be reacting to the _unreasonable hype surrounding web apps_. Those held in highest esteem are really testaments to Advertising, Chat and Consumerism, rather than Technology.
Nevertheless, an adversarial viewpoint is a waste of time. We can expect richer frontend web apps in the future via [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly).

<!-- JavaScript's syntax is often criticised. It _was_ a real problem, but has been solved over the last 10 years via language revisions, linting, intellisense, code-transforms and TypeScript. The downside is the number of devtools needed. To get started one can use project CLIs  -->

_TODO start to explain our objective here_

Web applications are built from _components_ (resuable parts) satisfying assertions called _tests_. Components are tested individually via _unit tests_, and also collectively. Frontend developers alternate between updating components and updating these assertions, amongst other tasks. Sometimes they fix stale tests; sometimes they extend components to satisfy a test. By listing the expected functionality, tests also provide important documentation.

These tests often amount to traces: a sequence of user input vs rendered output.

_TODO tests are usually traces, but how do we trace a component? Still aim towards modelling with static-analysis and traces_

Typically, a test specifies an expected trace through the system. Given a particular initial state and some user interaction, we expect particular output(s).

> _TODO objective should focus on logging traces_

> _TODO codemirror example with two panes, possibly terminal too_

The objective of this website is:

> _to rethink how unit tests are written, by generating them automatically through interactivity_.

### Birdseye view

We'll use static analysis to construct a _model_ of each component. One can think of it as a partially specified state-machine. By interacting with the component we can _play-in_ assertions (record input/output), thereby enriching the model. Finally we'll use the model to generate unit tests, coverage reports, and also answer queries.


### Intended implementation

We eventually aim to build a system similar to [Storybook](https://storybook.js.org/). But for now we'll built it __directly on this website__, using well-established technologies.

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

### All the fun of the fair

Instead of writing unit tests as code, we are going to create them interactively. But for the process to be fun, the components must be fun to work with. We'll draw from two sources:
- popular projects freely available on GitHub.
- a topdown game we are going to build step-by-step.

_TODO_ ...

        `}/>

        <section style={{ background: '#000', height: 110 }}>
          <CodeEditor
            height="auto"
            padding="24px"
            readOnly
            code={`
function f(x, y) { return (x - 1) / (y - 1); }
// or alternatively:
const f = (x, y) => (x - 1) / (y - 1);
          `} />
        </section>

        <Markdown children={`
_TODO_ ...

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
