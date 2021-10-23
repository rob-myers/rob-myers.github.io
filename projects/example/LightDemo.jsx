import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Poly, Rect, Vect } from "../geom";
import PanZoom from "../panzoom/PanZoom";
import { lightPolygon } from "projects/raycast/light";
import { geom } from "projects/service";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  const light = useMemo(() => {
    /**
     * TODO apply gradient effect
     */
    const polys = (data?.walls.map(x => Poly.from(x)) || []);
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    const light = lightPolygon(new Vect(300, 300), 500, triangs);
    return light;
  }, [data?.walls]);

  console.log(light);

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
    >
      {data && <>
        <image
          {...data.pngRect}
          className="geomorph"
          href={`/geomorph/${props.layoutKey}.png`}
        />

        <path style={{ fill: 'rgba(255, 0, 0, 0.2)' }} d={light?.svgPath} />
        
      </>}
    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);

const rootCss = css`
  /* TODO */
`;
