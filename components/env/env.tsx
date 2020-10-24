import { useEffect } from 'react';
import useStore from '@store/env.store';
import Terminal from '@components/shell/terminal'
import css from './env.scss';

const Env: React.FC<Props> = ({ envKey }) => {
  const { api } = useStore.getState();

  useEffect(() => {
      api.createEnv({ envKey });
      return () => {
        // NOTE won't unmount if created via EnvPortal
        api.removeEnv(envKey);
      }
  }, []);

  return (
    <section className={css.root}>
      <Terminal envName={envKey} />
    </section>
  )
};

export interface Props {
  envKey: string;
}

export default Env;
