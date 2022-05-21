import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import type { Session } from 'projects/sh/session.store';
import useStateRef from 'projects/hooks/use-state-ref';
import useSessionStore from 'projects/sh/session.store';

export function TouchHelperUI(props: {
  offset: number;
  session: Session;
}) {

  const state = useStateRef(() => {
    return {
      onClick(e: React.MouseEvent) {
        const target = e.target as HTMLElement;
        const { xterm } = props.session.ttyShell;
        xterm.xterm.scrollToBottom();
        if (target.classList.contains('lowercase')) {
          const forced = (xterm.forceLowerCase = !xterm.forceLowerCase);
          const message = `⚠️  input ${forced ? 'forced as' : 'not forced as'} lowercase`;
          useSessionStore.api.warnCleanly(props.session.key, message);
          target.classList.toggle('enabled');
          localStorage.setItem(localStorageKey, `${forced}`);
        } else if (target.classList.contains('ctrl-c')) {
          xterm.sendSigKill();
        } else if (target.classList.contains('clear')) {
          xterm.clearScreen();
        } else if (target.classList.contains('up')) {
          xterm.reqHistoryLine(+1);
        } else if (target.classList.contains('down')) {
          xterm.reqHistoryLine(-1);
        } 
        xterm.xterm.focus();
      },
    };
  });
  
  React.useEffect(() => {
    const { xterm } = props.session.ttyShell;
    if (!localStorage.getItem(localStorageKey)) {
      // force lowercase by default on touch device
      localStorage.setItem(localStorageKey, 'true');
    }
    xterm.forceLowerCase = localStorage.getItem(localStorageKey) === 'true';
    return () => void (xterm.forceLowerCase = false);
  }, []);

  return (
    <div
      className={rootCss}
      onClick={state.onClick}
      style={{
        top: `${props.offset}px`,
      }}
    >
      <div className={classNames(
        'icon lowercase',
        { enabled: props.session.ttyShell.xterm.forceLowerCase },
      )}>
        abc
      </div>
      <div className="icon ctrl-c">
        💀
      </div>
      <div className="icon clear">
        ∅
      </div>
      <div className="icon up">
        ⬆️
      </div>
      <div className="icon down">
        ⬇️
      </div>
    </div>
  );
}

const localStorageKey = 'touch-tty-force-lowercase';

const rootCss = css`
  position: absolute;
  z-index: 100000;
  top: 0;
  right: 16px;
  width: 32px;
  height: 128px;

  line-height: 1; /** Needed for mobile viewing 'Desktop site' */
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 0.75rem;
  border: 1px solid #555;
  border-width: 1px 1px 1px 1px;
  color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
  transition: top 500ms ease;

  .lowercase {
    color: #999;
    &.enabled {
      color: white;
    }
  }

  .icon {
    cursor: pointer;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
