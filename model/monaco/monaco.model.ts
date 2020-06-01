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
export type TranspiledCode = (
  | { key: 'success'; transpiledJs: string; typings: string }
  | { key: 'error'; message: string | string[] }
);

export interface IDiagnostic {
  category: number;
  code: number;
  start?: number;
  length?: number;
  messageText: string | { messageText: string; code: number };
}

import { IEditorProps } from '@components/monaco/editor.model';
import { exampleTsx3 } from '@model/code/examples';

export const tsxEditorProps: IEditorProps = {
  language:'typescript',
  theme: 'vs-dark',
  editorOptions: {},
  filename: 'file:///main.tsx',
  className: 'monaco-tsx-editor',
  code: exampleTsx3,
  width: '100%',
};

export type FileType = 'tsx' | 'scss';
export const permute = (type: FileType): FileType => type === 'scss' ? 'tsx' : 'scss';
export const emptyTranspile: TranspiledCode = { key: 'success', transpiledJs: '', typings: '' };

export interface DevModule {
  key: string;
  type: 'js' | 'css';
  blobUrl: string;
  code: string;
}
