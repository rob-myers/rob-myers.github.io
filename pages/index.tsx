import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import styled from "@emotion/styled";

import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/sh.lib'

import Header from 'components/page/Header';
import Stage from 'components/stage/WrappedStage'
import Terminal from 'components/sh/Terminal'
import CodeEditor from 'components/code/code-editor';
import { usePage } from 'components/hooks';
import { Section } from 'components/page/Section';

export default function IndexPage() {
  usePage({
    stageKeys: ['test@intro'],
    codeKeys: ['file.js@demo'],
  });

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
            <ReactMarkdown children={`
## Introduction
            
When I first controlled the pixels of a long since discarded television, I felt a rush of excitement.
As I pushed the rubbery grey buttons of our ZX Spectrum, the avatar _moved_.
So virtual worlds can be created, and virtual characters too.

This website is about the behaviour of virtual characters.

            `} />
          </Section>

          <section>
            <Env>
              <Stage stageKey="test@intro" />
              <Terminal
                sessionKey="demo"
                env={{
                  [CoreVar.STAGE_KEY]: "test@intro",
                  [CoreVar.PROFILE]: profiles.first,
                }}
              />
              <CodeEditor
                codeKey="file.js@demo"
                sessionKey="demo"
              />
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

  > div {
    max-width: 1000px;
  }

  @media(max-width: 1248px) {
    > div {
      max-width: 800px;
    }
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
  grid-template-rows: 400px 400px;
  grid-template-areas: 
    "stage stage"
    "terminal code";

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
    "terminal"
    "code";
  }
`;
