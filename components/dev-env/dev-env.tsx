import { SUPPORTED_PACKAGES } from '@model/monaco';
import { exampleCss1, exampleTsx1 } from '@model/code/examples';
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

const DevEnv: React.FC = () => {

  return (
    <section className={css.root}>
      <div>
        <TsxEditor
          editorKey="editor-1"
          modelKey="demo-1"
          editorProps={tsxEditorProps}
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
  );
};

export default DevEnv;