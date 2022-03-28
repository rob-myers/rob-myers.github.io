import { css } from "goober";
import classNames from "classnames";
import { Vect } from "../geom";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";
import { assertDefined } from "../service/generic";
import { getCachedStage } from "../hooks/use-stage";
/**
 * TODO
 * - better approach to NPCs.
 * - npcs register with stage
 */

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const state = useMuState(() => {
    /** @type {NPC.NPCsApi} */
    const output = {
      apis: [],
      background: /** @type {HTMLCanvasElement} */ ({}),
      root: /** @type {HTMLDivElement} */ ({}),
      npcRef(el) {
        if (el) {
          const api = state.apis.find(x => el.classList.contains(x.key));
          if (api) {
            api.el = { root: el };
            el.style.left = `${api.def.position.x}px`;
            el.style.top = `${api.def.position.y}px`;
          } else {
            console.error(`${NPCs.name}: npc not found for div.${Array.from(el.classList.values()).join('.')}`);
          }
        }
      },
      rootRef(el) {
        if (el) {
          state.root = el;
          const canvas = /** @type {*} */ (el.querySelector('canvas.background'));
          canvas.width = props.gm.d.pngRect.width;
          canvas.height = props.gm.d.pngRect.height;
          state.background = canvas;
        }
      },
      spawn(defs) {// TODO
        const stage = getCachedStage(props.stageKey);
        if (stage) {
          console.log('spawning...', defs);
          /**
           * TODO
           * - somehow register/unregister NPC with stage
           * - prevent dups
           */
          state.apis = state.apis.filter(x => !defs.some(y => x.key === y.key));
          for (const def of defs) {
            state.apis.push({
              key: def.key,
              def,
              animState: 'idle',
              el: /** @type {*} */ ({}),
            });
          }
        } else {
          console.error(`${NPCs.name}: cannot spawn into non-existent stage "${props.stageKey}"`);
        }
        update();
      },
    };
    props.onLoad(output);
    return output;
  });
  
  return (
    <div
      className={rootCss}
      ref={state.rootRef}
    >
      {
        /**
         * We'll draw navpaths into a canvas.
         * We don't want clickable navpoints.
         * The TTY will be used for interaction.
         * We might use the TTY to place clickable points along a navpath.
         */
      }
      <canvas className="background" />
      <div
        className={classNames('npcs', { disabled: props.disabled })}
        onPointerDown={(e) => {
          const body = /** @type {HTMLDivElement} */ (e.target);
          const npc = assertDefined(state.apis.find(x => body.classList.contains(x.key)));
          npc.animState = 'walk';
          update();
        }}
        onPointerUp={(e) => {
          const body = /** @type {HTMLDivElement} */ (e.target);
          const npc = assertDefined(state.apis.find(x => body.classList.contains(x.key)));
          npc.animState = 'idle';
          update();
        }}
      >
        {state.apis.map(api => (
          <div
            key={api.key}
            className={classNames('npc', api.key, api.animState, npcCss)}
            ref={state.npcRef}            
          >
            <div className={classNames('body', 'no-select', api.key)} />
          </div>
        ))}
      </div>
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
