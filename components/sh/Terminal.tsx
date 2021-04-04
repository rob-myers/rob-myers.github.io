import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import { FitAddon } from 'xterm-addon-fit';
import useResizeObserver from 'use-resize-observer';

import { TtyXterm } from 'model/sh/tty.xterm';
import useSessionStore from 'store/session.store';
import XTermComponent from './XTerm';

const Terminal: React.FC<Props> = ({ sessionKey, env }) => {

  const session = useSessionStore(({ session }) =>
    sessionKey in session ? session[sessionKey] : null
  );

  useEffect(() => {
    useSessionStore.api.createSession(sessionKey, env);
    return () => useSessionStore.api.removeSession(sessionKey);
  }, [sessionKey]);

  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLElement>();
  const fitAddonRef = useRef<FitAddon>();
  useEffect(() => fitAddonRef.current?.fit(), [width, height]);

  return (
    <Root ref={ref}>
      {session ? (
        <XTerm
          onMount={(xterm, fitAddon) => {
            const ttyXterm = new TtyXterm(
              xterm, // xterm.js instance
              session.key,
              session.ttyIo,
            );
            ttyXterm.initialise();
            fitAddonRef.current = fitAddon;
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
      ) : null}
    </Root>
  )
};

interface Props {
  sessionKey: string;
  /** Can initialise variables */
  env: Record<string, any>;
}

const Root = styled.section<{}>`
  background: black;
`;

const XTerm = dynamic(() =>
  import('components/sh/XTerm'), { ssr: false },
) as typeof XTermComponent;

export default Terminal;
