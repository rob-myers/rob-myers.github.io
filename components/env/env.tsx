import { useEffect, useCallback } from 'react';
import useStore, { selectApi } from '@store/env.store';
import World from '@components/3d/world';
import Terminal from '@components/shell/terminal'
import css from './env.scss';

const Env: React.FC<Props> = ({ envKey, high }) => {
  const api = useStore(selectApi);

  useEffect(() => {
    api.createEnv({ envKey, highWalls: !!high });
    return () => api.removeEnv(envKey);
  }, []);

  useEffect(() => api.setHighWalls(envKey, !!high), [high]);

  const onShellReady = useCallback(() => {
    api.connectToWorldDevice(envKey);
  }, []);

  return (
    <div className={css.root}>
      <World envName={envKey} />
      <Terminal envName={envKey} onShellReady={onShellReady} />
    </div>
  )
};

interface Props {
  envKey: string;
  high?: boolean;
}

export default Env;
