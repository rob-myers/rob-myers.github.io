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
export type TsTranspilationResult = (
  | { key: 'success'; src: string; transpiledJs: string; typings: string }
  | { key: 'error'; message: string | string[] }
);

export interface IDiagnostic {
  category: number;
  code: number;
  start?: number;
  length?: number;
  messageText: string | { messageText: string; code: number };
}

import { EditorProps } from '@components/monaco/editor.model';
import { SassResultError } from 'sass.js/dist/sass';

export const baseTsxEditorProps: EditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  filename: 'file:///main.tsx',
  className: 'monaco-tsx-editor',
  width: '100%',
  height: '100%',
};

export type FileType = 'tsx' | 'scss';
export const permute = (type: FileType): FileType => type === 'scss' ? 'tsx' : 'scss';
export const emptyTranspile: TsTranspilationResult = { key: 'success', src: '', transpiledJs: '', typings: '' };

export interface DevModule {
  key: string;
  type: 'js' | 'css';
  blobUrl: string;
  code: string;
}

export type Uri = monaco.Uri;

export type IMarkerData = monaco.editor.IMarkerData;

export interface ScssImportInterval {
  value: string;
  match: string;
  start: number;
  startLineNumber: number;
  startColumn: number;
}

export type ScssTranspilationResult = (
  | { key: 'success'; src: string; dst: string }
  | { key: 'error' } & (
    | { errorKey: 'sass.js'; error: SassResultError }
    | { errorKey: 'missing-import'; dependency: string }
    | { errorKey: 'cyclic-dep'; dependency: string }
  )
);

export function addScssPrefixes(contents: string, filename: string) {
  return contents.replace(/(\.\S+)/g, `${filename}__$1`);
}
