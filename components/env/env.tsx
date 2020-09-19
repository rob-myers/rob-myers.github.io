import { useEffect } from 'react';
import useStore, { selectApi, selectNavWorker } from '@store/env.store';
import World from '@components/3d/world';
import Terminal from '@components/shell/terminal'
import css from './env.scss';

const Env: React.FC<Props> = ({ envKey, high }) => {
  const api = useStore(selectApi);
  const navWorker = useStore(selectNavWorker);

  useEffect(() => {
    if (navWorker) {
      api.createEnv({ envKey, highWalls: !!high });
      return () => api.removeEnv(envKey);
    }
  }, [navWorker]);

  useEffect(() => api.setHighWalls(envKey, !!high), [high]);

  return (
    <section className={css.root}>
      <World envName={envKey} />
      <Terminal envName={envKey} />
    </section>
  )
};

interface Props {
  envKey: string;
  high?: boolean;
}

export default Env;
