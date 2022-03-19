import React from 'react';
import { styled } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import type { ITerminalOptions } from 'xterm';
import { debounce } from 'debounce';

import { TtyXterm } from 'model/sh/tty.xterm';
import { canTouchDevice } from 'projects/service/dom';
import useSession from 'store/session.store';
import useOnResize from 'projects/hooks/use-on-resize';
import { XTerm } from 'components/dynamic';
import { TouchHelperUI } from './TouchHelperUi';

export default function Terminal({ sessionKey, env }: Props) {

  const session = useSession(({ session }) => session[sessionKey]??null);
  const [offset, setOffset] = React.useState(0);

  // TODO move to e.g. _app.tsx
  useBeforeunload(() => useSession.api.persist(sessionKey));

  const isTouchDevice = useOnResize(canTouchDevice);

  React.useEffect(() => {
    useSession.api.createSession(sessionKey, env);
    return () => useSession.api.removeSession(sessionKey);
  }, [sessionKey]);

  return (
    <Root>
      {session && (
        <>
          <XTerm
            onMount={(xterm) => {
              // `xterm` is an xterm.js instance
              const ttyXterm = new TtyXterm(xterm, session.key, session.ttyIo);
              ttyXterm.initialise();
              session.ttyShell.initialise(ttyXterm);

              // TODO don't run on non-touch-devices
              const updateTouchUiOffset = debounce(() => {
                setOffset(Math.max(1, parseInt(xterm.textarea!.style.top) - 72));
              }, 100);
              ttyXterm.xterm.onLineFeed(() => updateTouchUiOffset());
            }}
            options={options}
          />
          {isTouchDevice &&
            <TouchHelperUI
              session={session}
              offset={offset}
            />
          }
        </>
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
  /** TODO fix padding without scrollbar offset */
`;

const options: ITerminalOptions = {
  allowProposedApi: true, // Needed for WebLinksAddon
  fontSize: 16,
  cursorBlink: true,
  rendererType: 'canvas',
  // mobile: can select single word via long press
  rightClickSelectsWord: true,
  theme: {
    background: 'black',
    foreground: '#41FF00',
  },
  convertEol: false,
  scrollback: 250,
  rows: 50,
};
