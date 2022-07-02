import React from 'react';
import { styled } from 'goober';
import type { ITerminalOptions } from 'xterm';
import { debounce } from 'debounce';

import { TtyXterm } from 'projects/sh/tty.xterm';
import { canTouchDevice } from 'projects/service/dom';
import useSession, { ProcessStatus, Session } from 'projects/sh/session.store';
import useOnResize from 'projects/hooks/use-on-resize';
import { XTerm } from 'components/dynamic';
import { TouchHelperUI } from './TouchHelperUi';
import useStateRef from 'projects/hooks/use-state-ref';
import useUpdate from 'projects/hooks/use-update';
import { assertNonNull } from 'projects/service/generic';

export default function Terminal(props: Props) {

  const update = useUpdate();

  const state = useStateRef(() => ({
    isTouchDevice: canTouchDevice(),
    offset: 0,
    session: null as null | Session,
    wasDisabled: false,
    xtermReady: false,
  }));

  useOnResize(() => state.isTouchDevice = canTouchDevice());

  React.useEffect(() => {
    state.session = useSession.api.createSession(props.sessionKey, props.env);
    update();
    return () => {
      useSession.api.removeSession(props.sessionKey);
      state.xtermReady = false;
    };
  }, [props.sessionKey]);

  React.useEffect(() => {
    if (props.disabled) {
      state.wasDisabled = true;
      useSession.api.writeMsgCleanly(props.sessionKey, 'Paused session', { prompt: false });

      // Pause running processes
      const processes = Object.values((state.session?.process)??{});
      processes.filter(p => p.status === ProcessStatus.Running).forEach(p => {
        p.onSuspends = p.onSuspends.filter(onSuspend => onSuspend());
        p.status = ProcessStatus.Suspended;
      });

    } else if (!props.disabled && state.wasDisabled && state.xtermReady) {
      useSession.api.writeMsgCleanly(props.sessionKey, 'Resumed session');

      // Resume suspended processes
      // TODO what if previously suspended?
      const processes = Object.values((state.session?.process)??{});
      processes.filter(p => p.status === ProcessStatus.Suspended).forEach(p => {
        p.onResumes = p.onResumes.filter(onResume => onResume());
        p.status = ProcessStatus.Running;
      });
    }
  }, [props.disabled]);

  return (
    <Root>
      {state.session && (
        <XTerm
          // `xterm` is an xterm.js instance
          onMount={(xterm) => {
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
          linkProviderDef={{
            // regex: /(?:^|\s)_([^_]+)_(?:$|\s)/g,
            /**
             * 🔎 will panzoom to e.g. rooms
             */
            regex: /(🔎 [^;]+);/g,
            async callback(e, text, lineNumber) {
              console.log('clicked link', e, text, lineNumber);
              const session = assertNonNull(state.session);
              session.ttyShell.xterm.autoSendCode(text);
            },
          }}
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
  disabled?: boolean;
  sessionKey: string;
  /** Can initialize variables */
  env: { [envVarName: string]: any; };
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
