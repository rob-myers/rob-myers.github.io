import { css } from "goober";
import classNames from "classnames";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";

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
        console.log('spawning', defs);
        for (const def of defs) {
          state.apis.push({
            key: def.key,
            def,
            el: /** @type {*} */ ({}),
          });
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
      <canvas
        className="background"
      />
      <div className={classNames('npcs', { disabled: props.disabled })}>
        {state.apis.map(api => (
          <div
            key={api.key}
            className={`npc ${api.key}`}
            ref={state.npcRef}
          >
            <div className="body" />
            <div className="breath" />
          </div>
        ))}
      </div>
    </div>
  );
}

const npcRadius = 5;
const breathRadius = 3;

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
  }
  .npc {
    position: absolute;
    left: ${-npcRadius}px;
    top: ${-npcRadius}px;
  }
  .npc .body {
    position: absolute;
    border-radius: ${npcRadius}px;
    border: ${npcRadius}px solid rgba(255, 0, 0, 0.9);
    outline: 1px solid rgba(0, 0, 0, 1);
    animation: animateHeart 2.2s infinite;
  }
  .npc .breath {
    position: absolute;
    border-radius: ${breathRadius}px;
    border: ${breathRadius}px solid rgba(0, 0, 255, 0.25);
    top: ${npcRadius - breathRadius}px;
    left: ${2 * (npcRadius) - breathRadius}px;
    /* outline: 1px solid rgba(0, 0, 255, 0.25); */
    animation: animateBreath 3s infinite;
  }
  .npcs.disabled {
    .npc.body, .npc.breath {
      animation-play-state: paused;
    }
  }

  @keyframes animateHeart {
    0% {
      transform: scale(0.8);
    }
    5% {
      transform: scale(0.9);
    }
    10% {
      transform: scale(0.8);
    }
    15% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.8);
    }
    100% {
      transform: scale(0.8);
    }
  }

  @keyframes animateBreath {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.25);
    }
  }
`;
