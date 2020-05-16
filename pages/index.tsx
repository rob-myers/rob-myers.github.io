import { hot } from 'react-hot-loader/root';
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import withRedux from '@store/with-redux';
import { Thunk } from '@store/global.duck';
import css from './index.scss';

import dynamic from 'next/dynamic';
// const MonacoEditor = dynamic(import('react-monaco-editor'), { ssr: false });
const Editor = dynamic(import('@components/monaco-tsx/editor'), { ssr: false });

const Home: React.FC = () => {
  const dispatch = useDispatch();
  // const [postBody, setPostBody] = useState('');

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.ensureSetup({}));
    })();
  }, []);

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>
      <h1>Robert S. R. Myers</h1>

      {/* <MonacoEditor
        editorWillMount={(monaco) => {
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            typeRoots: ['node_modules/@types'],
            jsx: monaco.languages.typescript.JsxEmit.React,
            jsxFactory: 'React.createElement',
          });
        }}
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
        // language="javascript"
        theme="vs-dark"
        value={postBody}
        options={{
          minimap: {
            enabled: false
          }
        }}
        onChange={setPostBody}
      /> */}

      <Editor
        // width="800"
        // height="600"
        language="typescript"
        theme="vs-dark"
        // code='export const foo = ""'
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
