import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { Vect } from "../geom";

/**
 * TODO induced by anim's JSON
 * TODO extend to cover all sprites of all NPCs
 * TODO shadow
 */

/** @param {{ disabled?: boolean }} props  */
export default function SpriteTest(props) {

  const [state, setState] = React.useState(/** @type {'idle' | 'walk'} */ ('idle'));

  return (
    <div
      className={classNames(rootCss, state, { disabled: props.disabled })}
      onPointerDown={() => setState('walk')}
      onPointerUp={() => setState('idle')}
    >
      <div className="body" />
    </div>
  );
}

const zoom = 2;
const walkSteps = 3;
const idleSteps = 1;
const idleDim = new Vect(51, 26).scale(zoom);
const walkDim = new Vect(49, 37).scale(zoom);

const rootCss = css`
  .body {
    cursor: pointer;
    position: absolute;
    transform: scale(0.18);
    pointer-events: all;
    filter: contrast(200%);
  }
  
  &.walk .body {
    width: ${walkDim.x}px;
    height: ${walkDim.y}px;
    left: ${-walkDim.x/2}px;
    top: ${-walkDim.y/2}px;
    animation: walk 300ms steps(${walkSteps}) infinite;
    background: url('/npc/first-npc--walk.png');
  }
  &.idle .body {
    width: ${idleDim.x}px;
    height: ${idleDim.y}px;
    left: ${-idleDim.x/2}px;
    top: ${-idleDim.y/2}px;
    animation: idle 2s steps(${idleSteps}) infinite;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-walkSteps * walkDim.x}px; }
  }
  @keyframes idle {
    from { background-position: 0px; }
    to { background-position: ${-idleSteps * idleDim.x}px; }
  }
`;
