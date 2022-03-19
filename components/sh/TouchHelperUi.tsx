import { css } from 'goober';
import type { Session } from 'store/session.store';
import useMuState from 'projects/hooks/use-mu-state';
import useSessionStore from 'store/session.store';

export function TouchHelperUI(props: {
  offset: number;
  session: Session;
}) {

  const state = useMuState(() => {
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
        } else if (target.classList.contains('clear')) {
          xterm.clearScreen();
          xterm.xterm.focus();
        } else if (target.classList.contains('up')) {
          xterm.reqHistoryLine(+1);
          xterm.xterm.focus();
        } else if (target.classList.contains('down')) {
          xterm.reqHistoryLine(-1);
          xterm.xterm.focus();
        } 
      },
    };
  });

  return (
    <div
      className={rootCss}
      onClick={state.onClick}
      style={{
        top: `${props.offset}px`,
      }}
    >
      <div className="lowercase">
        abc
      </div>
      <div className="clear">
        ∅
      </div>
      <div className="up">
        ⬆
      </div>
      <div className="down">
        ⬇
      </div>
    </div>
  );
}

const rootCss = css`
  position: absolute;
  z-index: 100000;
  top: 0;
  right: 16px;
  width: 32px;
  height: 90px;

  line-height: 1; /** Needed for mobile viewing 'Desktop site' */
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 0.75rem;
  border: 1px solid #555;
  border-width: 1px 1px 1px 1px;

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
  .clear, .up, .down {
    color: white;
  }
  .lowercase, .clear, .up, .down {
    cursor: pointer;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
