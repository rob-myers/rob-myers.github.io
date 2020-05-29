import shortid from 'shortid';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

import { ITsxEditorProps } from './tsx-editor.model';
import { transpileAndTransform } from '@model/monaco/transpile';
import { SUPPORTED_PACKAGES } from '@model/monaco';
import Editor from './editor';

/**
 * Monaco editor for tsx which transpiles the code.
 */
const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey: baseEditorKey,
  modelKey,
  editorProps,
  onTransform = () => null,
  packages = SUPPORTED_PACKAGES,
}) => {
  const editorUid = React.useRef(`${baseEditorKey}-${shortid.generate()}`);
  const editorKey = editorUid.current;
  const model = useSelector(({ worker }) => worker.monacoEditor[editorKey]?.editor.getModel());
  const stream = useSelector(({ worker }) => worker.monacoEditor[editorKey]?.stream);
  const typesLoaded = useSelector(({ worker }) => worker.monacoTypesLoaded);

  // Transpile and transform on model change
  React.useEffect(() => {
    let sub: Subscription;
    if (typesLoaded && model) {
      sub = stream.pipe(
        filter((msg) => msg.key === 'content-changed' && msg.editorKey === editorKey),
        debounceTime(1000),
      ).subscribe(async () => onTransform(await transpileAndTransform(model, packages)));
      stream.next({ key: 'content-changed', editorKey, modelKey });
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
