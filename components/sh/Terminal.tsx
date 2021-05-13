import { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import { FitAddon } from 'xterm-addon-fit';
import useResizeObserver from 'use-resize-observer';
import { useBeforeunload } from 'react-beforeunload';

import { TtyXterm } from 'model/sh/tty.xterm';
import useSession from 'store/session.store';
import XTermComponent from './XTerm';

const Terminal: React.FC<Props> = ({ sessionKey, env }) => {

  const session = useSession(({ session }) =>
    sessionKey in session ? session[sessionKey] : null
  );

  useEffect(() => {
    // Had hot-reload issues with api.ensureSession
    useSession.api.createSession(sessionKey, env);
    return () => useSession.api.removeSession(sessionKey);
  }, [sessionKey]);

  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLElement>();
  const fitAddonRef = useRef<FitAddon>();
  useEffect(() => fitAddonRef.current?.fit(), [width, height]);

  // TODO option to turn off?
  const persistOnUnload = useCallback(() =>
    useSession.api.persist(sessionKey), [],
  );
  useBeforeunload(persistOnUnload);

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
            /**
             * We wait because session[sessionKey] is not yet defined (?!),
             * e.g. on hot reload after edit ancestral html.
             */
            setTimeout(() => session.ttyShell.initialise(ttyXterm));
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
            scrollback: 250,
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
  grid-area: terminal;
  background: black;
`;

const XTerm = dynamic(() =>
  import('components/sh/XTerm'), { ssr: false },
) as typeof XTermComponent;

export default Terminal;
