import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';

const DevApp: React.FC<Props> = ({ panelKey, appRoot }) => {
  const portalNode = useSelector(({ devEnv }) => devEnv.appPortal[panelKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {
    if (portalNode) {// Trigger app bootstrap
      dispatch({ type: '[dev-env] app portal is ready', args: { panelKey, appRoot } });
    } else {// 1st ever mount
      dispatch({ type: '[dev-env] create app portal', args: { panelKey, appRoot } });
    }
  }, [portalNode]);

  // No need to unmount app, prefer persist.
  // useEffect(() => () => dispatch({ type: '[dev-env] unmount app instance', args: { panelKey } }), []);

  return (
    portalNode ? (// See AppPortals
      <portals.OutPortal node={portalNode} />
    ) : null
  );
};

interface Props {
  panelKey: string;
  appRoot: string;
}

export default DevApp;