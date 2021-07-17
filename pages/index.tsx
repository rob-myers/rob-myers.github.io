import { useEffect } from 'react';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
# markup worlds

aspects of game mechanics
    `}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">17th July 2021</float>

The objective of this site is:
> _to build partial game mechanics based on HTML, SVG and CSS, aiming towards complexity via composition._

<!-- In the process we will:
- see how websites are often built.
- see how complex games can be built.


Actually, our underlying motivation is _to explain how web development works. But a proper explanation requires a complex web application. Most well-known websites derive their structure from a prexisting business, a large user base, or a rich data source. Lacking all three, we have chosen something with universal appeal: a computer game. -->

_TODO_

        `}/>

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
