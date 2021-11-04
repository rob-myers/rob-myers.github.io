import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Vect } from "../geom";
import { geom } from "../service";
import { gridBounds, initViewBox } from "./defaults";
import PanZoom from "../panzoom/PanZoom";
import DraggableNode from "../controls/DraggableNode";

/**
 * TODO
 * - permit two lights
 * - larger light drag area for mobile
 * - GeomorphJson needs hull polygon too
 * - disable disables CSS animation
 */

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6} className={rootCss}>

      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light gm={data} />
      </>}

    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} props */
function Light({ gm }) {

  const [position, setPosition] = React.useState(() => new Vect(300, 300));

  const light = useMemo(() => {
    const polys = gm.walls.map(x => Poly.from(x));
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    const polygon = geom.lightPolygon(position, 2000, triangs);
    const { rect: bounds } = polygon;
    const sourceRatios = position.clone().sub(bounds).scale(1 / bounds.width, 1 / bounds.height);
    return { polygon, sourceRatios };
  }, [position.x, position.y]);

  return <>
    <path
      className="light-polygon"
      d={light.polygon.svgPath}
    />
    <DraggableNode
      initial={position}
      onChange={setPosition}
    />
  </>;
}

const rootCss = css`
  .light-polygon {
    fill: blue;
    stroke: black;
    animation: fadein 1s infinite alternate;
    
    @keyframes fadein {
      from { opacity: 0; }
      to   { opacity: 0.25; }
    }
  }
`;
