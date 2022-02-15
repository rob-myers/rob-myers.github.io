/**
 * TODO
 * - take open doors into account
 *   - ✅ Doors communicate with Lights
 *   - light changes when door opens/closes
 * - ✅ try <mask> with radial filled polys, instead of <path>
 */

import React from "react";
import { Poly, Vect } from "../geom";
import { geom } from "../service/geom";
import useMuState from "../hooks/use-mu-state";
import { geomorphPngPath } from "./geomorph.model";

/** @param {NPC.LightsProps} props */
export default function Lights(props) {

  const state = useMuState(() => {
    const { json } = props;
    return {
      dark: new Poly,
      lights: /** @type {{ position: Vect; poly: Poly; ratio: Vect }[]} */ ([]),
      /**
       * @param {Geom.LightDef[]} defs 
       */
      computeLights(defs) {
        const hullOutline = Poly.from(json.hull.poly[0]).removeHoles();
        // NOTE now includes doors
        const polys = json.walls.concat(json.doors.map(x => x.poly)).map(x => Poly.from(x));
        // const polys = json.walls.map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        const inners = defs.filter(def => hullOutline.contains(def.p));

        state.lights = inners.map(def => {
          const position = def.p.clone();
          const poly = geom.lightPolygon(position, def.d, triangs);
          const bounds = poly.rect;
          const ratio = new Vect(
            (position.x - bounds.x) / bounds.width,
            (position.y - bounds.y) / bounds.height,
          );
          return { position, poly, ratio };
        });

        // TODO remove
        state.dark = Poly.cutOut(state.lights.map(({ poly }) => poly), [hullOutline])[0];
      },
    };
  });
  
  React.useEffect(() => {
    state.computeLights(props.lights);
  }, [props.lights]);

  React.useEffect(() => {
    return props.wire.subscribe(msg => {
      console.log(msg);
    }).unsubscribe;
  }, []);

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
          r="100%"
        >
          <stop offset="0%" stop-color="#bbb"/>
          <stop offset="60%" stop-color="#000" />
          <stop offset="100%" stop-color="#000" />
        </radialGradient>
      ))}
      <mask id="my-funky-mask">
        {/* <rect {...props.json.pngRect} fill={baseGrey} /> */}
        <rect {...props.json.pngRect} fill="#000" />
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
    <image 
      {...props.json.pngRect}
      className="geomorph-light"
      href={geomorphPngPath(props.json.key)}
      mask="url(#my-funky-mask)"
    />
    {props.lights.map(({p}) => (
      <image
        href="/icon/Simple_Icon_Eye.svg"
        width="20" height="20" x={p.x - 10} y={p.y - 10} 
      />
    ))}
  </>;
}

export const baseGrey = '#000';
