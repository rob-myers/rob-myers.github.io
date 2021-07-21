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
# react re-spec

towards integrated unit testing
        `}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">19th July 2021</float>

Web applications are built from _components_ satisfying assertions called _unit tests_. Frontend developers alternate between updating components and updating the respective assertions (amongst other tasks). Sometimes they fix stale tests; sometimes they extend a component to satisfy a test. The tests also provide important documentation by listing expected functionality.

Typically, unit tests are written using code - in much the same way as components are.

> _TODO codemirror example with two panes_

The objective of this website is:
> _to rethink how unit tests are written, by generating them automatically through interactivity_.

#### A birdseye view

We'll use static analysis to construct a _model_ of each component. One can think of it as a partially specified state-machine. By interacting with the component we can _play-in_ assertions (record input/output), thereby enriching the model. Finally we'll use the model to generate unit tests, coverage reports, and also answer queries.

Our ultimate aim is to build a system similar in spirit to [Storybook](https://storybook.js.org/), where components/models/tests can be viewed and edited.

#### Intended implementation

The system will be built step-by-step on this website, using well-established technologies.

- By _component_ we mean a [_React function component_](https://reactjs.org/docs/components-and-props.html#function-and-class-components). They are JavaScript functions where syntactic sugar known as [JSX](https://reactjs.org/docs/introducing-jsx.html) is permitted.

- To display and edit JavaScript code we'll use [CodeMirror](https://codemirror.net/).

- We'll _execute_ the components using [_Preact_](https://preactjs.com/), an important DOM-diffing alternative to React.
To support JSX and devtools we'll run [Babel](https://babeljs.io/) in a webworker. Modules will be loaded using [SystemJS](https://github.com/systemjs/systemjs).

- For _static analysis_ we will use eslint's [parser and tokenizer](https://github.com/eslint/espree). We may also use a [SAT solver](https://en.wikipedia.org/wiki/Boolean_satisfiability_problem#Algorithms_for_solving_SAT) to enumerate and constrain possible states.

- To _interactively specify assertions_ we'll use Preact and our own in-browser terminal. The latter is built using [xterm.js](https://Xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js).

- The generated unit tests will use [Jest](https://jestjs.io/) and [react-test-renderer](https://reactjs.org/docs/test-renderer.html). We may run them and display their results using our in-browser terminal.

<!-- A notable omission is TypeScript. -->

#### All the fun of the fair

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
