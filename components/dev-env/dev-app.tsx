import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { panelKeyToAppElId } from '@model/code/dev-env.model';
import { Act } from '@store/dev-env.duck';
import Editor from '@components/monaco/editor';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const dispatch = useDispatch();
  const monacoLoaded = useSelector(({ editor: { monacoLoaded } }) => monacoLoaded);

  useEffect(() => {
    dispatch(Act.rememberAppPanel({ panelKey }));
    return () => {
      dispatch(Act.forgetAppPanel({ panelKey }));
    };
  }, []);

  return (
    <div>
      <div
        id={panelKeyToAppElId(panelKey)}
        style={{ padding: 8, color: 'white' }}
      >
        App not mounted
      </div>
      {!monacoLoaded && (
        /**
         * In case no monaco editor panel is initially open,
         * we ensure monaco is bootstrapped via hidden editor.
         */
        <div style={{ display: 'none' }}>
          <Editor
            editorKey={'_bootstrap-editor'}
            modelKey={'_bootstrap-model'}
            filename={'_bootstrap.ts'}
          />
        </div>
      )}
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevApp;