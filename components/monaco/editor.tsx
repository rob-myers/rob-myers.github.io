import * as monaco from 'monaco-editor';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EditorProps } from './editor.model';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { Thunk } from '@store/editor.duck';
import { redact } from '@model/store/redux.model';

// Must not be in main bundle (so, not in editor.duck)
import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
const typescript = monaco.languages.typescript;
const typescriptDefaults = typescript.typescriptDefaults as TypescriptDefaults;

/**
 * Wrapper for a Monaco editor instance.
 */
const Editor: React.FC<EditorProps> = (props) => {
  const {
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    // Relevant to golden-layout mini-view
    minHeight = 100,
    className,
    code = '',
    filename,
    editorOptions: _,
    editorKey = 'default-editor-key',
    modelKey = 'default-model-key',
  } = props;

  const divRef = React.useRef<HTMLDivElement>(null);
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const monacoLoaded = useSelector(({ editor }) => editor.monacoLoaded);
  const dispatch = useDispatch();

  React.useEffect(() => {
    (async () => {
      if (!bootstrapped && divRef.current) {
        const next = await dispatch(Thunk.bootstrapEditor({
          monaco: redact(monaco),
          typescript: redact(typescript),
          typescriptDefaults: redact(typescriptDefaults),
          editorKey,
          modelKey,
          div: divRef.current,
          filename,
          code,
        }));
        divRef.current && setBootstrapped(next);
      }
    })();

    return () => {
      dispatch(Thunk.removeMonacoEditor({ editorKey }));
    };
  }, [monacoLoaded]);

  React.useEffect(() => {
    if (bootstrapped) {
      dispatch(Thunk.changeEditorModel({ editorKey, nextFilename: filename, nextModelKey: modelKey }));
    }
  }, [filename]);

  return (
    <div
      ref={divRef}
      style={{
        width,
        height,
        minHeight,
      }}
      className={className}
    />
  );
};

export default Editor;
