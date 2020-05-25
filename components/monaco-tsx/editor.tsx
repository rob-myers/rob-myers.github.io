import shortid from 'shortid';
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
const javascriptDefaults = typescript.javascriptDefaults as TypescriptDefaults;

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
    theme,
    editorKey = 'editor-model',
    modelKey = 'default-model',
  } = props;

  const editorUid = React.useRef(`${editorKey}-${shortid.generate()}`);
  const divRef = React.useRef<HTMLDivElement>(null);
  const monacoEditor = useSelector(({ worker }) => worker.monacoEditor[editorKey]);
  const monacoModel = useSelector(({ worker }) => worker.monacoModel[modelKey]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const uri = monaco.Uri.parse(filename);

    if (!monacoEditor) {
      const model = monacoModel?.model || monaco.editor.createModel(code, language, uri);
      const editor = monaco.editor.create(divRef.current!, {
        fontFamily: CODE_FONT_FAMILY,
        accessibilityHelpUrl,
        ...editorOptions,
        model,
      });
      dispatch(Thunk.createMonacoEditor({
        // Ensure stuff outside main bundle
        typescriptDefaults,
        javascriptDefaults,
        typescript,
        monacoRange: redact(monaco.Range),
        //
        editorKey: editorUid.current,
        editor: redact(editor),
        modelKey,
        model: redact(model),
        filename,
      }));
    } else if (!monacoModel) {
      const model = monaco.editor.createModel(code, language, uri);
      dispatch(Thunk.useMonacoModel({
        editorKey: editorUid.current,
        modelKey,
        model: redact(model),
        filename,
      }));
    }

    if (theme) {
      monaco.editor.setTheme(theme);
    }

    return () => {
      dispatch(Thunk.removeMonacoEditor({ editorKey: editorUid.current, }));
    };
  }, [theme]);

  /**
   * Handle updates e.g. transpile.
   */
  React.useEffect(() => {
    const editor = monacoEditor?.editor;
    let debounceId: number;
    onChange && editor?.onDidChangeModelContent(() => {
      clearTimeout(debounceId);
      debounceId = window.setTimeout(() => onChange(editor.getModel()!.getValue()), debounceMs);
    });
    return () => void clearTimeout(debounceId);
  }, [monacoEditor]);

  return (
    <div
      ref={divRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default Editor;
