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

towards easier component design and testing
`}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">19th July 2021</float>

Web applications are built from _components_ with behavioural assertions called _unit-tests_. They must pass before new code can be submitted. Frontend developers alternate between updating components and updating tests. Sometimes they _fix stale tests_; sometimes they _extend the component_ to satisfy a test. The tests also provide important documentation by specifying the expected use cases.

The objective of this website is:
> to make unit-testing more automatic and interactive.

It can be made _more automatic_ via static analysis e.g. each component induces a partially-specified state machine. It can be made _more interactive_ by [playing-in](https://link.springer.com/book/10.1007/978-3-642-19029-2) specifications.


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
