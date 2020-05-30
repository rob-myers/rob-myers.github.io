import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { exampleScss1 } from '@model/code/examples';
import { TranspiledCode, FileType, emptyTranspile, permute, tsxEditorProps } from '@model/monaco/monaco.model';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';
import css from './dev-env.scss';

// Used for manual syntax highlighting, so mustn't use CSS modules.
// See `styles.config.ts`. Using `require` prevents tree-shaking.
require('./monaco-override.scss');

const DevEnv: React.FC<Props> = ({ uid }) => {
  const [editing, setEditing] = useState<FileType>('tsx');
  const [transpile, setTranspile] = useState<TranspiledCode>(emptyTranspile);  
  const ready = useSelector(({ worker: { monacoTypesLoaded } }) => !!monacoTypesLoaded);
  const toggle = useCallback(() => ready && setEditing(permute(editing)), [ready, editing]);
  const onTranspile = useCallback((result: TranspiledCode) => setTranspile(result), []);

  useEffect(() => {
    // TODO create/destroy dev env
  }, []);

  useEffect(() => {
    console.log({ tsxTranspile: transpile });
    // TODO dispatch and mount js module
  }, [transpile]);

  return (
    <section className={css.root}>
      <div className={css.header}>
        <a onClick={toggle}>{permute(editing)}</a>
      </div>
      <div className={css.editor}>
        {editing === 'tsx' && (
          <TsxEditor
            editorKey={`${uid}-editor/tsx`}
            modelKey={`${uid}-model/tsx`}
            editorProps={tsxEditorProps}
            onTranspile={onTranspile}
          />
        )}
        {editing === 'scss' && (
          <Editor
            editorKey={`${uid}-editor/scss`}
            modelKey={`${uid}-model/scss`}
            filename="file:///main.scss"
            width={'100%'}
            code={exampleScss1}
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