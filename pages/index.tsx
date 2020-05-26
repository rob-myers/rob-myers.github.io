import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { SUPPORTED_PACKAGES } from '@model/monaco';
import { exampleTsx1, exampleCss1 } from '@model/code/examples';
import Gitalk from '@components/gitalk/gitalk';
import { IEditorProps } from '@components/monaco-tsx/editor.model';
import css from './index.scss';

const Editor = dynamic(import('@components/monaco-tsx/editor'), { ssr: false });
const TsxEditor = dynamic(import('@components/monaco-tsx/tsx-editor'), { ssr: false });

const baseEditorProps: IEditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  filename: 'file:///main.tsx',
  className: 'monaco-tsx-editor'
};

const Home: React.FC = () => {
  const onTransformFinished = useCallback(() => { /** */ }, []);

  const tsxEditorProps = useRef<IEditorProps>({
    ...baseEditorProps,
    code: exampleTsx1,
    width: 500,
  });

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>

      <h1>Robert S. R. Myers</h1>

      <section className={css.links}>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>

      <section style={{ display: 'flex' }}>
        <div style={{ marginRight: 10 }}>
          <TsxEditor
            editorKey="editor-1"
            modelKey="demo-1"
            editorProps={tsxEditorProps.current}
            onTransformFinished={onTransformFinished}
            supportedPackages={SUPPORTED_PACKAGES}
          />
        </div>

        <Editor
          editorKey="editor-2"
          modelKey="demo-2"
          filename="file:///main.css"
          width={500}
          code={exampleCss1}
        />
      </section>

      <Gitalk />
    </section>  
  );
};

export default Home;
