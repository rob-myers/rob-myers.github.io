import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { TranspiledCode, ICompilerOptions } from '@model/monaco/monaco.model';
import { Thunk } from '@store/worker.duck';
import Editor from './editor';
import { IEditorProps } from './editor.model';

const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey,
  modelKey,
  editorProps,
  onTranspile: onTransform = () => null,
}) => {
  const model = useSelector(({ worker }) => worker.monacoEditor[editorKey]?.editor.getModel());
  const typesLoaded = useSelector(({ worker }) => worker.monacoTypesLoaded);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (typesLoaded && model) {
      const act = async () => onTransform(await dispatch(Thunk.transpileModel({ modelKey })));
      dispatch(Thunk.onModelChange({ act, debounceMs: 1000, editorKey }));
      act();
    }
  }, [typesLoaded, model]);

  return (
    <Editor
      {...editorProps}
      editorKey={editorKey}
      modelKey={modelKey}
      filename={`file:///${modelKey}.main.tsx`}
    />
  );
};

export interface ITsxEditorProps {
  editorKey: string;
  modelKey: string;
  editorProps: IEditorProps;
  onTranspile?: (result: TranspiledCode) => void;
  compilerOptions?: ICompilerOptions;
}

export default TsxEditor;
