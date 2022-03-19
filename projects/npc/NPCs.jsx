import { css } from "goober";
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
      <div className="npcs">
        {state.apis.map(api => (
          <div key={api.key} className={`npc ${api.key}`}>
            <div className="body" />
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
  }
  .npc {
    position: absolute;
    left: -10px;
    top: -10px;
  }
  .npc .body {
    border-radius: 10px;
    border: 10px solid red;
  }
`;
