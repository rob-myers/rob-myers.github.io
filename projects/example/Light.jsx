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
 * - fix when light outside hull
 * - two lights with initial positions
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
      className={classNames(rootCss, props.disabled && 'disabled')}
    >
      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light walls={data.walls} />
      </>}
    </PanZoom>
  );
}

/** @param {{ walls: Geom.GeoJsonPolygon[] }} props */
function Light({ walls }) {

  const [position, setPosition] = React.useState(() => new Vect(300, 300));

  const light = useMemo(() => {
    const polys = walls.map(x => Poly.from(x));
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    return geom.lightPolygon(position, 2000, triangs);
  }, [position.x, position.y]);

  return <>
    <path
      className="light"
      d={light.svgPath}
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
    animation: fadein 1s infinite alternate;
    
    @keyframes fadein {
      from { opacity: 0; }
      to { opacity: 0.35; }
    }
  }
  &.disabled path.light {
    animation: none;
    opacity: 0.25;
  }
`;
