import * as React from 'react';
import { ITsxEditorProps } from './tsx-editor.model';
import { transpileAndEval } from '@model/monaco/transpile';
import { SUPPORTED_PACKAGES } from '@model/monaco/supported-packages';
import { IEditorProps } from './editor.model';
import Editor from './editor';
import { useSelector } from 'react-redux';
import { RootState } from '@store/reducer';

const filename = 'file:///main.tsx';

/**
 * Wrapper for rendering a Monaco instance and also
 * transpiling/eval-ing the React example code inside.
 */
const TsxEditor: React.FunctionComponent<ITsxEditorProps> = ({
  editorProps,
  onTransformFinished,
  supportedPackages = SUPPORTED_PACKAGES,
}) => {
  const model = useSelector(({ worker }: RootState) => worker.monacoEditor?.getModel());
  const typesLoaded = useSelector(({ worker }: RootState) => worker.monacoTypesLoaded);

  // Store latest onChange in ref, ensuring latest values without forced re-render
  const onChangeRef = React.useRef<IEditorProps['onChange']>();
  onChangeRef.current = (text: string) => {
    editorProps.onChange && editorProps.onChange(text);
    transpileAndEval(model!, supportedPackages).then(onTransformFinished);
  };

  // After type checking and globals are set up, call onChange to transpile
  React.useEffect(() => {
    if (typesLoaded && model) {
      onChangeRef.current!(model.getValue());
    }
  }, [onChangeRef, typesLoaded, model]);

  return (
    <Editor
      {...editorProps}
      filename={filename}
      // Don't track changes until types have loaded
      onChange={typesLoaded ? onChangeRef.current : undefined}
    />
  );
};

export default TsxEditor;
