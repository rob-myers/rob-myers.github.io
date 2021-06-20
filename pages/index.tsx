import Head from 'next/head'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Markdown from 'components/page/Markdown';
import Stage from 'components/stage/WrappedStage';
import { usePage } from 'components/hooks';
import { CodeEdit } from 'components/dynamic';
import { Section, TwoPanel } from 'components/page/Layout';

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

Video game graphics improve year by year, but can the same be said of _Game AI_? We are talking about _the behaviour of non-player characters_ (NPCs). However, our question is vague. Which games are we referring to? How can we compare behaviour in different games? What constitutes better behaviour, beyond ironing out bugs or "behaving more like a human"? Let us provide some context.

A typical video game involves controlling a single character within a 3d world. _Designing the visual aspects_ involves 3d modelling, character design, weapon design, level design, animation and more. _Basic rules of reality_ are enforced via a physics engine, the character being a cylinder and a castle wall being a cuboid; synchronised animation provides the illusion of real locomotion. A _User Interface_ enables control of the character e.g. for moving, talking, taking and attacking.

Amongst 

---

Let us begin with a few common observations.

- Open world games often degenerate into \`from A to B via C\`.
- Games often trade NPC ingenuity for a repeatable encounter.
- While the player experience...

Symptom + Cause + Cause

_Making some kind of universal AI system is a  Very Bad Idea.
Reduction examples: Warren McColluch and neural nets, Complexity Theory. But not for AI because..._

Example of escaping and being searched for.

---

We are going to provide many examples of these algorithms; we'll also combine them in numerous ways. Importantly, the provided code can be executed directly on this site. For example:

`}
            />
          </Section>

          <TwoPanel height={350}>
            <Stage
              stageKey="test@intro"
              viewKey="va:test@intro"
            />
            <CodeEdit codeKey="file.js"/>
          </TwoPanel>

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
  @media(max-width: 700px) {
    margin: 0;
  }
`;
