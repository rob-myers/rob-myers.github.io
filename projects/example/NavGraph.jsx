import React from "react";
import { useQuery } from "react-query";
import { css } from "goober";

import * as defaults from './defaults';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from "../geom";
import { geom } from "../service/geom";
import PanZoom from "../panzoom/PanZoom";
import { Pathfinding } from "../pathfinding/Pathfinding";

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function NavGraphDemo(props) {

  const { data } = useQuery(geomorphJsonPath(props.layoutKey), async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(geomorphJsonPath(props.layoutKey)).then(x => x.json()));
  });

  const [state, setState] = React.useState(() => ({
    pathfinding: new Pathfinding,
    zone: /** @type {undefined | Nav.Zone} */ (undefined)
  }));

  // TODO apply this more efficient pattern elsewhere
  React.useEffect(() => {
    if (data && !props.disabled && !state.zone) {
      state.zone = Pathfinding.createZone(data.navDecomp);
      state.pathfinding.setZoneData(zoneKey, state.zone);
      setState({...state});
    }
  }, [data, props.disabled]);

  return data ? (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
      dark
    >
      <image {...data.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />

      {state.zone && <>
        {state.zone.groups.map(nodes =>
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

        {state.zone.groups.map(nodes =>
          nodes.map(({ vertexIds }) =>
            <polygon
              className="navtri"
              points={`${vertexIds.map(id => state.zone?.vertices[id])}`}
            />
        ))}

        {state.zone.groups.map(nodes =>
          nodes.map(({ id, centroid }) =>
            <circle key={id} className="node" cx={centroid.x} cy={centroid.y} r={2} />
        ))}
      </>}
    </PanZoom>
  ) : null;
}

const rootCss = css`
  image.geomorph {
    filter: invert() brightness(200%);
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

const zoneKey = 'NavGraphDemoZone';
const initViewBox = new Rect(0, 0, 600, 600);
