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

Video game graphics improve year by year, but can the same be said of _Game AI_?
> In other words, is the _behaviour of non-player characters_ (NPCs) improving?

This question is vague. Which games are we referring to? How can we compare behaviour in different games? What constitutes better behaviour, beyond ironing out bugs or "behaving more like a human"? We need to provide more context.

Take a single-player game where a character is controlled in a 3d world, e.g.
- [Quake](https://en.wikipedia.org/wiki/Quake_(video_game)) (1996),
- [GoldenEye](https://en.wikipedia.org/wiki/GoldenEye_007_(1997_video_game)) (1997),
- [Thief II](https://en.wikipedia.org/wiki/Thief_II) (2000),
- [Halo](https://en.wikipedia.org/wiki/Halo:_Combat_Evolved) (2001),
- [Skyrim](https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim) (2011),
- [Fallout 4](https://en.wikipedia.org/wiki/Fallout_4) (2015),
- [The Last of Us Part II](https://en.wikipedia.org/wiki/The_Last_of_Us_Part_II) (2020).

Such games have much _graphic and sound design_ (including animation), obey basic rules of reality enforced by a _physics engine_, and provide a _user interface_ for character control. Collectively these three concepts could be called the _game environment_. This environment supports the _game experience_ i.e. _levels/missions/quests/encounters_ following a central plot or subplots, which provide a notion of progression. This game experience is mostly created via the behaviour of NPCs within the game environment.


---

The reverse disease: making a game engine without any setting, design etc.

Player experience more important than "interesting AI".

Player often won't see enough of AI to see its intelligence.
Hence the idea for characters to shout their intentions before doing them.

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
