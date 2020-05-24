import * as React from 'react';
import { useSelector } from 'react-redux';
import { ITsxEditorProps } from './tsx-editor.model';
import { transpileAndEval } from '@model/monaco/transpile';
import { SUPPORTED_PACKAGES } from '@model/monaco';
import { RootState } from '@store/reducer';
import Editor from './editor';

/**
 * Wrapper for rendering a Monaco instance and also
 * transpiling/eval-ing the React example code inside.
 */
const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorKey,
  modelKey,
  editorProps,
  onTransformFinished,
  supportedPackages = SUPPORTED_PACKAGES,
}) => {
  const model = useSelector(({ worker }: RootState) => worker.monacoEditor[editorKey]?.editor.getModel());
  const typesLoaded = useSelector(({ worker }: RootState) => worker.monacoTypesLoaded);

  const onChange = React.useCallback((text: string) => {
    editorProps.onChange && editorProps.onChange(text);
    transpileAndEval(model!, supportedPackages).then(onTransformFinished);
  } , [model]);

  React.useEffect(() => {
    // Wait for globals and types before 1st transpile
    typesLoaded && model && onChange(model.getValue());
  }, [typesLoaded, model]);

  return (
    <Editor
      {...editorProps}
      editorKey={editorKey}
      modelKey={modelKey}
      filename={`file:///${modelKey}.main.tsx`}
      // filename={'file://main.tsx'}
      onChange={onChange}
    />
  );
};

export default TsxEditor;
