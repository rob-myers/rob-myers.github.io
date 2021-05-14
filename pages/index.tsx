import Head from 'next/head'
import styled from "@emotion/styled";
import { useMemo } from 'react';
import * as portals from 'react-reverse-portal';

import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/code-library'
import { getWindow } from 'model/dom.model';

import Stage from 'components/stage/PersistedStage'
import StagePortal from 'components/stage/StagePortal';
import Terminal from 'components/sh/Terminal'
import CodeEditor from 'components/text/code-editor';

export default function IndexPage() {
  const stageNode = useMemo(() => getWindow() && portals.createHtmlPortalNode(), []);

  return (
    <>
      <Head>
        <title>Programmed Behaviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Title>
            Programmed Behaviour
          </Title>
          
          <Subtitle>
            Building bot behaviour, step by step
          </Subtitle>

          {stageNode && <portals.InPortal node={stageNode}>
            <Stage stageKey="test" />
          </portals.InPortal>}

          <section>
            <Env>
              {stageNode && <StagePortal node={stageNode} />}
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
`;

const Title = styled.h1<{}>`
  margin-top: 2.5rem;
  margin-bottom: 0;
  line-height: 1.15;
  font-size: 6rem;
  max-width: 800px;

  @media(max-width: 1248px) {
    margin-top: 1.5rem;
    font-size: 5rem;
    max-width: 400px;
  }

  @media(max-width: 800px) {
    margin-top: 0.5rem;
    font-size: 4rem;
    margin-left: 4px;
  }
`;

const Subtitle = styled.h3<{}>`
  margin-left: 4px;
  margin-bottom: 2.5rem;
  color: #555;
  font-weight: normal;
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