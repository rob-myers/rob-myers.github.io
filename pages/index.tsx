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
          <CodeEditor />
        </Env>

      </Main>
    </>
  );
}

const Env = styled.section<{}>`
  display: grid;
  grid-template-columns: minmax(auto, 400px) minmax(auto, 400px);
  grid-template-rows: 400px 400px;
  grid-template-areas: 
    "stage stage"
    "terminal code";
`;

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
