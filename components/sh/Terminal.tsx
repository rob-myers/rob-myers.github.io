import React from 'react';
import { styled } from 'goober';
import type { ITerminalOptions } from 'xterm';
import { debounce } from 'debounce';

import { TtyXterm } from 'projects/sh/tty.xterm';
import { canTouchDevice } from 'projects/service/dom';
import useSession, { Session } from 'projects/sh/session.store';
import useOnResize from 'projects/hooks/use-on-resize';
import { XTerm } from 'components/dynamic';
import { TouchHelperUI } from './TouchHelperUi';
import useStateRef from 'projects/hooks/use-state-ref';
import useUpdate from 'projects/hooks/use-update';
import { assertNonNull } from 'projects/service/generic';

export default function Terminal({ sessionKey, env }: Props) {

  const update = useUpdate();

  const state = useStateRef(() => ({
    offset: 0,
    xtermReady: false,
    isTouchDevice: canTouchDevice(),
    session: null as null | Session,
  }));

  useOnResize(() => state.isTouchDevice = canTouchDevice());

  React.useEffect(() => {
    state.session = useSession.api.createSession(sessionKey, env);
    update();
    return () => useSession.api.removeSession(sessionKey);
  }, [sessionKey]);

  return (
    <Root>
      {state.session && (
        <XTerm
          onMount={(xterm) => {// `xterm` is an xterm.js instance
            const session = assertNonNull(state.session);
            const ttyXterm = new TtyXterm(xterm, {
              key: session.key,
              io: session.ttyIo,
              rememberLastValue: (msg) => session.var._ = msg,
            });
            ttyXterm.initialise();
            session.ttyShell.initialise(ttyXterm);
            state.xtermReady = true;
            update();

            ttyXterm.xterm.onLineFeed(debounce(() => {
              if (state.isTouchDevice) {
                state.offset = Math.max(1, parseInt(xterm.textarea!.style.top) - 100);
                update();
              }
            }, 100));
          }}
          options={options}
        />
      )}
      {state.isTouchDevice && state.session && state.xtermReady &&
        <TouchHelperUI
          session={state.session}
          offset={state.offset}
        />
      }
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
