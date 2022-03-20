import classNames from "classnames";
import { css } from "goober";

/** @param {{ disabled?: boolean }} props  */
export default function SpriteTest(props) {

  return (
    <div className={classNames(rootCss, { disabled: props.disabled })}>
      <div className="walk" />
    </div>
  );
}

const rootCss = css`
  width: 256px;
  height: 256px;
  background-color: #ddd;
  
  .walk {
    width: 256px;
    height: 256px;
    animation: walk 2s steps(19) infinite;
    background: url('/pics/spritesheet-walk-test.png');
  }

  &.disabled .walk {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: -4864px; }
  }
`;
