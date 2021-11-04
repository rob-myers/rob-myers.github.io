import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import classNames from "classnames";

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
 */

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
    >
      {data && <g className={classNames(rootCss, props.disabled && 'disabled')}>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light walls={data.walls} />
      </g>}
    </PanZoom>
  );
}

/** @param {{ walls: Geom.GeoJsonPolygon[] }} props */
function Light({ walls }) {
  const [position, setPosition] = React.useState(() => new Vect(300, 300));

  const light = useMemo(() => {
    const polys = walls.map(x => Poly.from(x));
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    const polygon = geom.lightPolygon(position, 2000, triangs);
    const { rect: bounds } = polygon;
    const sourceRatios = position.clone().sub(bounds).scale(1 / bounds.width, 1 / bounds.height);
    return { polygon, sourceRatios };
  }, [position.x, position.y]);

  return <>
    <path
      className="light"
      d={light.polygon.svgPath}
    />
    <DraggableNode
      initial={position}
      onChange={setPosition}
    />
  </>;
}

const rootCss = css`
  path.light {
    fill: blue;
    stroke: black;
    animation: fadein 1s infinite alternate ease;
    
    @keyframes fadein {
      from { opacity: 0; }
      to { opacity: 0.35; }
    }
  }
  &.disabled path.light {
    animation: fadein 1s forwards;
  }
`;
