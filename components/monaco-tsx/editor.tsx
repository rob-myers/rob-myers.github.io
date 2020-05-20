import * as monaco from 'monaco-editor';
import * as React from 'react';
import { IEditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/reducer';
import { Thunk } from '@store/worker.duck';
import { redact } from '@model/redux.model';

import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
import { accessibilityHelpUrl } from '@model/monaco/supported-packages';
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
    theme,
  } = props;

  const divRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const uri = filename ? monaco.Uri.parse(filename) : undefined;
    const editor = monaco.editor.create(divRef.current!, {
      fontFamily: CODE_FONT_FAMILY,
      accessibilityHelpUrl,
      ...editorOptions,
      model: monaco.editor.createModel(code, language, uri),
    });

    dispatch(Thunk.ensureMonaco({
      editor: redact(editor),
      typescriptDefaults,
      typescript,
    }));

    if (theme) {
      monaco.editor.setTheme(theme);
    }

    return () => void dispatch(Thunk.clearMonaco({}));
  }, [language, filename, theme]);

  const editor = useSelector(({ worker }: RootState) => worker.monacoEditor);

  React.useEffect(() => {
    let id: number;
    onChange && editor?.onDidChangeModelContent(() => {
      clearTimeout(id);
      id = window.setTimeout(() => onChange(editor.getModel()!.getValue()), debounceMs);
    });
    return () => void clearTimeout(id);
  }, [editor]);

  return (
    <div
      ref={divRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default Editor;
