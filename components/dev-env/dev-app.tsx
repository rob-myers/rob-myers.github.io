import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';

import { Thunk } from '@store/dev-env.duck';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const portalNode = useSelector(({ devEnv }) => devEnv.appPortal[panelKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {// Need this signal to trigger app bootstrap
    portalNode && dispatch(Thunk.appPortalIsReady({ panelKey }));
  }, [portalNode]);

  useEffect(() => {
    return () => {
      dispatch(Thunk.tryUnmountAppInstance({ panelKey }));
    };
  }, []);

  return (
    portalNode ? (// App instance (see AppPortals)
      <portals.OutPortal node={portalNode} />
    ) : null
  );
};

interface Props {
  panelKey: string;
}

export default DevApp;