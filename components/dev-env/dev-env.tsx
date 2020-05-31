import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { exampleScss1 } from '@model/code/examples';
import { TranspiledCode, FileType, permute, tsxEditorProps } from '@model/monaco/monaco.model';
import { Thunk } from '@store/worker.duck';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';
import EsModule from './es-module';
import css from './dev-env.scss';

// Used for manual syntax highlighting, so mustn't use CSS modules.
// See `styles.config.ts`. Using `require` prevents tree-shaking.
require('./monaco-override.scss');

const DevEnv: React.FC<Props> = ({ uid }) => {
  const [editing, setEditing] = useState<FileType>('tsx');
  const [code, setCode] = useState('');
  const [codeEsmUrl, setCodeEsmUrl] = useState('');
  
  const ready = useSelector(({ worker: { monacoTypesLoaded } }) => !!monacoTypesLoaded);
  const toggle = useCallback(() => ready && setEditing(permute(editing)), [ready, editing]);
  
  const dispatch = useDispatch();
  const onTranspile = useCallback((result: TranspiledCode) => {
    if (result?.key === 'success') {
      setCode(dispatch(Thunk.transformTranspiledTsx({ js: result.transpiledJs })));
    }
  }, []);

  const bootstrapCode = useMemo(() => [
    `import App from '${codeEsmUrl}';`,
    `import ReactDom from '${window.location.origin}/es-react/react-dom.js';`,
    `ReactDom.render(App(), document.getElementById('${uid}-render-root'));`,
  ].join('\n'), [codeEsmUrl]);

  return (
    <section className={css.root}>
      <div className={css.header}>
        <a onClick={toggle}>{permute(editing)}</a>
      </div>
      <div className={css.editor}>
        {editing === 'tsx' && (
          <TsxEditor
            editorKey={`${uid}-tsx-editor`}
            modelKey={`${uid}-model/tsx`}
            editorProps={tsxEditorProps}
            onTranspile={onTranspile}
          />
        )}
        {editing === 'scss' && (
          <Editor
            editorKey={`${uid}-sass-editor`}
            modelKey={`${uid}-model/scss`}
            filename="file:///main.scss"
            width={'100%'}
            code={exampleScss1}
          />
        )}
      </div>
      <div id={`${uid}-render-root`}>
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
    </section>
  );
};

interface Props {
  uid: string;
}

export default DevEnv;