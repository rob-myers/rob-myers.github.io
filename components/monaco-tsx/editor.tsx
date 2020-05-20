import * as monaco from 'monaco-editor';
import * as React from 'react';
import { IEditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/worker.duck';
import { redact } from '@model/redux.model';

import { LanguageServiceDefaultsImpl as TypescriptDefaults } from '@model/monaco/monaco-typescript.d';
// Mustn't be in main bundle (so, not in worker.duck)
const typescript = monaco.languages.typescript;
const typescriptDefaults = typescript.typescriptDefaults as TypescriptDefaults;

/**
 * Language-agnostic wrapper for a Monaco editor instance.
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
    debounceTime = 1000,
    editorOptions,
    theme,
  } = props;

  // Can change onChange, debounceTime without editor restart
  const internalState = React.useRef<Pick<IEditorProps, 'onChange' | 'debounceTime'>>();
  internalState.current = { onChange, debounceTime };

  const divRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const model = monaco.editor.createModel(
      code,
      language,
      filename ? monaco.Uri.parse(filename) : undefined,
    );
    const editor = monaco.editor.create(divRef.current!, {
      fontFamily: CODE_FONT_FAMILY,
      accessibilityHelpUrl: 'https://github.com/Microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide',
      // add editorOptions default value here to avoid re-calling the effect
      ...editorOptions,
      model,
    });

    dispatch(Thunk.ensureMonaco({
      editor: redact(editor),
      typescriptDefaults,
      typescript,
    }));

    let debounceTimeout: any;
    editor.onDidChangeModelContent(() => {
      const { debounceTime: currDebounceTime, onChange: currOnChange } = internalState.current!;
      if (currOnChange) {
        debounceTimeout && clearTimeout(debounceTimeout);
        if (currDebounceTime) {
          debounceTimeout = setTimeout(() => currOnChange(model.getValue()), currDebounceTime);
        } else currOnChange(model.getValue());
      }
    });
    
    theme && monaco.editor.setTheme(theme);

    return () => {
      clearTimeout(debounceTimeout);
      model.dispose();
      editor.dispose();
      dispatch(Thunk.clearMonaco({}));
    };
  // }, [code, language, filename, modelRef, internalState, editorOptions, theme]);
  }, []);

  return (
    <div
      ref={divRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default Editor;
