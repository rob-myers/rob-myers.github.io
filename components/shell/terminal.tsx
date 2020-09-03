import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import useStore from '@store/shell.store';
import { TtyXterm } from '@model/shell/tty.xterm';
import XTermComponent from './xterm';
import css from './terminal.scss';

const XTerm = dynamic(() =>
  import('@components/shell/xterm'), { ssr: false }) as typeof XTermComponent;

const Terminal: React.FC<Props> = ({ alias }) => {
  const session = useStore(({ session, toSessionKey }) => session[toSessionKey[alias]]);
  const api = useStore(({ api }) => api);

  useEffect(() => {
    api.createSession(alias);
    return () => {
      api.removeSession(alias);
    };
  }, []);

  return (
    session ? <XTerm
      className={css.terminal}
      onMount={(xterm) => {
        const { ttyShell } = session;

        const ttyXterm = new TtyXterm(
          xterm, // xterm.js instance
          ttyShell.sessionKey,
          ttyShell.io,
        );

        ttyXterm.initialise();
        ttyShell.initialise(ttyXterm);
      }}  
      options={{
        fontSize: 12,
        cursorBlink: true,
        rendererType: 'dom',
        theme: {
          background: 'black',
          foreground: '#41FF00',
        },
      }}
    /> : null
  );
}

interface Props {
  alias: string;
}

export default Terminal;
