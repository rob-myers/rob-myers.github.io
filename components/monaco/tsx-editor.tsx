import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { TranspiledCode, ICompilerOptions } from '@model/monaco/monaco.model';
import { Thunk } from '@store/editor.duck';
import Editor from './editor';
import { EditorProps } from './editor.model';

const transpileDebounceMs = 500;

const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey,
  modelKey,
  editorProps,
  onTranspile: onTransform = () => null,
}) => {
  const model = useSelector(({ editor: worker }) => worker.model[modelKey]?.model);
  const typesLoaded = useSelector(({ editor: worker }) => worker.typesLoaded);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (typesLoaded && model) {
      const act = async () => onTransform(await dispatch(Thunk.transpileModel({ modelKey })));
      dispatch(Thunk.onModelChange({ act, debounceMs: transpileDebounceMs, editorKey }));
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
  editorProps: EditorProps;
  onTranspile?: (result: TranspiledCode) => void;
  compilerOptions?: ICompilerOptions;
}

export default TsxEditor;
