import React from "react";
import { css } from "goober";

import * as defaults from './defaults';
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";
import useGeomorphData from "../geomorph/use-geomorph-data";
import usePathfinding from "../geomorph/use-pathfinding";

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function SvgSvgNavGraph(props) {

  const { data: gm } = useGeomorphData(props.layoutKey);
  const { data: pf } = usePathfinding(props.layoutKey, gm, props.disabled);

  const nodeMetas = pf ? pf.graph.nodesArray.map((_, i) => pf.graph.nodeToMeta[i]) : [];

  return (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
      dark
    >
      {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />}

      {pf && !props.disabled && <>
        {pf.graph.nodesArray.map(({ id, centroid, neighbours }, _, nodes) =>
          <g key={id}>
            {neighbours.map(id => (
              <line
                className="edge"
                x1={centroid.x}
                y1={centroid.y}
                x2={nodes[id].centroid.x}
                y2={nodes[id].centroid.y}
              />
            ))}
          </g>
        )}

        {pf.graph.nodesArray.map(({ vertexIds }, nodeId) =>
          <polygon
            // className="navtri"
            points={`${vertexIds.map(id => pf.graph.vectors[id])}`}
            stroke="#00000044"
            strokeWidth={0.1}
            fill={
              pf.graph.nodeToMeta[nodeId].doorId >= 0
                ? pf.graph.nodeToMeta[nodeId].roomId >= 0 ? '#ffff0066' : '#ff000066'
                : pf.graph.nodeToMeta[nodeId].roomId >= 0 ? '#00ff0066' : 'none'}
          />
        )}

        {pf.graph.nodesArray.map(({ id, centroid }, i) =>
          <circle
            key={id}
            className="node"
            cx={centroid.x}
            cy={centroid.y}
            r={2}
          >
            <title>
              {i}:{' '}
              {JSON.stringify(nodeMetas[i])}
            </title>
          </circle>
        )}
      </>
      }
    </PanZoom>
  );
}

const rootCss = css`
  image.geomorph {
    /* filter: invert(); */
  }
  circle.node {
    fill: #ff000068;
    /* pointer-events: none; */
  }
  line.edge {
    stroke: #900;
    stroke-width: 1;
    pointer-events: none;
  }

  polygon.navtri {
    fill: transparent;
    transition: fill 0.3s;
    &:hover, &:active, &:focus {
      fill: #8080ff37;
      stroke: rgba(0, 0, 255, 0.3);
    }
  }  
`;

const initViewBox = new Rect(0, 0, 600, 600);
