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

Web applications are built from _components_ satisfying assertions called _unit tests_. Frontend developers alternate between updating components and updating the respective assertions (amongst other jobs). Sometimes they fix stale tests; sometimes they extend a component to satisfy a test. Unit tests also provide documentation, by enumerating expected use cases.

The objective of this website is:
> _to make unit-testing more automatic, interactive and fun_.

Concerning automation, we'll apply static analysis to obtain a partially-specified state machine from each component. Concerning interactivity, we want to [play-in](https://link.springer.com/book/10.1007/978-3-642-19029-2) assertions i.e. record input and desired states.


_TODO_ ...

        `}/>

          <CodeEditor
            height="auto"
            padding="16px 24px"
            readOnly
            code={`
function f(x, y) { return (x - 1) / (y - 1); }
// or alternatively:
const f = (x, y) => (x - 1) / (y - 1);
          `} />

        <Markdown children={`
_TODO_ ...

_TODO hookup babel transpilation of jsx using forked @babel/standalone_
        `}/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <CodeEditor
          height="400px"
          code={initialCode['file.js']}
          lineNumbers
        />

        <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
