import * as portals from 'react-reverse-portal';
import useStore from "@store/env.store";
import { useEffect } from 'react';
import { Props } from './env';
import css from './env.scss';

const EnvPortal: React.FC<Props> = ({ envKey, high }) => {
  const portalNode = useStore(({ envPortal }) => envPortal[envKey]?.portalNode);

  useEffect(() => {
    useStore.api.ensureEnvPortal(envKey);
  }, []);

  return portalNode
    ? <portals.OutPortal node={portalNode} high={high} />
    : <div className={css.root} />;
};

export default EnvPortal;
