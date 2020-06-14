import { useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { exampleScss1 } from '@model/code/examples';
import { TranspiledCode, FileType, baseTsxEditorProps } from '@model/monaco/monaco.model';
import { bootstrapApp } from '@model/code/bootstrap';
import { Thunk } from '@store/editor.duck';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';
import EsModule from './es-module';
import css from './dev-env-demo.scss';

// Used to fix JSX syntax highlighting of monaco editor.
// We mustn't use CSS modules (see `styles.config.ts`).
// Must require to avoid tree-shaking in production.
require('./monaco-override.scss');

const DevEnvDemo: React.FC<Props> = ({ uid, initialTsx }) => {
  const tsxEditorProps = useRef({ ...baseTsxEditorProps, code: initialTsx, height: 500 });
  const [editing, setEditing] = useState<FileType>('tsx');
  const [code, setCode] = useState(''); // Code transpiled from tsx
  const [codeEsmUrl, setCodeEsmUrl] = useState('');
  const [ready, setReady] = useState(false);
  
  const dispatch = useDispatch();
  const onTranspile = useCallback((result: TranspiledCode) => {
    if (result?.key === 'success') {
      setReady(true);
      setCode(dispatch(Thunk.transformTranspiledTsx({ js: result.transpiledJs })));
    }
  }, []);

  const bootstrapCode = useMemo(() =>
    bootstrapApp(codeEsmUrl, `${uid}-render-root`), [codeEsmUrl]);

  return (
    <section className={css.root}>
      <div className={css.header}>
        <a onClick={() => ready && setEditing('tsx')}>tsx</a>
        <a onClick={() => ready && setEditing('scss')}>scss</a>
      </div>
      <div className={css.editorAndView}>
        <div className={css.editor}>
          {editing === 'tsx' && (
            <TsxEditor
              editorKey={`${uid}-tsx-editor`}
              modelKey={`${uid}-tsx-model`}
              editorProps={tsxEditorProps.current}
              onTranspile={onTranspile}
              filename="demo.tsx"
            />
          )}
          {editing === 'scss' && (
            <Editor
              editorKey={`${uid}-sass-editor`}
              modelKey={`${uid}-sass-model`}
              filename="demo.scss"
              width={'100%'}
              code={exampleScss1}
            />
          )}
        </div>
        <div id={`${uid}-render-root`} className={css.view}>
          {code && (
            <EsModule
              code={code}
              scriptId={`${uid}-transpiled-tsx`}
              onMount={(scriptSrcUrl) => {
                // console.log({ scriptSrcUrl });
                setCodeEsmUrl(scriptSrcUrl);
              }}
            />
          )}
          {codeEsmUrl && (
            <EsModule
              code={bootstrapCode}
              scriptId={`${uid}-bootstrap-app`}
            />
          )}
        </div>
      </div>
    </section>
  );
};

interface Props {
  uid: string;
  initialTsx: string;
}

export default DevEnvDemo;