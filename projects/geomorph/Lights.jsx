/**
 * TODO
 * - take open doors into account
 * - try mask instead and compare cpu
 */

import React from "react";
import { Poly, Vect } from "../geom";
import { geom } from "../service/geom";
import useMuState from "../hooks/use-mu-state";

/** @param {{ json: Geomorph.GeomorphJson, positions: Geom.VectJson[] }} props */
export default function Lights(props) {

  const state = useMuState(() => {
    const { json } = props;
    return {
      light: new Poly,
      /**
       * @param {Geom.Vect[]} positions 
       */
      computeDarkPoly(positions) {
        const hullOutline = Poly.from(json.hull.poly[0]).removeHoles();
        // NOTE now includes doors
        const polys = json.walls.concat(json.doors.map(x => x.poly)).map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        const inners = positions.filter(p => hullOutline.contains(p));
        const lights = inners.map(p => geom.lightPolygon(p, 2000, triangs));
        return Poly.cutOut(lights, [hullOutline])[0];
      },
    };
  });
  
  React.useEffect(() => {
    state.light = state.computeDarkPoly(props.positions.map(Vect.from));
  }, [props.positions]);

  return (
    <path
      className="shadow"
      d={state.light.svgPath}
    />
  );
}
