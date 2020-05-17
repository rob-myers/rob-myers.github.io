import { hot } from 'react-hot-loader/root';
import { useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import withRedux from '@store/with-redux';
import { Thunk } from '@store/global.duck';
import css from './index.scss';

import dynamic from 'next/dynamic';
// const Editor = dynamic(import('@components/monaco-tsx/editor'), { ssr: false });
const TsxEditor = dynamic(import('@components/monaco-tsx/tsx-editor'), { ssr: false });

const Home: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.ensureGlobalSetup({}));
    })();
  }, []);

  const onTransformFinished = useCallback(() => {
    // NOOP
  }, []);

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>
      <h1>Robert S. R. Myers</h1>

      {/* <Editor
        language="typescript"
        theme="vs-dark"
      /> */}
      <TsxEditor
        editorProps={{
          language:'typescript',
          theme: 'vs-dark',
          editorOptions: {
            // readOnly: true
          },
        }}
        onTransformFinished={onTransformFinished}
        supportedPackages={[]}
      />

      <section className={css.links}>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>
    </section>  
  );
};

export default hot(withRedux(Home));
