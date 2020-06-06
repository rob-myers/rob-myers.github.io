import { useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { exampleScss1, exampleTsx1 } from '@model/code/examples';
import { TranspiledCode, baseTsxEditorProps } from '@model/monaco/monaco.model';
import { Thunk } from '@store/worker.duck';
import { Thunk as LayoutThunk } from '@store/layout.duck';
import TsxEditor from '@components/monaco/tsx-editor';
import Editor from '@components/monaco/editor';

// Used to (partially) fix JSX syntax highlighting of monaco editor.
// We mustn't use CSS modules -- see styles.config.ts.
import './monaco-override.scss';
import css from './dev-editor.scss';

const DevEditor: React.FC<Props> = ({ filename, panelKey }) => {

  const dispatch = useDispatch();
  const onTranspileTsx = useCallback((result: TranspiledCode) => {
    if (result?.key === 'success') {
      const transformed = dispatch(Thunk.transformTranspiledTsx({ js: result.transpiledJs }));
      console.log({ transformed });
    }
  }, []);

  useEffect(() => {
    dispatch(LayoutThunk.setPanelTitle({ panelKey, title: filename }));
  }, []);

  const tsxEditorProps = useRef({ ...baseTsxEditorProps, code: exampleTsx1 });

  return (
    <div className={css.editor}>
      {filename.endsWith('.tsx') && (
        <TsxEditor
          editorKey={`editor-${panelKey}`}
          modelKey={`model-${filename}`}
          editorProps={tsxEditorProps.current}
          onTranspile={onTranspileTsx}
        />
      )}
      {filename.endsWith('.scss') && (
        <Editor
          editorKey={`editor-${panelKey}`}
          modelKey={`model-${filename}`}
          filename={`file:///${filename}`}
          width="100%"
          height="100%"
          code={exampleScss1}
        />
      )}
    </div>
  );
};

interface Props {
  filename: string;
  panelKey: string;
}

export default DevEditor;
