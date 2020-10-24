import * as portals from 'react-reverse-portal';
import useStore from "@store/env.store";
import { useEffect } from 'react';
import { Props } from './env';
import css from './env.scss';

const EnvPortal: React.FC<Props> = ({ envKey }) => {
  const portalNode = useStore(({ envPortal }) => envPortal[envKey]?.portalNode);

  useEffect(() => {
    useStore.api.ensureEnvPortal(envKey);
  }, []);

  // Wrap in div to avoid react-refresh errors
  return (
    <div>
      {portalNode
        ? <portals.OutPortal node={portalNode} />
        : <div className={css.root} />
      }
    </div>
  );
  
};

export default EnvPortal;
