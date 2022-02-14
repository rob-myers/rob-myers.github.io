/**
 * TODO
 * - try <mask> with radial filled polys, instead of <path>
 * - take open doors into account
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
      dark: new Poly,
      lights: /** @type {{ position: Vect; poly: Poly; ratio: Vect }[]} */ ([]),
      /**
       * @param {Geom.Vect[]} positions 
       */
      computeLights(positions) {
        const hullOutline = Poly.from(json.hull.poly[0]).removeHoles();
        // NOTE now includes doors
        const polys = json.walls.concat(json.doors.map(x => x.poly)).map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        const inners = positions.filter(p => hullOutline.contains(p));

        state.lights = inners.map(position => {
          const poly = geom.lightPolygon(position, 2000, triangs);
          const bounds = poly.rect;
          const ratio = new Vect(
            (position.x - bounds.x) / bounds.width,
            (position.y - bounds.y) / bounds.height, // or...
          );
          return { position, poly, ratio };
        });

        state.dark = Poly.cutOut(state.lights.map(({ poly }) => poly), [hullOutline])[0];
      },
    };
  });
  
  React.useEffect(() => {
    state.computeLights(props.positions.map(Vect.from));
  }, [props.positions]);

  return <>
    {/* <path
      className="shadow"
      d={state.dark.svgPath}
    /> */}
    <defs>
      {state.lights.map((light, i) => (
        <radialGradient
          id={`my-radial-${i}`}
          fx={light.ratio.x}
          fy={light.ratio.y}
        >
          <stop offset="0%" stop-color="white"/>
          <stop offset="98%" stop-color={baseGrey} />
          <stop offset="100%" stop-color={baseGrey} />
        </radialGradient>
      ))}
      <mask id="my-funky-mask">
        <rect {...props.json.pngRect} fill={baseGrey} />
        {state.lights.map(({ poly }, i) => (
          <path
            d={poly.svgPath}
            // fill="white"
            fill={`url(#my-radial-${i})`}
          />
        ))}
        <circle cx="50" cy="50" r="50" fill="url(#my-radial)" />
      </mask>
    </defs>
    {props.positions.map(p => (
      <image
        href="/icon/Simple_Icon_Eye.svg"
        width="20" height="20" x={p.x - 10} y={p.y - 10} 
      />
    ))}
  </>;
}

export const baseGrey = '#8a8a8a';
