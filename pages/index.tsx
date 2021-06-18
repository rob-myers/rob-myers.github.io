import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Stage from 'components/stage/WrappedStage'
import { usePage } from 'components/hooks';
import { CodeEdit } from 'components/dynamic';
import { Section } from 'components/page/Section';

export default function IndexPage() {
  usePage({
    stageKeys: ['test@intro'],
    codeKeys: ['file.js'],
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
            <ReactMarkdown children={`
## Introduction
            
This website is about virtual characters and their environments.
By virtual we mean _created via software and interacted with via software_.
They mostly occur in video games, although real robots often have virtual counterparts in [robotic simulators](https://en.wikipedia.org/wiki/Robotics_simulator).

Video games usually provide a _setting_, a lot of _design_ representing the setting and characters, and also some kind of _progression_. Although these three aspects breathe life into the game, they are also burdens.


            `} />
          </Section>

          <section>
            <Env>
              <Stage stageKey="test@intro"/>
              <CodeEdit codeKey="file.js"/>
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

  grid-template-columns: 1000px;
  grid-template-rows: 400px 400px;
  grid-template-areas: 
    "stage"
    "code";

  @media(max-width: 1248px) {
    grid-template-columns: 800px;
  }
  @media(max-width: 1024px) {
    grid-template-columns: calc(100vw - 6rem);
  }
  @media(max-width: 800px) {
    grid-template-columns: 100vw;
    grid-template-rows: 350px 300px;
  }
`;
