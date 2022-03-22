import classNames from "classnames";
import { css } from "goober";

/**
 * TODO covers all sprites at once, and mutates them
 */

/** @param {{ disabled?: boolean }} props  */
export default function SpriteTest(props) {

  return (
    <div className={classNames(rootCss, { disabled: props.disabled })}>
      <div
        className={"idle"}
        onMouseOver={e => {
          /** @type {HTMLDivElement} */ (e.target).classList.toggle('idle');
          /** @type {HTMLDivElement} */ (e.target).classList.toggle('walk');
        }}
        onMouseLeave={e => {
          /** @type {HTMLDivElement} */ (e.target).classList.toggle('idle');
          /** @type {HTMLDivElement} */ (e.target).classList.toggle('walk');
        }}
      />
    </div>
  );
}

const walkSteps = 16;
const idleSteps = 13;
const spriteWidth = 256;

const rootCss = css`
  position: absolute;
  width: ${spriteWidth}px;
  height: ${spriteWidth}px;
  left: ${-spriteWidth/2}px;
  top: ${-spriteWidth/2}px;
  cursor: pointer;
  transform: scale(0.18);
  filter: saturate(200%);
  
  .walk, .idle {
    position: absolute;
    width: ${spriteWidth}px;
    height: ${spriteWidth}px;
  }
  
  .walk {
    animation: walk 0.5s steps(${walkSteps}) infinite;
    background: url('/pics/spritesheet-walk-test-2.png');
  }

  .idle {
    animation: idle 2s steps(${idleSteps}) infinite;
    background: url('/pics/spritesheet-idle-test-2.png');
  }

  &.disabled .walk, &.disabled .idle {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-walkSteps * spriteWidth}px; }
  }
  @keyframes idle {
    from { background-position: 0px; }
    to { background-position: ${-idleSteps * spriteWidth}px; }
  }
`;
