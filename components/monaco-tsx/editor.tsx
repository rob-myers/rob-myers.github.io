import * as monaco from 'monaco-editor';
import * as React from 'react';
import { IEditorProps } from './editor.model';
import { CODE_FONT_FAMILY, DEFAULT_WIDTH, DEFAULT_HEIGHT } from './consts';
import { IMonacoTextModel } from '@model/monaco';

/**
 * Language-agnostic wrapper for a Monaco editor instance.
 */
const Editor: React.FC<IEditorProps> = (props: IEditorProps) => {
  const {
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    className,
    code = '',
    language,
    filename,
    onChange,
    debounceTime = 1000,
    ariaLabel,
    editorOptions,
    theme,
  } = props;

  const backupModelRef = React.useRef<IMonacoTextModel>();
  const modelRef = props.modelRef || backupModelRef;

  // Can change onChange, debounceTime without editor restart
  const internalState = React.useRef<Pick<IEditorProps, 'onChange' | 'debounceTime'>>();
  internalState.current = { onChange, debounceTime };

  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const model = (modelRef.current = monaco.editor.createModel(
      code,
      language,
      filename ? monaco.Uri.parse(filename) : undefined,
    ));
    const editor = monaco.editor.create(divRef.current!, {
      minimap: { enabled: false },
      fontFamily: CODE_FONT_FAMILY,
      ariaLabel,
      accessibilityHelpUrl: 'https://github.com/Microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide',
      // add editorOptions default value here (NOT in main destructuring) to avoid re-calling the effect
      ...(editorOptions || {}),
      model,
    });

    // Handle changes (debounced)
    let debounceTimeout: any;
    editor.onDidChangeModelContent(() => {
      // Destructure these locally to get the latest values
      const { debounceTime: currDebounceTime, onChange: currOnChange } = internalState.current!;
      if (!currOnChange) {
        return;
      }

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      if (currDebounceTime) {
        debounceTimeout = setTimeout(() => currOnChange(model.getValue()), currDebounceTime);
      } else {
        currOnChange(model.getValue());
      }
    });

    return () => {
      clearTimeout(debounceTimeout);
      model.dispose();
      editor.dispose();
      modelRef.current = undefined;
    };
  }, [code, language, filename, modelRef, internalState, ariaLabel, editorOptions]);


  React.useEffect(() => {
    theme && monaco.editor.setTheme(theme);
  }, [theme]);

  return (
    <div
      ref={divRef}
      style={{ width, height }}
      className={className}
    />
  );
};

export default Editor;
