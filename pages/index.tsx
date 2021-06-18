import Head from 'next/head'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Markdown from 'components/page/Markdown';
import Stage from 'components/stage/WrappedStage';
import { usePage } from 'components/hooks';
import { CodeEdit } from 'components/dynamic';
import { Section, SideBySide } from 'components/page/Layout';

export default function IndexPage() {
  usePage({
    views: [
      { stageKey: 'test@intro', viewKey: 'va:test@intro' },
      { stageKey: 'test@intro', viewKey: 'vb:test@intro' },
    ],
    codes: ['file.js'],
  });

  return (
    <>
      <Head>
        <title>Three.js Behaviours</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Header />

          <Section>
            <Markdown children={`
## Introduction
            
This website is concerned with _Game AI_ i.e. those algorithms controlling the behaviour of non-player characters. We are going to provide many examples of these algorithms; we'll also combine them in numerous ways. Importantly, the provided code can be executed directly on this site. For example:`}
            />

          </Section>
          <SideBySide height={350}>
            <Stage
              stageKey="test@intro"
              viewKey="va:test@intro"
            />
            <CodeEdit codeKey="file.js"/>
          </SideBySide>

          {/* <section>
            <Env>
              <Stage stageKey="test@intro" viewKey="va:test@intro" gridArea="view-a"/>
              <Stage stageKey="test@intro" viewKey="vb:test@intro" gridArea="view-b"/>
              <CodeEdit codeKey="file.js"/>
            </Env>
          </section> */}

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
