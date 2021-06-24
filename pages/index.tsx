import { useEffect } from 'react';
import Head from 'next/head'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Markdown from 'components/page/Markdown';
import { CodeEdit } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { Section } from 'components/page/Layout';
import useCodeStore from 'store/code.store';

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <>
      <Head>
        <title>env codev</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Header />
          <Section>
            <Markdown children={`
## Introduction

Aims...

`}/>
        </Section>
        <section style={{ height: 300 }}>
          <CodeEdit codeKey="file.js"/>
        </section>

        <section style={{ height: 300 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        </div>
      </Main>
    </>
  );
}

const env = {};

const Main = styled.main<{}>`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
  > div { max-width: 1000px; }

  @media(max-width: 1248px) {
    > div { max-width: 800px; }
  }
  @media(max-width: 1024px) {
    margin: 0 3rem;
    justify-content: unset;
  }
  @media(max-width: 700px) {
    margin: 0;
  }
`;
