import classNames from 'classnames';
import { css } from 'goober';

export default function Gm301Debug() {
  return (
    <div className={classNames('scrollable', rootCss)}>
      <picture>
        {/* <source media="(min-width: 1200px)" srcset="/pics/g-301--bridge.debug.x2.png" /> */}
        <img
          draggable={false}
          src="/pics/g-301--bridge.debug.x1.png"
          alt="Geomorph 301 (Debug)"
          width={1212}
          height={628}
        />
      </picture>
    </div>
  );
}

const rootCss = css`
  text-align: center;
  overflow-x: scroll;
  overflow-y: scroll;
  height: 100%;
  img {
    animation: fadein 2s;
  }

  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
