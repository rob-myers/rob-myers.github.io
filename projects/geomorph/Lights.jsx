/**
 * TODO
 * - take open doors into account
 *   - ✅ Doors communicate with Lights
 *   - ✅ light changes when door opens/closes
 *   - cleanup e.g. ids
 * - ✅ try <mask> with radial filled polys, instead of <path>
 */

import React from "react";
import { Poly, Vect } from "../geom";
import { geom } from "../service/geom";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";
import { geomorphPngPath } from "./geomorph.model";

/** @param {NPC.LightsProps} props */
export default function Lights(props) {

  const update = useUpdate();

  const state = useMuState(() => {
    const { json } = props;
    return {
      lights: /** @type {{ position: Vect; poly: Poly; ratio: Vect }[]} */ ([]),
      doors: /** @type {Record<number, 'open' | 'closed'>} */ ({}),
      computeLights() {
        const defs = props.lights;
        const hullOutline = Poly.from(json.hull.poly[0]).removeHoles();
        const polys = json.walls.concat(
          // Include doors which are not explicitly open
          json.doors.filter((_, i) => state.doors[i] !== 'open').map(x => x.poly)
        ).map(x => Poly.from(x));
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

      },
    };
  });
  
  React.useLayoutEffect(() => {
    state.computeLights();
  }, [props.lights]);

  React.useEffect(() => {
    const subs = props.wire.subscribe(msg => {
      switch (msg.key) {
        case 'opened-door': {
          state.doors[msg.index] = 'open';
          state.computeLights();
          update();
          break;
        }
        case 'closed-door': {
          state.doors[msg.index] = 'closed';
          state.computeLights();
          update();
          break;
        }
      }
    })
    return () => subs.unsubscribe();
  }, []);

  return <>
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
      <mask id="lights-mask">
        <rect {...props.json.pngRect} fill="#000" />
        {state.lights.map(({ poly }, i) => (
          <path
            d={poly.svgPath}
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
      mask="url(#lights-mask)"
    />

    {state.lights.map(({ position, poly }) => <>
      <image
        href="/icon/Simple_Icon_Eye.svg"
        width="20" height="20" x={position.x - 10} y={position.y - 10} 
      />
    </>)}
  </>;
}
