import React from 'react';
import { styled } from 'goober';
import type { ITerminalOptions } from 'xterm';
import { debounce } from 'debounce';

import { TtyXterm } from 'projects/sh/tty.xterm';
import { canTouchDevice } from 'projects/service/dom';
import { assertNonNull } from 'projects/service/generic';
import { getCached } from 'projects/service/query-client';
import { stripAnsi } from 'projects/sh/sh.util';
import { scrollback } from 'projects/sh/io/io.model';
import useSession, { ProcessStatus, Session } from 'projects/sh/session.store';
import useStateRef from 'projects/hooks/use-state-ref';
import useUpdate from 'projects/hooks/use-update';
import useOnResize from 'projects/hooks/use-on-resize';
import type { State as NpcsApi } from 'projects/world/NPCs';
import { XTerm } from 'components/dynamic';
import { TouchHelperUI } from './TouchHelperUi';

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
    if (props.disabled && state.xtermReady) {
      state.wasDisabled = true;
      useSession.api.writeMsgCleanly(props.sessionKey, 'ℹ️  Paused session', { prompt: false });

      // Pause running processes
      const processes = Object.values((state.session?.process)??{});
      processes.filter(p => p.status === ProcessStatus.Running).forEach(p => {
        p.onSuspends = p.onSuspends.filter(onSuspend => onSuspend());
        p.status = ProcessStatus.Suspended;
      });

    } else if (!props.disabled && state.wasDisabled && state.xtermReady) {
      useSession.api.writeMsgCleanly(props.sessionKey, 'ℹ️  Resumed session');

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
            // regex: /(🔎 [^;]+);/g,
            regex: /(\[[a-z][^\]]+\])/gi,
            async callback(event, linkText, { outputLineNumber, lineText, linkStartIndex, bufferOutputLines }) {
              // console.log('clicked link', event, linkText, { outputLineNumber, lineText, linkStartIndex, bufferOutputLines });
              const session = assertNonNull(state.session);
              const npcs = getCached(session.var.WORLD_KEY).npcs as NpcsApi;
              /**
               * Number of "actual" lines output, no longer entirely within tty's buffer.
               * Why do we need the +1?
               */
              const priorOutputLines = Math.max(0, session.ttyShell.xterm.totalLinesOutput - bufferOutputLines + 1);
              npcs.onTtyLink(
                props.sessionKey,
                // The "global" 1-based index of lines ever output by tty
                priorOutputLines + outputLineNumber,
                stripAnsi(lineText),
                stripAnsi(linkText).slice(1, -1), // Omit square brackets
                linkStartIndex,
              );
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
  scrollback: scrollback,
  rows: 50,
};
