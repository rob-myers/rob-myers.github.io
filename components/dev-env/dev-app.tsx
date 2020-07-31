import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const portalNode = useSelector(({ devEnv }) => devEnv.appPortal[panelKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: '[dev-env] create app portal', args: { panelKey } });
    return () => dispatch({ type: '[dev-env] remove app instance', args: { panelKey } });
  }, []);

  useEffect(() => {// This signal triggers app bootstrap
    portalNode && dispatch({ type: '[dev-env] app portal is ready', args: { panelKey } });
  }, [portalNode]);

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