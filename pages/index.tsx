import { useEffect } from 'react';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';
import TeleglitchModule from 'components/level/teleglitch-module';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
  # esc the base

  a topdown web game built step-by-step
    `}/>

        <Markdown children={`
## Statement of Intent

This site has a clear objective: _build a topdown game step-by-step using modern web development techniques_. In the process we will:
- see how websites are often built.
- see how complex games can be built.
- have a lot of fun doing it. 

Our underlying motivation is _to explain how web development works_. But a proper explanation requires a reasonably complex web application. Most websites derive their structure from a prexisting business, a large user base, or a rich data source. Lacking all three, we chose something with a universal appeal i.e. a computer game.


_TODO_

        `}/>

        <br/>
        <TeleglitchModule/>

        <Markdown children={`
_TODO hookup babel transpilation of jsx using forked @babel/standalone_
        `}/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <section style={{ height: 400 }}>
          <CodeEditor codeKey="file.js" />
        </section>

        <Markdown children={`
  This is an example of a [command link](# "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
