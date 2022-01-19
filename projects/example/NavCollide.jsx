import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import useGeomorphJson from "../hooks/use-geomorph-json";
import usePathfinding from "../hooks/use-pathfinding";
import NPC from "../npc/NPC";
import NPCs from "projects/npc/NPCs";

// TODO
// - sort out layering: npcs above lines/nodes, speech/info above npcs
//   - ISSUE with preact createPortal for svg subelements
//   - IDEA create single component NPCS handling layering there
// - can turn when stationary
// - can change speed
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({

    /** @type {NPC.NPCDef[]} */
    defs: [0, 1, 2].map(i => ({
      key: `npc-${i}`,
      src: new Vect(...[[250, 100], [260, 200], [40, 550]][i]),
      dst: new Vect(...[[600, 500], [600, 340], [1100, 50]][i]),
      zoneKey: layoutKey,
      paused: false, // Initially playing
      angle: 0,
    })),
    api: /** @type {NPC.NPCsApi} */ ({}),


    // OLD
    npcs: [0, 1, 2].map(i => ({
      /** @type {NPC.NPCProps['init']} */
      init: {
        key: `npc-${i}`,
        src: new Vect(...[[250, 100], [260, 200], [40, 550]][i]),
        dst: new Vect(...[[600, 500], [600, 340], [1100, 50]][i]),
        zoneKey: layoutKey,
        paused: false, // Initially playing
        angle: 0,
      },
      api: /** @type {NPC.NPCApi} */ ({}),
      wasPlaying: false,
    })),
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp, props.disabled);

  React.useEffect(() => {
    if (!pf) {
      return;
    }
    if (props.disabled) {
      state.npcs.forEach(npc => {
        npc.wasPlaying = npc.api.is('running');
        npc.api.pause();
      });
    } else {
      state.npcs.forEach(npc => npc.wasPlaying && npc.api.play());
    }
  }, [props.disabled, pf]);

  return (
    <PanZoom
      dark
      gridBounds={defaults.gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
    >
      <g className={rootCss}>
        {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />}

        <g className="navtris">
          {pf?.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
          ))}
        </g>

        {pf && <>
          {state.npcs.map(npc =>
            <NPC
              init={npc.init}
              onLoad={(api) => npc.api = api}
            />
          )}
          <NPCs
            defs={state.defs}
            onLoad={api => state.api = api}
          />
        </>}

      </g>
    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  image {
    /* filter: invert(100%) sepia(50%); */
    /* filter: invert(100%); */
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      fill: rgba(0, 0, 0, 0.03);
      stroke: black;
    }
  }
`;

const initViewBox = new Rect(200, 0, 800, 800);
