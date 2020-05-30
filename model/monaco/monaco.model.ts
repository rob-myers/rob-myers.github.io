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
export interface ITransformedCode {
  /** Transpiled code (defined unless there's an error) */
  output?: string;
  /** Transpile/eval error, if any */
  error?: string | string[];
}

export interface PostTransformParams {
  /**
   * TS for the example. Will be used to find imports/exports. Will also be used in the final
   * returned code if `jsCode` is not provided.
   */
  tsCode: string;

  /**
   * The example transpiled into JS, output module format ES2015 or ESNext.
   * Will be used in the final returned code if provided.
   */
  jsCode?: string;

  /**
   * If false, the returned code will end with a `ReactDOM.render(...)` line and won't be wrapped
   * in a function.
   * If true, the returned code will be wrapped in a function of type `ExampleWrapperFunction`,
   * which should be called with the correct local version of React (to avoid hook errors due to
   * React mismatches in case there's a global React) and returns the component.
   */
  returnFunction?: boolean;

  /** ID for the component to be rendered into (required unless `returnFunction` is true) */
  id?: string;
}

/** Partial ts.Diagnostic @internal */
export interface IDiagnostic {
  category: number;
  code: number;
  start?: number;
  length?: number;
  messageText: string | { messageText: string; code: number };
}
