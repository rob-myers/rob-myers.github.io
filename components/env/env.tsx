import { useEffect } from 'react';
import useStore, { selectApi } from '@store/env.store';
import World from '@components/3d/world';
import Terminal from '@components/shell/terminal'
import css from './env.scss';

const Env: React.FC<Props> = ({ envName, high }) => {
  const api = useStore(selectApi);
  
  useEffect(() => {
    api.createEnv({ envName, highWalls: !!high });
    return () => api.removeEnv(envName);
  }, []);

  useEffect(() => api.setHighWalls(envName, !!high), [high]);

  return (
    <div className={css.root}>
      <World envName={envName} />
      <Terminal alias="test" />
    </div>
  )
};

interface Props {
  envName: string;
  high?: boolean;
}

export default Env;
