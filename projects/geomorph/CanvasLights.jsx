/**
 * TODO
 * - <canvas> with drawImage of geomorph
 * - draw each light on top of it
 */

import React from "react";
import { fillPolygon } from "../service/dom";
import { Poly, Vect } from "../geom";
import { geom } from "../service/geom";
import useMuState from "../hooks/use-mu-state";

/** @param {NPC.LightsProps} props */
export default function CanvasLights(props) {

  const state = useMuState(() => {
    return {
      canvas: /** @type {HTMLCanvasElement} */ ({}),
      ctxt: /** @type {CanvasRenderingContext2D} */ ({}),
      doors: /** @type {Record<number, 'open' | 'closed'>} */ ({}),
      lights: /** @type {NPC.Light[]} */ ([]),

      /** @type {React.RefCallback<HTMLCanvasElement>} */
      rootRef(el) {
        if (el) {
          state.canvas = el;
          // PNG was scaled up, so looks better zoomed in
          state.canvas.width = 2 * props.json.pngRect.width;
          state.canvas.height = 2 * props.json.pngRect.height;
          state.ctxt = /** @type {*} */ (state.canvas.getContext('2d'));
          state.updateLights(props);

        }
      },
      /** @param {NPC.LightsProps} props */
      updateLights({ json, defs }) {
        const ctxt = state.ctxt;

        // IOS does not support, but there is a polyfill
        // https://github.com/davidenke/context-filter-polyfill
        ctxt.filter = 'brightness(50%)';
        ctxt.drawImage(json.image, 0, 0);

        // Compute lights
        const polys = json.walls // Include doors which are not explicitly open
          .concat(json.doors.filter((_, i) => state.doors[i] !== 'open').map(x => x.poly))
          .map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        // TODO filter defs so in json.d.hullOutline?
        state.lights = defs.map(({ def: [position, distance, intensity, maskId] }, i) => {
          const poly = geom.lightPolygon(position, distance, triangs);
          return { key: 'light', index: i, intensity, position, poly };
        });

        // TODO add radial fill lights
        ctxt.fillStyle = 'red';
        ctxt.scale(2, 2);
        ctxt.translate(-json.pngRect.x, -json.pngRect.y);
        state.lights.forEach(({ poly }) => {
          fillPolygon(state.ctxt, [poly]);
        });
        ctxt.setTransform(1, 0, 0, 1, 0, 0);
      },
    };
  });

  React.useEffect(() => {
    state.updateLights(props);
    const subs = props.wire.subscribe(msg => {
      switch (msg.key) {
        case 'opened-door': {
          state.doors[msg.index] = 'open';
          state.updateLights(props);
          break;
        }
        case 'closed-door': {
          state.doors[msg.index] = 'closed';
          state.updateLights(props);
          break;
        }
      }
    })
    return () => subs.unsubscribe();
  }, [props.defs]);

  return (
    <canvas
      ref={state.rootRef} // Undo scale up:
      style={{ width: props.json.pngRect.width }}
    />
  );
}
