import { useEffect } from 'react';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';
import TeleglitchModule from 'components/level/teleglitch-module';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
  # esc the base

  a topdown web game built step-by-step
    `}/>

        <Markdown children={`
## Statement of Intent

This site has a clear objective: _build a topdown game step-by-step using modern web development techniques_. In the process we will:
- see how web applications are often built.
- see how complex games can be built.
- have a lot of fun doing it. 

Our underlying motivation is to explain how web development works, including important devtools such as live code editing ([react-refresh](https://github.com/facebook/react/tree/main/packages/react-refresh)). But a proper explanation requires a reasonably complex web application. Now, there are plenty of interesting web applications out there e.g. ... 



---
---


given particular interests and particular technology we are going to produce a particular output. Our chosen inspiration and technology are:
- the excellent topdown game [Teleglitch](https://en.wikipedia.org/wiki/Teleglitch) ([video](https://www.youtube.com/watch?v=iEnS4wPRETw)).
- a popular approach to web development ([preact](https://preactjs.com/) + css-in-js + [babel](https://babeljs.io/)).

As output we'll create _another_ topdown game, written step-by-step using web dev techniques. 
<!-- Teleglitch and [Quake](https://en.wikipedia.org/wiki/Quake_(video_game)) will determine the so-called _game mechanics_. -->



        `}/>

        <br/>
        <TeleglitchModule/>

        <Markdown children={`
_TODO hookup babel transpilation of jsx using forked @babel/standalone_
        `}/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <section style={{ height: 400 }}>
          <CodeEditor codeKey="file.js" />
        </section>

        <Markdown children={`
  This is an example of a [command link](# "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
