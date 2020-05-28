import * as monaco from 'monaco-editor';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IEditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { Thunk } from '@store/worker.duck';
import { redact } from '@model/store/redux.model';

import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
import { accessibilityHelpUrl } from '@model/monaco';
// Must not be in main bundle (so, not in worker.duck)
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
    onChange,
    debounceMs = 1000,
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
          rangeClass: redact(monaco.Range),
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

  /**
   * Handle updates e.g. transpile.
   */
  React.useEffect(() => {
    // /**
    //  * TODO trigger rxjs stream via thunk.
    //  */
    // if (monacoEditor) {
    //   const dispose = monacoEditor.editor.onDidChangeModelContent(() => {
    //     dispatch(Thunk.onModelContentChanged({ editorKey, modelKey }));
    //   });
    // }
    const editor = monacoEditor?.editor;
    let debounceId: number;
    onChange && editor?.onDidChangeModelContent(() => {
      clearTimeout(debounceId);
      debounceId = window.setTimeout(() => {
        onChange();
      }, debounceMs);
    });
    return () => void clearTimeout(debounceId);
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
