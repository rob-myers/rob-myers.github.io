import React, { useMemo } from "react";
import { css } from "goober";
import classNames from "classnames";

import { Poly, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { geom } from "../service/geom";
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";
import DraggableNode from "./svg-nav-demo/DraggableNode";
import useGeomorphData from "../hooks/use-geomorph-data";

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean }} props */
export default function SvgVisibilityDemoDemo(props) {

  const { data } = useGeomorphData(props.layoutKey);

  const [init] = React.useState(() => ({
    lightA: new Vect(205, 385),
    lightB: new Vect(930, 385),
  }));

  return (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={defaults.initViewBox}
      maxZoom={6}
      className={classNames(rootCss, props.disabled && 'disabled')}
      dark
    >
      {data && <>
        <image {...data.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />
        <Light init={init.lightA} walls={data.groups.walls} hull={data.hullPoly} />
        <Light init={init.lightB} walls={data.groups.walls} hull={data.hullPoly} />
      </>}
    </PanZoom>
  );
}

/** @param {{ init: Geom.Vect; walls: Geom.Poly[]; hull: Geom.Poly[] }} props */
function Light({ init, walls, hull }) {

  const [position, setPosition] = React.useState(() => init);

  const light = useMemo(() => {
    const hullOutline = hull[0].clone().removeHoles();
    if (hullOutline.contains(position)) {
      const polys = walls;
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
      onStop={setPosition}
      radius={20}
      stroke="black"
      icon="eye"
    />
  </>;
}

const rootCss = css`
  image {
    filter: contrast(200%) invert(100%);
  }

  path.light {
    fill: red;
    animation: fadein 1s infinite alternate;
    
    @keyframes fadein {
      from { opacity: 0; }
      to { opacity: 0.4; }
    }
  }
  &.disabled path.light {
    animation: none;
    opacity: 0.25;
  }
`;
