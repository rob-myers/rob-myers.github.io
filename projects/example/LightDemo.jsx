import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Poly, Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";
import { lightPolygon } from "projects/raycast/light";
import { geom } from "projects/service";

// TODO use image instead

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  const floorPolys = useMemo(() => {
    const polys = data?.floorPoly.map(x => Poly.from(x)) || [];
    // const decomps = polys.map(poly => geom.triangulationToPoly(poly.fastTriangulate()));
    // const lights = decomps.map(({ tris }) => lightPolygon(poly));
    return polys;
  }, [data?.floorPoly]);

  console.log('floorPoly', data?.floorPoly);

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
        {floorPolys.map(x => (
          <path style={{ fill: 'rgba(255, 0, 0, 0.2)' }} d={x.svgPath} />
        ))}
        {/* <ForeignObject json={data} /> */}
      </>}
    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);

const rootCss = css`
  /* TODO */
`;
