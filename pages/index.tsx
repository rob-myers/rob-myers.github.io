import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Stage from 'components/stage/WrappedStage'
import { usePage } from 'components/hooks';
import { CodeEditor } from 'components/dynamic';
import { Section } from 'components/page/Section';
import BehTree from 'components/beh/BehTree';

export default function IndexPage() {
  usePage({
    stageKeys: ['test@intro'],
    codeKeys: ['file.js'],
  });

  return (
    <>
      <Head>
        <title>
          Three.js Behaviours
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Header />

          <Section>
            <ReactMarkdown children={`
## Introduction
            
Let's do this.

            `} />
          </Section>

          <section>
            <Env>
              <Stage stageKey="test@intro"/>
              <BehTree />
              <CodeEditor codeKey="file.js"/>
            </Env>
          </section>

        </div>
      </Main>
    </>
  );
}

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
  @media(max-width: 800px) {
    margin: 0;
  }
`;

const Env = styled.section<{}>`
  display: grid;

  grid-template-columns: 500px 500px;
  grid-template-rows: 400px 400px 400px;
  grid-template-areas: 
    "stage stage"
    "beh beh"
    "code code";

  @media(max-width: 1248px) {
    grid-template-columns: 400px 400px;
  }
  @media(max-width: 1024px) {
    grid-template-columns: calc(50vw - 3rem) calc(50vw - 3rem);
  }
  @media(max-width: 800px) {
    grid-template-columns: 100vw;
    grid-template-rows: 350px 300px 300px;
    grid-template-areas:
      "stage"
      "beh"
      "code";
  }
`;
