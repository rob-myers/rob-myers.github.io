import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geom } from "../service/geom";
import { Pathfinding } from '../pathfinding/Pathfinding';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import DraggablePath from "../ui/DraggablePath";
import classNames from "classnames";

// TODO
// - 2 paths
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  const [state] = React.useState(() => ({
    botA: { initSrc: new Vect(300, 300), initDst: new Vect(600, 300) },
    botB: { initSrc: new Vect(200, 200), initDst: new Vect(680, 200) },
  }));
  
  const pathfinding = React.useMemo(() => new Pathfinding, []);
  const { data } = useQuery('nav-collide-demo', async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));
    const decomp = geom.polysToTriangulation(navPoly);
    const zone = Pathfinding.createZone(decomp);
    pathfinding.setZoneData(zoneKey, zone);
    return { pngRect: json.pngRect, navPoly, zone };
  });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g className={classNames(rootCss, !props.disabled && animateNavpathCss)}>

        {data && <>
          <image {...data.pngRect} className="geomorph" href={geomorphPngPath('g-301--bridge')} />

          {data.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => data.zone.vertices[id])}`} />
          ))}

          <DraggablePath
            initial={{ src: state.botA.initSrc, dst: state.botA.initDst }}
            pathfinding={pathfinding}
            zoneKey={zoneKey}
            radius={8}
            srcIcon="run"
          />

          <DraggablePath
            initial={{ src: state.botB.initSrc, dst: state.botB.initDst }}
            pathfinding={pathfinding}
            zoneKey={zoneKey}
            radius={8}
            srcIcon="run"
          />

        </>}
        
      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  polyline.navpath {
    fill: none;
    stroke: #083;
    stroke-width: 4;
    stroke-dasharray: 8px;
    stroke-dashoffset: 16px;
  }

  @keyframes flash {
    0% { stroke-dashoffset: 16px; }
    100% { stroke-dashoffset: 0px; }
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      stroke: #900;
    }
  }
`;

const animateNavpathCss = css`
  polyline.navpath {
    animation: 600ms flash infinite linear;
  }
`;

const zoneKey = 'NavCollideZone';
const initViewBox = new Rect(200, 0, 600, 600);
