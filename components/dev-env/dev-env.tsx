import { SUPPORTED_PACKAGES } from '@model/monaco';
import { exampleCss1, exampleTsx1 } from '@model/code/examples';
import { IEditorProps } from '@components/monaco/editor.model';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';

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
    <section style={{ display: 'flex' }}>
      <div style={{ marginRight: 10 }}>
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