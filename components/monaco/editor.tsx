import * as monaco from 'monaco-editor';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { Thunk } from '@store/editor.duck';
import { redact } from '@model/store/redux.model';

// Must not be in main bundle (so, not in worker.duck)
import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
import { accessibilityHelpUrl } from '@model/monaco/monaco.model';
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
    language,
    filename,
    editorOptions,
    editorKey = 'editor-model',
    modelKey = 'default-model',
  } = props;

  const divRef = React.useRef<HTMLDivElement>(null);
  const bootstrapped = useSelector(({ editor: worker }) => !!worker.internal);
  const editor = useSelector(({ editor: worker }) => worker.editor[editorKey]);
  const monacoModel = useSelector(({ editor: worker }) => worker.model[modelKey]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const uri = monaco.Uri.parse(filename);

    (async () => {
      if (!bootstrapped) {
        await dispatch(Thunk.bootstrapMonaco({
          typescript: redact(typescript),
          typescriptDefaults: redact(typescriptDefaults),
          monaco: redact(monaco),
        }));
      }

      if (!editor) {
        const monacoModel = monaco.editor.getModel(uri)
          || monaco.editor.createModel(code, language, uri);
        const monacoEditor = monaco.editor.create(divRef.current!, {
          fontFamily: CODE_FONT_FAMILY,
          fontSize: 11,
          accessibilityHelpUrl,
          ...editorOptions,
          model: monacoModel,
        });
        await dispatch(Thunk.createMonacoEditor({
          editorKey,
          editor: redact(monacoEditor),
          modelKey,
          model: redact(monacoModel),
          filename,
        }));
      } else if (!monacoModel) {
        const model = monaco.editor.createModel(code, language, uri);
        dispatch(Thunk.useMonacoModel({
          editorKey,
          modelKey,
          model: redact(model),
          filename,
        }));
      }
    })();

    return () => {
      dispatch(Thunk.removeMonacoEditor({ editorKey }));
    };
  }, []);

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
