import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import { useGeomorphJson, usePathfinding } from "../hooks";
import SoloNPCWidget from "projects/npc/SoloNPCWidget";

// TODO
// - extract bot into SoloNPCWidget
// - SoloNPCWidget supports initial position sans pf
// - develop SoloNPCWidget
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({
    initSrc: new Vect(300, 300),
    initDst: new Vect(600, 300),
    npcApi: /** @type {NPC.SoloApi} */ ({}),
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp, props.disabled);

  React.useEffect(() => {
    if (props.disabled) {
      state.npcApi?.anim.pause?.();
    } else {
      state.npcApi?.anim.play?.();
    }
    state.npcApi.enabled = !props.disabled;
  }, [props.disabled]);

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g className={rootCss}>
        {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />}

        {pf?.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
          <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
        ))}

        <SoloNPCWidget
          enabled={!!pf}
          initSrc={state.initSrc}
          initDst={state.initDst}
          zoneKey={layoutKey}
          onLoad={(api) => {
            state.npcApi = api;
          }}
        />
      </g>
    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  polygon.navtri {
    fill: transparent;
    &:hover {
      stroke: #900;
    }
  }
`;

const initViewBox = new Rect(200, 0, 600, 600);
