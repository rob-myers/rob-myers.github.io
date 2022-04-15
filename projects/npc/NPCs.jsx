import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { Vect } from "../geom";
import { ensureWire } from "../service/emit.service";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const state = useStateRef(() => {
    return {
      /** @type {Record<string, NPC.NPC>} */
      npc: ({}),
      /** @type {React.RefCallback<HTMLDivElement>} */
      npcRef(el) {
        if (el) {
          const npcKey = /** @type {string} */ (el.getAttribute('data-npc-key'));
          const npc = state.npc[npcKey];
          npc.el.root = el;
          el.style.left = `${npc.def.position.x}px`;
          el.style.top = `${npc.def.position.y}px`;
        }
      },
    };
  });
  
  React.useEffect(() => {
    const wire = ensureWire(props.wireKey);
    const sub = wire.subscribe((e) => {
      if (e.key === 'spawn') {
        state.npc[e.npcKey] = {
          key: e.npcKey,
          instanceKey: `${e.npcKey}-${++spawnCount}`,
          def: { key: e.npcKey, position: e.at },
          spriteSheetState: 'idle',
          el: { root: /** @type {HTMLDivElement} */ ({}) },
        };
        update();
      }
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div className={classNames('npcs', rootCss)}>
      {Object.values(state.npc).map(npc => (
        <div
          key={npc.instanceKey} // respawn will remount
          data-npc-key={npc.key}
          className={classNames('npc', npc.key, npc.spriteSheetState, npcCss)}
          ref={state.npcRef}            
        >
          <div className={classNames('body', npc.key, 'no-select')} />
        </div>
      ))}
    </div>
  );
}

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
    pointer-events: none;
  }
  .npc {
    position: absolute;
  }
`;

// TODO remove hard-coding
const zoom = 2;
const walkSteps = 3;
const idleSteps = 1;
const idleDim = new Vect(51, 26).scale(zoom);
const walkDim = new Vect(49, 37).scale(zoom);

const npcCss = css`
  .body {
    cursor: pointer;
    position: absolute;
    transform: scale(0.18);
    pointer-events: all;
    filter: grayscale(100%);
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

let spawnCount = 0;
