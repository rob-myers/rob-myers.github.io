import classNames from 'classnames';
import { css } from 'goober';

export function Gm301Debug() {
  return (
    <picture className={classNames('scrollable', rootCss)}>
      {/* <source media="(min-width: 1200px)" srcset="/pics/g-301--bridge.debug.x2.png" /> */}
      <img
        draggable={false}
        src="/pics/g-301--bridge.debug.x1.png"
        alt="Geomorph 301 (Debug)"
        width={1212}
        height={628}
      />
    </picture>
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
