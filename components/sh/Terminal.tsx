import React from 'react';
import { css, styled } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import type { ITerminalOptions } from 'xterm';

import { TtyXterm } from 'model/sh/tty.xterm';
import useSession from 'store/session.store';
import { XTerm } from 'components/dynamic';
import useMediaQuery from 'projects/hooks/use-media-query';

export default function Terminal({ sessionKey, env }: Props) {

  const session = useSession(({ session }) =>
    sessionKey in session ? session[sessionKey] : null
  );

  useBeforeunload(() => useSession.api.persist(sessionKey));
  const smallView = useMediaQuery('(max-width: 600px)');

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
      {smallView && <MobileHelperUI />}
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

function MobileHelperUI() {
  return (
    <div className={mobileHelperUiCss}>
      <div
        className="force-lowercase"
        title="force lowercase"
      >
        abc
      </div>
      <div className="up">
        🔺
      </div>
      <div className="down">
        🔻
      </div>
    </div>
  );
}

const mobileHelperUiCss = css`
  position: absolute;
  z-index: 100000;
  top: 0;
  right: 16px;
  width: 32px;
  height: 80px;
  line-height: 1;

  background-color: rgba(255, 255, 255, 0.25);
  font-size: 0.8rem;
  border: 1px solid #777;
  border-width: 0 1px 1px 1px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .force-lowercase {
    color: white;
    cursor: pointer;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .up, .down {
    filter: brightness(0%) invert(100%);
    cursor: pointer;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
