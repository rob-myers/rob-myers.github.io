import classNames from "classnames";
import { css } from "goober";

/** @param {{ disabled?: boolean }} props  */
export default function SpriteTest(props) {

  return (
    <div className={classNames(rootCss, { disabled: props.disabled })}>
      {/* <div className="walk" /> */}
      <div
        className="idle"
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
  width: ${spriteWidth}px;
  height: ${spriteWidth}px;
  background-color: #ddd;
  
  .walk, .idle {
    width: ${spriteWidth}px;
    height: ${spriteWidth}px;
  }
  
  .walk {
    animation: walk 2s steps(${walkSteps}) infinite;
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
