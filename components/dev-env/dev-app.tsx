import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { panelKeyToAppElId, panelKeyToEditorKey, filenameToModelKey } from '@model/code/dev-env.model';
import { Act } from '@store/dev-env.duck';
import Editor from '@components/monaco/editor';
import css from './dev-app.scss';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const dispatch = useDispatch();
  const monacoLoaded = useSelector(({ editor: { monacoLoaded } }) => monacoLoaded);

  useEffect(() => {
    dispatch(Act.createAppPanelMeta({ panelKey }));
    return () => {
      dispatch(Act.forgetPanelMeta({ panelKey }));
    };
  }, []);

  return (
    <>
      <div id={panelKeyToAppElId(panelKey)} style={{ height: '100%' }}>
        <div // This placeholder is removed via react app mount
          className={css.appNotMounted}
        >
          App not mounted
        </div>
      </div>

      {!monacoLoaded && (
        // Ensure monaco is bootstrapped via hidden editor.
        <div className={css.hiddenMonacoEditor}>
          <Editor
            editorKey={panelKeyToEditorKey(panelKey)}
            modelKey={filenameToModelKey('_bootstrap.ts')}
            filename={'_bootstrap.ts'}
          />
        </div>
      )}
    </>
  );
};

interface Props {
  panelKey: string;
}

export default DevApp;