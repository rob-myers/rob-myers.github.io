import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { SUPPORTED_PACKAGES } from '@model/monaco';
import { exampleTsx1 } from '@model/code/examples';
import Gitalk from '@components/gitalk/gitalk';
import { IEditorProps } from '@components/monaco-tsx/editor.model';
import css from './index.scss';

const TsxEditor = dynamic(import('@components/monaco-tsx/tsx-editor'), { ssr: false });

const baseEditorProps: IEditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  code: exampleTsx1,
  filename: 'file:///main.tsx',
};

const Home: React.FC = () => {
  const onTransformFinished = useCallback(() => { /** */ }, []);
  const editorProps = useRef<IEditorProps>({
    ...baseEditorProps,
    modelKey: 'demo-1',
  });

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>

      <h1>Robert S. R. Myers</h1>

      <section className={css.links}>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>

      <TsxEditor
        editorKey="editor-1"
        modelKey="demo-1"
        editorProps={editorProps.current}
        onTransformFinished={onTransformFinished}
        supportedPackages={SUPPORTED_PACKAGES}
      />

      <Gitalk />
    </section>  
  );
};

export default Home;
