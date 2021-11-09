import React from 'react';
import { styled } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import type { ITerminalOptions } from 'xterm';

import { TtyXterm } from 'model/sh/tty.xterm';
import useSession from 'store/session.store';
import { XTerm } from 'components/dynamic';

export default function Terminal({ sessionKey, env }: Props) {
  const session = useSession(({ session }) => sessionKey in session ? session[sessionKey] : null);

  useBeforeunload(() => useSession.api.persist(sessionKey));

  React.useEffect(() => {
    // useSession.api.ensureSession(sessionKey, env);
    useSession.api.createSession(sessionKey, env);
    return () => useSession.api.removeSession(sessionKey);
  }, [sessionKey]);


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

const Root = styled('div')<{}>`
  grid-area: terminal;
  background: black;
  height: 100%;
  padding: 4px;
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
