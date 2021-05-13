import Head from 'next/head'
import styled from "@emotion/styled";

import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/code-library'

import Stage from 'components/stage/PersistedStage'
import Terminal from 'components/sh/Terminal'
import CodeEditor from 'components/text/code-editor';

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>three.js CLI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>
          three.js CLI
        </Title>

        <Subtitle>
          Richer demos via interactive sessions
        </Subtitle>

        <Env>
          <Stage stageKey="test" />
          <Terminal
            sessionKey="demo"
            env={{
              [CoreVar.STAGE_KEY]: "test",
              [CoreVar.PROFILE]: profiles.first,
            }}
          />
          <section style={{ maxHeight: 100, overflow: 'scroll', background: '#000' }}>
            <CodeEditor />
          </section>
        </Env>

      </Main>
    </>
  );
}

const Main = styled.main<{}>`
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media(max-width: 800px) {
    padding: 2rem 0;
  }
`;

const Title = styled.h1<{}>`
  margin: 0;
  line-height: 1.15;
  font-size: 4.5rem;
  display: flex;

  @media(max-width: 800px) {
    font-size: 3.5rem;
  }
`;

const Subtitle = styled.p<{}>`
  margin-bottom: 38px;
  margin-top: 20px;
`;

const Env = styled.section<{}>`
  display: grid;
  grid-template-rows: 1fr 1fr;

  > section {
    height: 400px;
    max-width: 800px;
    width: 100vw; 
  }
`;
