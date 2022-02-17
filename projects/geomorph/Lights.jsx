/**
 * TODO
 * - cleanup e.g. ids
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
    return {
      lights: /** @type {{ position: Vect; poly: Poly; ratio: Vect; r: number; scale: Vect }[]} */ ([]),
      doors: /** @type {Record<number, 'open' | 'closed'>} */ ({}),
      /** @param {NPC.LightsProps} props */
      computeLights({ json, lights: defs }) {
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
          const rect = poly.rect;
          const ratio = new Vect(
            (position.x - rect.x) / rect.width,
            (position.y - rect.y) / rect.height,
          );
          const scale = rect.width >= rect.height
            ? new Vect(1, rect.width / rect.height)
            : new Vect(rect.height / rect.width, 1);
          // Imagine ellipse centered in rect covering it (r=50% or r=0.5)
          // We want it to correspond to light distance
          const r = 0.5 * (def.d / (Math.max(rect.width, rect.height)/2));
          return { position, poly, ratio, dist: def.d, scale, r };
        });
      },
    };
  });
  
  React.useEffect(() => {
    state.computeLights(props);
    const subs = props.wire.subscribe(msg => {
      switch (msg.key) {
        case 'opened-door': {
          state.doors[msg.index] = 'open';
          state.computeLights(props);
          update();
          break;
        }
        case 'closed-door': {
          state.doors[msg.index] = 'closed';
          state.computeLights(props);
          update();
          break;
        }
      }
    })
    return () => subs.unsubscribe();
  }, [props.lights]);

  return <>
    <defs>
      {state.lights.map(({ ratio, scale, r }, i) => (
        <radialGradient
          id={`my-radial-${i}`}
          cx={ratio.x}
          cy={ratio.y}
          r={r}
          gradientTransform={`translate(${ratio.x}, ${ratio.y}) scale(${scale.x}, ${scale.y}) translate(${-ratio.x}, ${-ratio.y})`}
        >
          <stop offset="0%" stop-color="#aaa"/>
          <stop offset="80%" stop-color="#000" />
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
