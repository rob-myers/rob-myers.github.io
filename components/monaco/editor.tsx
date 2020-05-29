import * as monaco from 'monaco-editor';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IEditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { Thunk } from '@store/worker.duck';
import { redact } from '@model/store/redux.model';

// Must not be in main bundle (so, not in worker.duck)
import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
import { accessibilityHelpUrl } from '@model/monaco';
const typescript = monaco.languages.typescript;
const typescriptDefaults = typescript.typescriptDefaults as TypescriptDefaults;

/**
 * Wrapper for a Monaco editor instance.
 */
const Editor: React.FC<IEditorProps> = (props) => {
  const {
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    className,
    code = '',
    language,
    filename,
    editorOptions,
    editorKey = 'editor-model',
    modelKey = 'default-model',
  } = props;

  const divRef = React.useRef<HTMLDivElement>(null);
  const monacoBootstrapped = useSelector(({ worker }) => !!worker.monacoInternal);
  const monacoEditor = useSelector(({ worker }) => worker.monacoEditor[editorKey]);
  const monacoModel = useSelector(({ worker }) => worker.monacoModel[modelKey]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const uri = monaco.Uri.parse(filename);

    (async () => {
      if (!monacoBootstrapped) {
        await dispatch(Thunk.bootstrapMonaco({
          typescript: redact(typescript),
          typescriptDefaults: redact(typescriptDefaults),
          monaco: redact(monaco),
        }));
      }

      if (!monacoEditor) {
        const model = monacoModel?.model
          || monaco.editor.createModel(code, language, uri);
        const editor = monaco.editor.create(divRef.current!, {
          fontFamily: CODE_FONT_FAMILY,
          accessibilityHelpUrl,
          ...editorOptions,
          model,
        });
        await dispatch(Thunk.createMonacoEditor({
          editorKey,
          editor: redact(editor),
          modelKey,
          model: redact(model),
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

  React.useEffect(() => {
    let disposable: monaco.IDisposable;
    monacoEditor && (disposable = monacoEditor.editor.onDidChangeModelContent(() => {
      monacoEditor.stream.next({ key: 'content-changed', editorKey, modelKey });
    }));
    return () => disposable?.dispose();
  }, [monacoEditor?.key]);

  return (
    <div
      ref={divRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default Editor;
