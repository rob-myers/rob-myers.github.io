/**
 * TODO
 * - NOTE avoid storing stuff in useMuState because need to track change?
 * - unique per geomorph i.e. need to translate for dups (?)
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
      key: `Lights_${props.json.id}`, // determined by geomorph
      lights: /** @type {NPC.Light[]} */ ([]),
      doors: /** @type {Record<number, 'open' | 'closed'>} */ ({}),
      /** @param {NPC.LightsProps} props */
      computeLights({ json, defs }) {
        const hullOutline = Poly.from(json.hull.poly[0]).removeHoles();
        const polys = json.walls.concat(
          // Include doors which are not explicitly open
          json.doors.filter((_, i) => state.doors[i] !== 'open').map(x => x.poly)
        ).map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        const inners = defs.filter(({ def: [position] }) => hullOutline.contains(position));

        state.lights = inners.map(({ def: [position, distance, intensity, maskId] }, i) => {
          const poly = geom.lightPolygon(position, distance, triangs);
          const rect = poly.rect;
          const ratio = new Vect(
            (position.x - rect.x) / rect.width,
            (position.y - rect.y) / rect.height,
          );
          const scale = rect.width >= rect.height
            ? new Vect(1, rect.width / rect.height)
            : new Vect(rect.height / rect.width, 1);
          // Ellipse is centered in rect and covers it (when r=50% or r=0.5)
          // We want it to correspond to light distance
          const r = 0.5 * (distance / (Math.max(rect.width, rect.height)/2));
          return {
            key: 'light', index: i, maskId,
            intensity, position, poly, ratio, r, scale,
          };
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
  }, [props.defs]);

  return <>
    <defs>
      {state.lights.map(({ ratio, scale, r, intensity }, i) => (
        <radialGradient
          id={`radial-${state.key}-${i}`}
          cx={ratio.x}
          cy={ratio.y}
          r={r}
          // Need transform to make ellipse into circle
          gradientTransform={`translate(${ratio.x}, ${ratio.y}) scale(${scale.x}, ${scale.y}) translate(${-ratio.x}, ${-ratio.y})`}
        >
          <stop offset="0%" stop-color={`rgb(${intensity * 255 >> 0}, ${intensity * 255 >> 0}, ${intensity * 255 >> 0})`}/>
          <stop offset="90%" stop-color="#000" />
          <stop offset="100%" stop-color="#000" />
        </radialGradient>
      ))}
      {[0, 1].map(maskId =>
        <mask id={`mask-${state.key}-${maskId}`}>
          {state.lights.filter(x => x.maskId === maskId).map(({ poly, index }) => (
            <path
              d={poly.svgPath}
              fill={`url(#radial-${state.key}-${index})`}
            />
          ))}
        </mask>
      )}
    </defs>

    {[0, 1].map(maskId =>
      <image 
        {...props.json.pngRect}
        className="geomorph-light"
        href={geomorphPngPath(props.json.key)}
        mask={`url(#mask-${state.key}-${maskId})`}
      />
    )}
    {state.lights.map(({ position }) => <>
      <image
        href="/icon/Simple_Icon_Eye.svg"
        width="20" height="20" x={position.x - 10} y={position.y - 10} 
      />
    </>)}
  </>;
}
