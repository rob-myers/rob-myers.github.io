import { useState } from 'react';
import { useSelector } from 'react-redux';
import { exampleScss1, exampleTsx1 } from '@model/code/examples';
import { IEditorProps } from '@components/monaco/editor.model';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';
import css from './dev-env.scss';

// For prismjs highlighting, so we must not use CSS modules.
// See `styles.config.ts`. Using `require` prevents tree-shaking.
require('./monaco-override.scss');

const tsxEditorProps: IEditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  filename: 'file:///main.tsx',
  className: 'monaco-tsx-editor',
  code: exampleTsx1,
  width: '100%',
};

type FileType = 'tsx' | 'scss';
const permute = (type: FileType): FileType =>
  type === 'scss' ? 'tsx' : 'scss';

const DevEnv: React.FC = () => {
  const [editing, setEditing] = useState<FileType>('tsx');
  const ready = useSelector(({ worker: { monacoTypesLoaded } }) => !!monacoTypesLoaded);
  const toggle = () => ready && setEditing(permute(editing));

  return (
    <section className={css.root}>

      <div className={css.header}>
        <a onClick={toggle}>{permute(editing)}</a>
      </div>

      <div className={css.editor}>
        {editing === 'tsx' && (
          <TsxEditor
            editorKey="editor-1"
            modelKey="demo-1"
            editorProps={tsxEditorProps}
            onTranspile={(transpiled) => console.log({ transpiled })}
          />
        )}
        {editing === 'scss' && (
          <Editor
            editorKey="editor-2"
            modelKey="demo-2"
            // filename="file:///main.css"
            filename="file:///main.scss"
            width={'100%'}
            code={exampleScss1}
          />
        )}
      </div>
    </section>
  );
};

export default DevEnv;