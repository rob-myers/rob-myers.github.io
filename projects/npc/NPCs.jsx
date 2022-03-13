import { css } from "goober";
import useMuState from "../hooks/use-mu-state";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const state = useMuState(() => {

    /** @type {NPC.NPCsApi} */
    const output = {
      apis: [],
      canvas: /** @type {HTMLCanvasElement} */ ({}),
      spawn(defs) {
        // TODO
        console.log('spawning', defs);
      },
    };

    props.onLoad(output);
    return output;
  });
  
  const { pngRect } = props.gm.d;

  return (
    <div className={rootCss}>
      {
        /**
         * Draw navpaths into a canvas.
         * We don't want clickable navpoints.
         * The TTY will be used for interaction.
         */
      }
      <canvas
        className="navpaths"
        ref={el => el && (state.canvas = el)}
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
  .navpaths {

  }
`;
