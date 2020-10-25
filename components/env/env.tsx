import { useEffect } from 'react';
import useStore from '@store/env.store';
import Terminal from '@components/shell/terminal'

const Env: React.FC<Props> = ({ envKey, children }) => {
  const { api } = useStore.getState();

  useEffect(() => {
      api.createEnv({ envKey });
      return () => {
        // NOTE won't unmount if created via EnvPortal
        api.removeEnv(envKey);
      }
  }, []);

  return (
    <>
      {children}
      <Terminal envName={envKey} />
    </>
  )
};

export interface Props {
  envKey: string;
}

export default Env;
