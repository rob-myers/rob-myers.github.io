import React from 'react';
import { styled } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import type { ITerminalOptions } from 'xterm';

import { TtyXterm } from 'model/sh/tty.xterm';
import { canTouchDevice } from 'projects/service/dom';
import useSession from 'store/session.store';
import useOnResize from 'projects/hooks/use-on-resize';
import { XTerm } from 'components/dynamic';
import { TouchHelperUI } from './TouchHelperUi';

export default function Terminal({ sessionKey, env }: Props) {

  const session = useSession(({ session }) => session[sessionKey]??null);
  // TODO move to e.g. _app.tsx
  useBeforeunload(() => useSession.api.persist(sessionKey));

  const isTouchDevice = useOnResize(canTouchDevice);

  React.useEffect(() => {
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

      {session && isTouchDevice && (
        <TouchHelperUI session={session} />
      )}
    </Root>
  )
};

interface Props {
  sessionKey: string;
  /** Can initialize variables */
  env: {
    [envVarName: string]: any;
  };
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
  // mobile: can select single word via long press
  // rightClickSelectsWord: true,
  theme: {
    background: 'black',
    foreground: '#41FF00',
  },
  convertEol: false,
  scrollback: 250,
  rows: 50,
};
