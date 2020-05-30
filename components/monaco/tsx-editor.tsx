import shortid from 'shortid';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ITsxEditorProps } from './tsx-editor.model';
import { Thunk } from '@store/worker.duck';
import Editor from './editor';

/**
 * Monaco editor for tsx which transpiles the code.
 */
const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey: baseEditorKey,
  modelKey,
  editorProps,
  onTransform = () => null,
}) => {
  const editorUid = React.useRef(`${baseEditorKey}-${shortid.generate()}`);
  const editorKey = editorUid.current;
  const model = useSelector(({ worker }) => worker.monacoEditor[editorKey]?.editor.getModel());
  const stream = useSelector(({ worker }) => worker.monacoEditor[editorKey]?.stream);
  const typesLoaded = useSelector(({ worker }) => worker.monacoTypesLoaded);
  const dispatch = useDispatch();

  React.useEffect(() => {
    let sub: Subscription;
    if (typesLoaded && model) {
      sub = stream.pipe(debounceTime(1000)).subscribe(async () => {
        onTransform(await dispatch(Thunk.transpileModel({ modelKey })));
      });
      stream.next(null); // Initial trigger
    }
    return () => sub?.unsubscribe();
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
