import Head from 'next/head'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Markdown from 'components/page/Markdown';
import Stage from 'components/stage/WrappedStage';
import { usePage } from 'components/hooks';
import { CodeEdit } from 'components/dynamic';
import { Section, TwoPanel, Pill, Columns, Rows } from 'components/page/Layout';

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

> In other words, is the _behaviour of non-player characters_ (NPCs) steadily improving?

This question is a bit vague. Which games are we referring to? How can we compare behaviour in different games? What constitutes better behaviour, beyond ironing out bugs or "behaving more like a human"? We need to provide more context.

<!--
Let's restrict to single-player 3d games where a single character is controlled, e.g.
- [Quake](https://en.wikipedia.org/wiki/Quake_(video_game)) (1996),
- [GoldenEye](https://en.wikipedia.org/wiki/GoldenEye_007_(1997_video_game)) (1997),
- [Thief II](https://en.wikipedia.org/wiki/Thief_II) (2000),
- [Halo](https://en.wikipedia.org/wiki/Halo:_Combat_Evolved) (2001),
- [Skyrim](https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim) (2011),
- [Fallout 4](https://en.wikipedia.org/wiki/Fallout_4) (2015),
- [The Last of Us Part II](https://en.wikipedia.org/wiki/The_Last_of_Us_Part_II) (2020).
-->

Most 3d games have lots of _graphic/sound design_ (including animation), obey basic rules of reality via a _physics engine_, and provide a _user interface_ for character control. Collectively these concepts could be called the _game environment_. They show the world, simulate the world, and apply player actions to the world. Combining the game environment with level design and the behaviour of NPCs determines the _game experience_. It is usually organised into _levels/missions/quests/encounters_, providing a sense of purpose and progression.

`}/>

<Pill style={{ fontSize: 'smaller' }}>
  <div style={{ padding: '2px 0' }}>
    <em>Game experience</em>
  </div>
  <Columns count={2} style={{ gap: 4 }}>
    <Pill>
      <div style={{ padding: '2px 0' }}>
        <em>Game environment</em>
      </div>
      <Rows count={3} style={{ gap: 1 }}>
        <Pill>Graphic/sound design</Pill>
        <Pill>Physics engine</Pill>
        <Pill>User interface</Pill>
      </Rows>
    </Pill>
    <Columns count={1}>
      <Pill>
        <div style={{ padding: '2px 0 4px' }}>
          <em>Level design</em>
        </div>
        <Rows count={1} style={{ gap: 1 }}>
          <Pill>Layout, interaction, resources ...</Pill>
        </Rows>
        <div style={{ padding: '2px 0' }}>
          <em>NPC behaviour</em>
        </div>
        <Rows count={1} style={{ gap: 1 }}>
          <Pill>Scripted/Individual/Group behaviour ...</Pill>
          {/* <Pill>Scripted behaviour</Pill> */}
          {/* <Pill>Dynamic encounters, etc.</Pill> */}
        </Rows>
      </Pill>
    </Columns>
  </Columns>
</Pill>

<Markdown children={`

Let's compare two excellent games released 24 years apart. [Quake](https://en.wikipedia.org/wiki/Quake_(video_game)) (1996) was the first fully 3d first-person-shooter and is an incredible achievement. [The Last of Us Part II](https://en.wikipedia.org/wiki/The_Last_of_Us_Part_II) (2020) is arguably the most polished story-driven combat game currently in existence. Compared to Quake, its environment is far richer e.g. one can walk, run, creep, go prone, push through tight gaps, leapfrog barriers, climb ladders, set traps, throw bottles and create silencers. The levels are much larger and richer too. But comparing NPC behaviour we find a lot of similarities??? MAYBE WRONG


TODO conceptual similarity of AI in Quake and The Last of Us Part II
- Quake has monsters which try to reach you directly or via wall-following. Their search has a timeout, monsters may fight other monsters, and if a monster spots you it will awaken others nearby.
- The Last of Us Part II has monsters which try to reach you directly or via path-finding. Their search has a timeout, monsters may fight other humans, and if a monster spots you it will awaken others nearby and alert them to your position.

---

NPC behaviour is a very popular topic amongst game players, but there is not much technical content available online.

Perhaps videos games are not the right place to expect Game AI to evolve. There are too many other constraints. Player Experience trumps all.

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
