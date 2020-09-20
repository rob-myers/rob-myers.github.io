import * as portals from 'react-reverse-portal';
import useStore from "@store/env.store";
import { useEffect } from 'react';
import { Props } from './env';

const EnvPortal: React.FC<Props> = ({ envKey, high }) => {
  const portalNode = useStore(({ envPortal }) => envPortal[envKey]?.portalNode);

  useEffect(() => {
    useStore.getState().api.ensureEnvPortal(envKey);
  }, []);

  return portalNode
    ? <portals.OutPortal node={portalNode} high={high} />
    : null;
};

export default EnvPortal;
