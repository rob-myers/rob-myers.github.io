import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TtyXterm } from 'model/sh/tty.xterm';
// import { scrollback } from 'model/sh/io.model';
import useSessionStore from 'store/session.store';
import XTermComponent from './XTerm';
import styles from 'styles/Terminal.module.css';

const Terminal: React.FC<{ sessionKey: string }> = ({ sessionKey }) => {

  const session = useSessionStore(({ session }) =>
    sessionKey in session ? session[sessionKey] : null
  );

  useEffect(() => {
    useSessionStore.api.createSession(sessionKey);
    return () => {
      useSessionStore.api.removeSession(sessionKey);
    };
  }, [sessionKey]);

  return session ? (
    <XTerm
      className={styles.container}
      onMount={(xterm) => {

        const ttyXterm = new TtyXterm(
          xterm, // xterm.js instance
          session.key,
          session.ttyIo,
        );

        ttyXterm.initialise();
        session.ttyShell.initialise(ttyXterm);
      }}
      options={{
        allowProposedApi: true, // Needed for WebLinksAddon
        fontSize: 16,
        cursorBlink: true,
        rendererType: 'canvas',
        theme: {
          background: 'black',
          foreground: '#41FF00',
        },
        convertEol: false,
        scrollback: 50,
        rows: 50,
      }}
    />
  ) : null;
};

const XTerm = dynamic(() =>
  import('components/sh/XTerm'), { ssr: false }) as typeof XTermComponent;

export default Terminal;
