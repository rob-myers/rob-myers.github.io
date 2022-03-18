import { css } from 'goober';
import type { Session } from 'store/session.store';
import useMuState from 'projects/hooks/use-mu-state';

export function TouchHelperUI(props: {
  session: Session;
}) {

  const state = useMuState(() => {
    return {
      onClick(e: React.MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.classList.contains('force-lowercase')) {
          // TODO
          console.log('force-lowercase');
        } else if (target.classList.contains('up')) {
          const { xterm  } = props.session.ttyShell;
          xterm.reqHistoryLine(+1);
        } else if (target.classList.contains('down')) {
          const { xterm  } = props.session.ttyShell;
          xterm.reqHistoryLine(-1);
        } 
      },
    };
  });

  return (
    <div
      className={rootCss}
      onClick={state.onClick}
    >
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

const rootCss = css`
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
