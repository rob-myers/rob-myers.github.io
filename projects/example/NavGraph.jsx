import React from "react";
import { css } from "goober";

import * as defaults from './defaults';
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";
import { useGeomorphJson, usePathfinding } from "../hooks";

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function NavGraphDemo(props) {

  const { data: gm } = useGeomorphJson(props.layoutKey);
  const { data: pf } = usePathfinding(props.layoutKey, gm?.navDecomp, props.disabled);

  return (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
      dark
    >
      {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />}
      {pf && <>
        {pf.zone.groups.map(nodes =>
          nodes.map(({ id, centroid, neighbours }) => <g key={id}>
            {neighbours.map(id => (
              <line
                className="edge"
                x1={centroid.x}
                y1={centroid.y}
                x2={nodes[id].centroid.x}
                y2={nodes[id].centroid.y}
              />
            ))}
          </g>)
        )}

        {pf.zone.groups.map(nodes =>
          nodes.map(({ vertexIds }) =>
            <polygon
              className="navtri"
              points={`${vertexIds.map(id => pf.zone?.vertices[id])}`}
            />
        ))}

        {pf.zone.groups.map(nodes =>
          nodes.map(({ id, centroid }) =>
            <circle key={id} className="node" cx={centroid.x} cy={centroid.y} r={2} />
        ))}
      </>
      }
    </PanZoom>
  );
}

const rootCss = css`
  image.geomorph {
    filter: invert();
  }
  circle.node {
    fill: red;
    pointer-events: none;
  }
  line.edge {
    stroke: #900;
    stroke-width: 1;
    pointer-events: none;
  }

  polygon.navtri {
    fill: transparent;
    &:hover, &:active, &:focus {
      stroke: green;
      stroke-width: 4;
    }
  }  
`;

const initViewBox = new Rect(0, 0, 600, 600);
