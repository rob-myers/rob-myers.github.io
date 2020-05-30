import { IEditorProps } from './editor.model';
import { ICompilerOptions, ITransformedCode } from '@model/monaco/monaco.model';

export interface ITsxEditorProps {
  editorKey: string;
  modelKey: string;
  /**
   * Props to pass through to the editor, such as the code and editor size.
   * WARNING: Changing some of these props will re-create the editor. See IEditorProps docs for details.
   * (Changing the wrapper object won't create problems.)
   */
  editorProps: IEditorProps;

  /**
   * Callback to notify when transforming finishes.
   * If successful, `result.component` will be the example component you should render.
   * (The editor doesn't render the component itself to avoid stomping on existing React-managed DOM.)
   */
  onTransform?: (result: ITransformedCode) => void;

  /**
   * TS compiler option overrides. Overrides to certain options essential to the TsxEditor's
   * functioning will be ignored. Also be warned that Monaco does not properly handle the full set
   * of options supported by TS, so some options (particularly `lib`) may not work as expected.
   */
  compilerOptions?: ICompilerOptions;
}