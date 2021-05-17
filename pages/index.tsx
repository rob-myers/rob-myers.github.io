import Head from 'next/head'
import styled from "@emotion/styled";

import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/code-library'

import Header from 'components/page/Header';
import Stage from 'components/stage/WrappedStage'
import Terminal from 'components/sh/Terminal'
import CodeEditor from 'components/code/code-editor';
import { usePage } from 'components/hooks';
import { Section } from 'components/page/Section';

export default function IndexPage() {
  usePage({ stageKeys: ['test'] });

  return (
    <>
      <Head>
        <title>Programmed Behaviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Header />

          <Section>
            I remember first controlling the pixels of a long since discarded television.
            A grey button of a ZX Spectrum was pressed, and the avatar moved.
            So virtual words exist.
            They can be created.
          </Section>

          <section>
            {/* <Stage stageKey="test" /> */}
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

  @media(max-width: 1024px) {
    margin: 0 3rem;
    justify-content: unset;
  }
  @media(max-width: 800px) {
    margin: 0;
  }
  > div {
    max-width: 1000px;
  }
`;

const Env = styled.section<{}>`
  display: grid;

  grid-template-columns: minmax(auto, 500px) minmax(auto, 500px);
  grid-template-rows: 400px 400px;
  grid-template-areas: 
    "stage stage"
    "terminal code";

  @media(max-width: 1248px) {
    grid-template-columns: minmax(auto, 400px) minmax(auto, 400px);
  }
`;
