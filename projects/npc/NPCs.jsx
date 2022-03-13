import { css } from "goober";
import { assertNonNull } from "../service/generic";
import useMuState from "../hooks/use-mu-state";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const state = useMuState(() => {

    /** @type {NPC.NPCsApi} */
    const output = {
      apis: [],
      background: /** @type {HTMLCanvasElement} */ ({}),
      root: /** @type {HTMLDivElement} */ ({}),
      rootRef(el) {
        if (el) {
          state.root = el;
          const canvas = assertNonNull(el.querySelector(`canvas`));
          canvas.width = props.gm.d.pngRect.width;
          canvas.height = props.gm.d.pngRect.height;
          state.background = canvas;
        }
      },
      spawn(defs) {// TODO
        console.log('spawning', defs);
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
         * Draw navpaths into a canvas.
         * We don't want clickable navpoints.
         * The TTY will be used for interaction.
         */
      }
      <canvas className="navpaths" />
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
  .navpaths {

  }
`;
