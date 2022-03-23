import classNames from "classnames";
import { css } from "goober";

/** @param {{ disabled?: boolean }} props  */
export default function SpriteTest(props) {

  return (
    <div
      className={classNames(rootCss, 'idle', { disabled: props.disabled })}
      ref={el => {
        if (el) {
          const body = el.children[1];
          const toggle = () => {
            el.classList.toggle('idle');
            el.classList.toggle('walk');
          };
          body.addEventListener('pointerdown', toggle);
          body.addEventListener('pointerup', toggle);
        }
      }}
    >
      <div className="shadow" />
      <div className="body" />
    </div>
  );
}

const walkSteps = 16;
const idleSteps = 13;
const spriteWidth = 256;
const shadowRadius = 9;

const rootCss = css`
  .body {
    cursor: pointer;
    position: absolute;
    width: ${spriteWidth}px;
    height: ${spriteWidth}px;
    left: ${-spriteWidth/2}px;
    top: ${-spriteWidth/2}px;
    transform: scale(0.18);
    pointer-events: all;
    filter: contrast(200%);
  }
  
  &.walk .body {
    animation: walk 1s steps(${walkSteps}) infinite;
    background: url('/pics/spritesheet-walk-test-2.png');
  }
  &.idle .body {
    animation: idle 2s steps(${idleSteps}) infinite;
    background: url('/pics/spritesheet-idle-test-2.png');
  }

  &.disabled .body {
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

  .shadow {
    position: absolute;
    left: ${-shadowRadius}px;
    top: ${-shadowRadius}px;
    border-radius: ${shadowRadius}px;
    border: ${shadowRadius}px solid rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
  &.walk .shadow {
    transform: scale(1.2);
  }
`;
