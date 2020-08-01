import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const portalNode = useSelector(({ devEnv }) => devEnv.appPortal[panelKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {
    if (portalNode) {// Trigger app bootstrap
      dispatch({ type: '[dev-env] app portal is ready', args: { panelKey } });
    } else {// Must be first mount
      dispatch({ type: '[dev-env] create app portal', args: { panelKey } });
    }
  }, [portalNode]);

  // No need to unmount app on component unmount (prefer persist).
  // useEffect(() => () => dispatch({ type: '[dev-env] unmount app instance', args: { panelKey } }), []);

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