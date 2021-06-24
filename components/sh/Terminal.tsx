import { useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { useBeforeunload } from 'react-beforeunload';
import type { ITerminalOptions } from 'xterm';

import { TtyXterm } from 'model/sh/tty.xterm';
import useSession from 'store/session.store';
import { XTerm } from 'components/dynamic';

export default function Terminal({ sessionKey, env }: Props) {
  const session = useSession(({ session }) =>
    sessionKey in session ? session[sessionKey] : null
  );

  useEffect(() => {// Had hot-reload issues with api.ensureSession
    useSession.api.createSession(sessionKey, env);
    return () => useSession.api.removeSession(sessionKey);
  }, [sessionKey]);

  // TODO move elsewhere
  const persistOnUnload = useCallback(() =>
    useSession.api.persist(sessionKey), [],
  );
  useBeforeunload(persistOnUnload);

  return (
    <Root>
      {session ? (
        <XTerm
          onMount={(xterm) => {
            const ttyXterm = new TtyXterm(
              xterm, // xterm.js instance
              session.key,
              session.ttyIo,
            );
            ttyXterm.initialise();
            /**
             * We wait because session[sessionKey] is not yet defined (?!),
             * e.g. on hot reload after edit ancestral html.
             */
            setTimeout(() => session.ttyShell.initialise(ttyXterm));
          }}
          options={options}
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
  height: 100%;
`;

const options: ITerminalOptions = {
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
};
