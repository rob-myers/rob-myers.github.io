import { useEffect } from 'react';
import Head from 'next/head'
import styled from "@emotion/styled";

import Header from 'components/page/Header';
import Markdown from 'components/page/Markdown';
import { CodeEdit } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import { Section } from 'components/page/Layout';
import useCodeStore from 'store/code.store';

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <>
      <Head>
        <title>Hot modules</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <div>
          <Header />
            <Section>
            <Markdown children={`
## Introduction

In the beginning, Brendan Eich made LiveScript.
It was subsequently renamed _JavaScript_, and is the only programming language supported by all web browsers.

JavaScript (JS) has two siblings i.e. HTML (the hierarchy of elements on a webpage) and CSS (their look and feel). It can subsume them both e.g. via [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)) (syntactic sugar) or [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) (added in ES6) combined with runtime diffs, or alternatively via template languages which compile to JS. Even though visiting a website begins by downloading HTML, the latter is often generated by JS running on a server. Then browsing a website amounts to running JavaScript, mostly on our own machine. The resulting stateful application depends on user input, various kinds of local storage and also API responses (the backend infrastructure).

Now, users commonly run _additional code_ e.g. advert blockers and password autofillers. Such addons provide clarity and save time. The creation and development of websites follows a similar pattern. The developer also browses the site, although usually without live data. They then run additional code to _sync the site with the source code_. In the simplest case, a developer changes a single JavaScript file and the browser triggers a so-called full page reload. This saves times and avoids working with "stale code". However,

...

But web developers also want to make edits without reloading (as much as possible). Understanding _exactly what that means_ is the subject of this website.

Against the norm we will explicitly download code via a shell...

- shell via xterm.js and mvdan-sh
- ace-editor with tabs
- webworker with forked @babel/standalone
- service worker
- systemjs modules
- preact.js + linaria
- react-query + zustand

`}/>
          </Section>

          <section style={{ height: 300, width: '100%' }}>
            <CodeEdit codeKey="file.js"/>
          </section>

          <section style={{ height: 300 }}>
            <Terminal sessionKey="test" env={env} />
          </section>

        </div>
      </Main>
    </>
  );
}

const env = {};

const Main = styled.main<{}>`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
  > div {
    flex: 1;
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
  @media(max-width: 700px) {
    margin: 0;
  }
`;
