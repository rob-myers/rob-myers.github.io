import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Rect, Vect } from "../geom";
import { geom } from "../service";
import PanZoom from "../panzoom/PanZoom";
import { gridBounds, initViewBox } from "./defaults";

/**
 * TODO movable light
 */

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  const light = useMemo(() => {
    if (data?.walls) {
      const polys = (data?.walls.map(x => Poly.from(x)) || []);
      const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
      const position = new Vect(300, 300);
  
      const polygon = geom.lightPolygon(position, 800, triangs);
      const { rect: bounds } = polygon;
      const sourceRatios = new Vect(
        (position.x - bounds.x) / bounds.width,
        (position.y - bounds.y) / bounds.height,
      );
      return { polygon, sourceRatios };
    }
  }, [data?.walls]);

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
    >

      {data &&
        <image
        {...data.pngRect}
        className="geomorph"
        href={`/geomorph/${props.layoutKey}.png`}
        />
      }

      {light && <>
        <defs>
          <radialGradient
            id={`light-radial`}
            cx={`${100 * light.sourceRatios.x}%`}
            cy={`${100 * light.sourceRatios.y}%`}
            r="50%"
          >
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 230, 0.75)' }} />
            <stop offset="50%" style={{ stopColor: 'rgba(230, 230, 230, 0.2)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 200, 255, 0)' }} />
          </radialGradient>
        </defs>
        <path
          fill={`url(#light-radial)`}
          d={light.polygon.svgPath}
        />
      </>}
    </PanZoom>
  );
}

const rootCss = css`
  /* TODO */
`;
