import * as portals from 'react-reverse-portal';
import useStore from "@store/env.store";
import { useEffect } from 'react';
import { Props } from './env';

const EnvPortal: React.FC<Props> = ({ envKey, children }) => {
  const portalNode = useStore(({ envPortal }) => envPortal[envKey]?.portalNode);

  useEffect(() => {
    useStore.api.ensureEnvPortal(envKey);
  }, []);

  return (
    <>
      {portalNode &&
        <portals.OutPortal node={portalNode}>
          {children}
        </portals.OutPortal>
      }
    </>
  );
  
};

export default EnvPortal;
