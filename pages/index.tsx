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

towards integrated unit-testing
        `}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">19th July 2021</float>

Web applications are built from _components_ satisfying assertions called _unit tests_. Frontend developers alternate between updating components and updating the respective assertions (amongst other jobs). Sometimes they fix stale tests; sometimes they extend a component to satisfy a test. Unit tests also provide important documentation by explicitly describing expected functionality.

The objective of this website is:
> to reintegrate unit-tests into the frontend development process, making them automatic, interactive and fun.

#### How we'll do it

Using static analysis we'll construct a _model_ of each component i.e. some kind of partially specified state-machine. By interacting with the component we can [play-in](https://link.springer.com/book/10.1007/978-3-642-19029-2) assertions (record input/ouput), thereby enriching the model. Finally we'll use the model to generate unit-tests, coverage reports, and answer queries.

Eventually we envisage a system not unlike [Storybook](https://storybook.js.org/), where components, models and their induced unit tests can be viewed.

#### How it'll be fun

Instead of writing additional code we're going to create unit-tests via interaction, which is more meaningful and more enjoyable. But for the process to be fun, the components should be fun to work with. We'll provide a large number of examples:
- from projects freely available on GitHub.
- from a topdown game we'll build step-by-step.


_TODO_ ...

        `}/>

        <section style={{ background: '#000', height: 94 }}>
          <CodeEditor
            height="auto"
            padding="16px 24px"
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
