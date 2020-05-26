import { useState } from 'react';
import { useSelector } from 'react-redux';
import { exampleCss1, exampleTsx1 } from '@model/code/examples';
import { SUPPORTED_PACKAGES } from '@model/monaco';
import { IEditorProps } from '@components/monaco/editor.model';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';
import css from './dev-env.scss';

const tsxEditorProps: IEditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  filename: 'file:///main.tsx',
  className: 'monaco-tsx-editor',
  code: exampleTsx1,
  width: 500,
};

type FileType = 'tsx' | 'css';
const permute = (type: FileType): FileType =>
  type === 'css' ? 'tsx' : 'css';

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
            supportedPackages={SUPPORTED_PACKAGES}
          />
        )}
        {editing === 'css' && (
          <Editor
            editorKey="editor-2"
            modelKey="demo-2"
            filename="file:///main.css"
            width={500}
            code={exampleCss1}
          />
        )}
      </div>
    </section>
  );
};

export default DevEnv;