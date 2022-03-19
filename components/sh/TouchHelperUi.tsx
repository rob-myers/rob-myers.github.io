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
          const prefix = xterm.hasInput() ? '\n\r' : '';
          const message = `input ${forced ? 'forced as' : 'not forced as'} lowercase`;
          useSessionStore.api.warn(props.session.key, `${prefix}⚠️  ${message}`);
        } else if (target.classList.contains('up')) {
          xterm.reqHistoryLine(+1);
        } else if (target.classList.contains('down')) {
          xterm.reqHistoryLine(-1);
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
        🔤
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

const rootCss = css`
  position: absolute;
  z-index: 100000;
  top: 0;
  right: 16px;
  width: 32px;
  height: 90px;

  background-color: rgba(255, 255, 255, 0.25);
  font-size: 1rem;
  border: 1px solid #555;
  border-width: 1px 1px 1px 1px;

  display: flex;
  flex-direction: column;
  align-items: center;
  transition: top 500ms ease;

  .lowercase {
    filter: saturate(200%);
  }
  .up, .down {
    filter: brightness(0%) invert(100%);
  }
  .lowercase, .up, .down {
    cursor: pointer;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
