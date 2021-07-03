import { useEffect } from 'react';

import { Header, Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';
import { CodeEdit } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';
import useCodeStore from 'store/code.store';

const env = {};

export default function IndexPage() {

  useEffect(() => {
    useCodeStore.api.rehydrate(['file.js']);
  }, []);

  return (
    <Main>
      <Header />
      <Section>
        <Markdown children={`
## Introduction

In the beginning, Brendan Eich made LiveScript.
It was subsequently renamed _JavaScript_ (aka JS).
Nowadays it is the only programming language understood by all web browsers. It has two siblings. HTML describes the hierarchy of elements on a webpage, whereas CSS specifies their look and feel. Importantly, JS subsumes them both:

<!-- - e.g. via \`document.createElement\` and \`document.createElement('style')\`. -->
- e.g. via [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)) (syntactic sugar), [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) (ES2015) and runtime DOM diffing.
- e.g. via template languages compiling to JS.

Although browsing a website begins by downloading HTML, the latter is often generated by JS running on a server. Then browsing a website amounts to _running JavaScript_, initially remotely and subsequently on our own machine (the web browser interprets it). The resulting stateful application depends on our input, various kinds of local storage and also API responses i.e. the backend infrastructure.

We may also run _additional JavaScript_ in the browser e.g. advert blockers and password autofillers. This saves time and improves the browsing experience. The development of websites follows a similar pattern. 

> The developer browses the site, but instead runs JS autogenerated from source code on their own machine. They run additional JS in the browser, in order to _repeatedly sync the website with the autogenerated JS_. This saves time and improves the development experience.

For a simplified example, enter the command \`mockDevEnv\` below or [click here]().
`}/>
      <section style={{ height: 200 }}>
        <Terminal sessionKey="test" env={env} />
      </section>

      <Markdown children={`
A JSX source file is changed, a new JS file is somehow autogenerated, the browser-based additional JS is somehow informed, finally it decides to trigger a full page reload.


Now, this situation is not ideal: refreshing a webpage is like rebooting an application. It takes time and you're likely to lose emphemeral state e.g.

...

But web developers also want to make edits without reloading (as much as possible). Understanding _exactly what that means_ is the subject of this website.

- Easier to learn by making small changes
- Richer UIs possible via text
- Against the norm we will explicitly download code via a shell...
- Hooks help testing, which also serves as documentation

---


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

    </Main>
  );
}
