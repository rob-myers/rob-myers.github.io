import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import useGeomorphJson from "../hooks/use-geomorph-json";
import usePathfinding from "../hooks/use-pathfinding";
import NPC from "../npc/NPC";

// TODO
// - how to change speed?
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({

    npcs: [0, 1, 2].map(i => ({
      /** @type {NPC.Props['init']} */
      init: {
        src: new Vect(...[[250, 100], [260, 200], [40, 550]][i]),
        dst: new Vect(...[[600, 500], [600, 340], [1100, 50]][i]),
        zoneKey: layoutKey,
        paused: false, // Initially playing
      },
      api: /** @type {NPC.Api} */ ({}),
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
        npc.api.anim.pause();
      });
    } else {
      state.npcs.forEach(npc => npc.wasPlaying && npc.api.anim.play());
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

        {pf?.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
          <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
        ))}

        {pf && state.npcs.map(npc =>
          <NPC
            init={npc.init}
            onLoad={(api) => npc.api = api}
          />
        )}

      </g>
    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  /* image {
    filter: invert(100%) sepia(50%);
  } */

  polygon.navtri {
    fill: transparent;
    &:hover {
      fill: rgba(0, 0, 0, 0.03);
      stroke: black;
    }
  }
`;

const initViewBox = new Rect(200, 0, 800, 800);
