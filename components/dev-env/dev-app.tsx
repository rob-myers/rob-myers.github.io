import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';

import { panelKeyToEditorKey } from '@model/dev-env/dev-env.model';
import { filenameToModelKey } from '@model/monaco/monaco.model';
import { Thunk } from '@store/dev-env.duck';
import Editor from '@components/monaco/editor';
import css from './dev-app.scss';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const monacoLoaded = useSelector(({ editor: { monacoLoaded } }) => monacoLoaded);
  const portalNode = useSelector(({ devEnv }) => devEnv.appPortal[panelKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {// Need this signal to trigger app bootstrap
    portalNode && dispatch(Thunk.appPortalIsReady({ panelKey }));
  }, [portalNode]);

  return (
    <>
      {portalNode && (// App instance (see AppPortals)
        <portals.OutPortal node={portalNode} />
      )}

      {!monacoLoaded && (
        // Ensure monaco is bootstrapped via hidden editor
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