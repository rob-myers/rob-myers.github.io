import { css } from "goober";
import classNames from "classnames";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";
import SpriteTest from "projects/example/SpriteTest";

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
            <SpriteTest disabled={props.disabled} />
          </div>
        ))}
      </div>
    </div>
  );
}

const npcRadius = 7.5;
const breathRadius = 5;

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
  }
  .npc {
    position: absolute;
  }
`;
