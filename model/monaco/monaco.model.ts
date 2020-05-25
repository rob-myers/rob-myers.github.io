// This import MUST be from the API file (not the root) to prevent Monaco from being pulled into the main bundle.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export type ICompilerOptions = monaco.languages.typescript.CompilerOptions;
export type IMonacoTextModel = monaco.editor.ITextModel;
export type IMonacoEditorOptions = monaco.editor.IEditorOptions;

import { LanguageServiceDefaultsImpl as TypescriptDefaults } from './monaco-typescript.d';

export interface TsDefaults {
  typescriptDefaults: TypescriptDefaults;
  javascriptDefaults: TypescriptDefaults;
}
export interface TypescriptDeps extends TsDefaults {
  typescript: typeof monaco['languages']['typescript'];
}

/**
 * TODO understand packages/tsx-editor/src/utilities/defaultSupportedPackages.ts
 */
import { IPackageGroup } from './packages.model';
export const SUPPORTED_PACKAGES = [] as IPackageGroup[];

export const accessibilityHelpUrl = 'https://github.com/Microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide';
