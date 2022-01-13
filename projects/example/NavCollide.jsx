import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import useGeomorphJson from "../hooks/use-geomorph-json";
import usePathfinding from "../hooks/use-pathfinding";
import SoloNPCWidget from "../npc/SoloNPCWidget";
import NPC from "../npc/NPC";

// TODO
// - prevent target being too close to NPC
// - how to change speed?
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({

    npcs: [0].map(i => ({
      init: {
        src: new Vect(...[[500, 200], [460, 200]][i]),
        dst: new Vect(...[[500, 300], [460, 200]][i]),
        zoneKey: layoutKey,
      },
      api: /** @type {NPC.Api} */ ({}),
      wasPlaying: false,
    })),

    // OLD
    bots: [0, 1].map(i => ({
      src: new Vect(...[[250, 100], [260, 200]][i]),
      dst: new Vect(...[[600, 500], [600, 340]][i]),
      api: /** @type {NPC.SoloApi} */ ({}),  // TODO better way?
      wasPlaying: false,
    })),
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp, props.disabled);

  React.useEffect(() => {
    if (props.disabled) {
      state.bots.forEach(bot => {
        if (bot.api.anim) {
          bot.wasPlaying = bot.api.isPlaying();
          bot.api?.anim.pause?.();
        }
      });
    } else {
      state.bots.forEach(bot => {
        if (bot.wasPlaying) {
          bot.api?.anim.play?.();
        }
      });
    }
  }, [props.disabled]);

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

        {state.bots.map(bot => (
          <SoloNPCWidget
            enabled={!!pf}
            initSrc={bot.src}
            initDst={bot.dst}
            zoneKey={layoutKey}
            onLoad={(api) => bot.api = api}
          />
        ))}

        {state.npcs.map(npc =>
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
