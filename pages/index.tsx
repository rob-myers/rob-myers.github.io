import { useEffect } from 'react';

import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';
import { initialCode } from 'model/code/code.lib';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Section>

        <Markdown title children={`
# react re-spec

richer and easier component testing
        `}/>

        <Markdown children={`
## Statement of intent <float rem="1.2">19th July 2021</float>

_TODO_ rewrite intro

The objective of this site is:

> _to develop a new approach to react testing..._

By a _partial game mechanic_ we mean a part of a video game, e.g. level design, physics, character motion, dialogue, controls etc. By _composition_ we mean functional composition. Each partial game mechanic will correspond to a JavaScript function, and richer ones are obtained by composing simpler ones.

Mathematical notation is awash with composite functions. For example, given \`f(x,y):=(x-1)/(y-1)\` where \`x\` and \`y\` are real numbers, observe it is composed of subtraction and division (functions with two arguments), and constant-valued functions. In JavaScript we can write:
        `}/>

          <CodeEditor
            height="auto"
            padding="16px 24px"
            readOnly
            code={`
function f(x, y) { return (x - 1) / (y - 1); }
// or alternatively:
const f = (x, y) => (x - 1) / (y - 1);
          `} />

        <Markdown children={`
There are some technical differences (JavaScript numbers only take finitely many values; subtraction and division are language operators rather than functions), but otherwise the same compositional story is told. But the JavaScript functions we'll develop do not return numbers. They return _markup_.

_TODO_ ...

_TODO hookup babel transpilation of jsx using forked @babel/standalone_
        `}/>

        <section style={{ height: 200 }}>
          <Terminal sessionKey="test" env={env} />
        </section>

        <br/>

        <CodeEditor
          height="400px"
          code={initialCode['file.js']}
          lineNumbers
        />

        <Markdown children={`
This is an example of a [command link](#command "@test echo foo").
        `}/>
      </Section>

    </Main>
  );
}
