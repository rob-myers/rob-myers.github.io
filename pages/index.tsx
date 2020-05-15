import { hot } from 'react-hot-loader/root';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import withRedux from '@store/with-redux';
import { Thunk } from '@store/global.duck';
import css from './index.scss';

import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(import('react-monaco-editor'), { ssr: false });

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [postBody, setPostBody] = useState('');

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.ensureSetup({}));
    })();
  }, []);

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>
      <h1>Robert S. R. Myers</h1>

      <MonacoEditor
        editorDidMount={() => {
          // @ts-ignore
          window.MonacoEnvironment.getWorkerUrl = (
            _moduleId: string,
            label: string
          ) => {
            if (label === 'json')
              return '_next/static/json.worker.js';
            if (label === 'css')
              return '_next/static/css.worker.js';
            if (label === 'html')
              return '_next/static/html.worker.js';
            if (
              label === 'typescript' ||
              label === 'javascript'
            )
              return '_next/static/ts.worker.js';
            return '_next/static/editor.worker.js';
          };
        }}
        width="800"
        height="600"
        language="typescript"
        theme="vs-dark"
        value={postBody}
        options={{
          minimap: {
            enabled: false
          }
        }}
        onChange={setPostBody}
      />

      <section className={css.links}>
        <Link href="about">
          <a>About</a>
        </Link>
        <Link href="test">
          <a>Test</a>
        </Link>
      </section>
    </section>  
  );
};

export default hot(withRedux(Home));
