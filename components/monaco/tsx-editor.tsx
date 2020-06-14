import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { TranspiledCode, ICompilerOptions } from '@model/monaco/monaco.model';
import { Thunk, Act } from '@store/editor.duck';
import Editor from './editor';
import { EditorProps } from './editor.model';

const debounceMs = 500;

const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey,
  filename,
  modelKey,
  editorProps,
  onTranspile = () => null,
}) => {
  const model = useSelector(({ editor: worker }) => worker.model[modelKey]?.model);
  const typesLoaded = useSelector(({ editor: worker }) => worker.typesLoaded);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (typesLoaded && model) {
      const act = async () => onTranspile(await dispatch(Thunk.transpileModel({ modelKey })));
      const disposable = dispatch(Thunk.onModelChange({ do: act, debounceMs, editorKey }));
      dispatch(Act.addEditorCleanups({ editorKey, cleanups: [() => disposable?.dispose()] }));
      act();
    }
  }, [typesLoaded, model]);

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
  onTranspile?: (result: TranspiledCode) => void;
  compilerOptions?: ICompilerOptions;
}

export default TsxEditor;
