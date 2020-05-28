// This import MUST be from the API file (not the root) to prevent Monaco from being pulled into the main bundle.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export type ICompilerOptions = monaco.languages.typescript.CompilerOptions;
export type IMonacoTextModel = monaco.editor.ITextModel;
export type IMonacoEditorOptions = monaco.editor.IEditorOptions;

import monacoTs from './monaco-typescript.d';
export type TypescriptDefaults = monacoTs.LanguageServiceDefaultsImpl;
export type Typescript = typeof monaco['languages']['typescript'];
export type Monaco = typeof monaco;

/**
 * TODO understand:
 * packages/tsx-editor/src/utilities/defaultSupportedPackages.ts
 */
import { IPackageGroup } from './packages.model';
export const SUPPORTED_PACKAGES = [] as IPackageGroup[];

export const accessibilityHelpUrl = 'https://github.com/Microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide';

export interface MonacoRangeClass {
  new (startLine: number, start: number, endLine: number, end: number): monaco.Range;
}

export type Editor = monaco.editor.IStandaloneCodeEditor;
