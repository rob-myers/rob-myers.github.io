import { IMonacoEditorOptions } from '@model/monaco/monaco.model';

export interface EditorProps {
  /** Defaults to `default-editor`. */
  editorKey: string;
  /** Defaults to `default-model`. */
  modelKey: string;
  height: number | string;
  width: number | string;

  /** Defaults to `100`. */
  minHeight?: number | string;
  /** Class for the div containing the editor. */
  className?: string;
  /** Initial code to edit. */
  code?: string;
  /** Editor code language. */
  language?: string;
  /** Name for the fake file e.g. `file:///main.tsx`. */
  filename: string;
  /** Label for the editor for screen reader users. */
  ariaLabel?: string;
  /** Options for creating the editor. */
  editorOptions?: IMonacoEditorOptions;
  /** Callback to notify when the text changes. */
  theme?: string;
}

/** Font family for code snippets/editors */
export const CODE_FONT_FAMILY = 'Monaco, Menlo, Consolas, "Droid Sans Mono", "Inconsolata", "Courier New", monospace';
