import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import classNames from "classnames";

import { Poly, Vect } from "../geom";
import { geom } from "../service/geom";
import { gridBounds, initViewBox } from "./defaults";
import PanZoom from "../panzoom/PanZoom";
import DraggableNode from "../ui/DraggableNode";

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  const [init] = React.useState(() => ({
    lightA: new Vect(205, 385),
    lightB: new Vect(930, 385),
  }));

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={classNames(rootCss, props.disabled && 'disabled')}
    >
      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light init={init.lightA} walls={data.walls} hull={data.hull.poly} />
        <Light init={init.lightB} walls={data.walls} hull={data.hull.poly} />
      </>}
    </PanZoom>
  );
}

/** @param {{ init: Geom.Vect; walls: Geom.GeoJsonPolygon[]; hull: Geom.GeoJsonPolygon[] }} props */
function Light({ init, walls, hull }) {

  const [position, setPosition] = React.useState(() => init);

  const light = useMemo(() => {
    const hullOutline = Poly.from(hull[0]).removeHoles();
    if (hullOutline.contains(position)) {
      const polys = walls.map(x => Poly.from(x));
      const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
      return geom.lightPolygon(position, 2000, triangs);
    } else return new Poly;
  }, [position.x, position.y]);

  return <>
    <path
      className="light"
      d={light.svgPath}
    />
    <DraggableNode
      initial={position}
      onChange={setPosition}
      radius={14}
    />
  </>;
}

const rootCss = css`
  path.light {
    fill: #00f;
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
