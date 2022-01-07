import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import useGeomorphJson from "../hooks/use-geomorph-json";
import usePathfinding from "../hooks/use-pathfinding";
import SoloNPCWidget from "projects/npc/SoloNPCWidget";

// TODO
// - prevent target being too close to NPC
// - how to change speed?
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({
    a: {
      src: new Vect(250, 100),
      dst: new Vect(600, 500),
      api: /** @type {NPC.SoloApi} */ ({}),
    },
    b: {
      src: new Vect(260, 200),
      dst: new Vect(600, 340),
      api: /** @type {NPC.SoloApi} */ ({}),
    },
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp, props.disabled);

  React.useEffect(() => {
    if (props.disabled) {
      state.a.api?.anim.pause?.();
      state.b.api?.anim.pause?.();
    } else {
      state.a.api?.anim.play?.();
      state.b.api?.anim.play?.();
    }
  }, [props.disabled]);

  return (
    <PanZoom dark gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g className={rootCss}>
        {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />}

        {pf?.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
          <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
        ))}

        <SoloNPCWidget
          enabled={!!pf}
          initSrc={state.a.src}
          initDst={state.a.dst}
          zoneKey={layoutKey}
          onLoad={(api) => state.a.api = api}
        />

        <SoloNPCWidget
          enabled={!!pf}
          initSrc={state.b.src}
          initDst={state.b.dst}
          zoneKey={layoutKey}
          onLoad={(api) => state.b.api = api}
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
      fill: rgba(0, 0, 0, 0.03);
      stroke: black;
    }
  }
`;

const initViewBox = new Rect(200, 0, 600, 600);
