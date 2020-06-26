import * as React from 'react';

import { ICompilerOptions, TranspilationResult } from '@model/monaco/monaco.model';
import Editor from './editor';
import { EditorProps } from './editor.model';

/**
 * TODO remove this file (only used by old demo)
 */
const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey,
  filename,
  modelKey,
  editorProps,
}) => {
  return (
    <Editor
      {...editorProps}
      editorKey={editorKey}
      filename={filename}
      modelKey={modelKey}
    />
  );
};

export interface ITsxEditorProps {
  editorKey: string;
  filename: string;
  modelKey: string;
  editorProps: EditorProps;
  onTranspile?: (result: TranspilationResult) => void;
  compilerOptions?: ICompilerOptions;
}

export default TsxEditor;
