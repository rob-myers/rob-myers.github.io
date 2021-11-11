import React from "react";
import { useQuery } from "react-query";
import { css } from "goober";

import * as defaults from './defaults';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly } from "../geom";
import { geom } from "../service/geom";
import PanZoom from "../panzoom/PanZoom";
import { Pathfinding } from "../pathfinding/Pathfinding";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function NavGraphDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(geomorphJsonPath(props.layoutKey)).then(x => x.json()));
  });

  const pathfinding = React.useMemo(() => new Pathfinding, []);

  const { zone } = React.useMemo(() => {
    const polys = (data?.navPoly || []).map(x => Poly.from(x));
    const decomp = geom.polysToTriangulation(polys);
    const zone = Pathfinding.createZone(decomp);
    pathfinding.setZoneData(zoneKey, zone);
    return { zone };
  }, [data]);

  return data ? (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={defaults.initViewBox}
      maxZoom={6}
      className={rootCss}
    >
      <image {...data.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />

      {zone.groups.map(nodes =>
        nodes.map(({ id, centroid, neighbours }) => <g key={id}>
          {neighbours.map(id => (
            <line className="edge" x1={centroid.x} y1={centroid.y}
            x2={nodes[id].centroid.x} y2={nodes[id].centroid.y}
            />
          ))}
      </g>))}

      {zone.groups.map(nodes =>
        nodes.map(({ id, centroid }) =>
          <circle key={id} className="node" cx={centroid.x} cy={centroid.y} r={2} />
      ))}
    </PanZoom>
  ) : null;
}

const rootCss = css`
  image.geomorph {
    opacity: 0.8;
    filter: invert();
  }
  circle.node {
    fill: red;
  }
  line.edge {
    stroke: #080;
    /* stroke: rgba(150, 0, 0); */
    stroke-width: 1.5;
  }
`;

const zoneKey = 'NavGraphDemoZone';
