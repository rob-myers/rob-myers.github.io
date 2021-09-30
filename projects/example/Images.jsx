import classNames from 'classnames';
import { css } from 'goober';

export function Gm301Debug() {
  return (
    <div className={classNames('scrollable', rootCss)}>
      <img
        draggable={false}
        src="/pics/g-301--bridge.debug.x1.png"
        alt="Geomorph 301 Debug"
      />
    </div>
  );
}

const rootCss = css`
  overflow-x: scroll;
  height: 100%;
  img {
    animation: fadein 2s;
  }

  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
