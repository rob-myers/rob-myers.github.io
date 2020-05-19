import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/global.duck';
import Gitalk from '@components/gitalk/gitalk';
import { SUPPORTED_PACKAGES } from '@model/monaco/supported-packages';
import { ITsxEditorProps } from '@components/monaco-tsx/tsx-editor.model';
import css from './index.scss';

const TsxEditor = dynamic(import('@components/monaco-tsx/tsx-editor'), { ssr: false });

const editorProps: ITsxEditorProps['editorProps'] = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  // modelRef
};

const Home: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      // TODO rename 'global' reducer as 'worker' and simplify
      await dispatch(Thunk.ensureGlobalSetup({}));
    })();
  }, []);

  const onTransformFinished = useCallback(() => {
    // NOOP
  }, []);

  useEffect(() => {
    console.log('mount root');
    return () => console.log('unmount root');
  }, []);

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>

      <h1>Robert S. R. Myers</h1>

      <section className={css.links}>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>

      <TsxEditor
        editorProps={editorProps}
        onTransformFinished={onTransformFinished}
        supportedPackages={SUPPORTED_PACKAGES}
      />

      <Gitalk />
    </section>  
  );
};

export default Home;
