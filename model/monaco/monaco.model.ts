// This import MUST be from the API file (not the root) to prevent Monaco from being pulled into the main bundle.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export type ICompilerOptions = monaco.languages.typescript.CompilerOptions;
export type IMonacoTextModel = monaco.editor.ITextModel;
export type IMonacoEditorOptions = monaco.editor.IEditorOptions;

import monacoTs from './monaco-typescript.d';
export type TypescriptDefaults = monacoTs.LanguageServiceDefaultsImpl;
export type Typescript = typeof monaco['languages']['typescript'];
export type Monaco = typeof monaco;

export const accessibilityHelpUrl = 'https://github.com/Microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide';

export type Editor = monaco.editor.IStandaloneCodeEditor;

/** Result of transpiling and/or transforming code */
export type ITransformedCode = (
  | { key: 'success'; transpiledJs: string; typings: string }
  | { key: 'error'; message: string | string[] }
);

/** Partial ts.Diagnostic @internal */
export interface IDiagnostic {
  category: number;
  code: number;
  start?: number;
  length?: number;
  messageText: string | { messageText: string; code: number };
}
