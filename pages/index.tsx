import { useEffect } from 'react';

import { Header, Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEdit } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Header />
      <Section>
        <Markdown children={`

_TODO make this into "real thing" with ace-editor and babel transpilation_
      `}/>

      <section style={{ height: 200 }}>
        <Terminal sessionKey="test" env={env} />
      </section>

      <Markdown children={`

---

      `}/>
      </Section>

      <section style={{ height: 300, width: '100%' }}>
        <CodeEdit codeKey="file.js"/>
      </section>

    </Main>
  );
}
