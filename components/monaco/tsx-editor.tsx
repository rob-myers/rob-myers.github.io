import shortid from 'shortid';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ITsxEditorProps } from './tsx-editor.model';
import { Thunk } from '@store/worker.duck';
import Editor from './editor';

const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey: baseEditorKey,
  modelKey,
  editorProps,
  onTransform = () => null,
}) => {
  const editorUid = React.useRef(`${baseEditorKey}-${shortid.generate()}`);
  const editorKey = editorUid.current;
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

export default TsxEditor;
