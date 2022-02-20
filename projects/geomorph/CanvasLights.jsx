/**
 * TODO
 * - <canvas> with drawImage of geomorph
 * - draw each light on top of it
 */

import React from "react";
import { fillPolygon, strokePolygon } from "../service/dom";
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
        ctxt.globalCompositeOperation = 'source-over';
        ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);

        /**
         * Draw image so top left at world (0, 0), but with x2 width/height
         * by construction of the image. We undo this scale via CSS below.
         */
        // ctxt.setTransform(1, 0, 0, 1, 2 * json.pngRect.x, 2 * json.pngRect.y);
        // ctxt.drawImage(json.image, 0, 0);

        // Compute lights
        const polys = json.walls // Include doors which are not explicitly open
          .concat(json.doors.filter((_, i) => state.doors[i] !== 'open').map(x => x.poly))
          .map(x => Poly.from(x));
        const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
        // TODO filter defs so in json.d.hullOutline?
        state.lights = defs.map(({ def: [position, distance, intensity, maskId] }, i) => {
          const d = 1000;
          const poly = geom.lightPolygon(position, d, triangs);
          return { key: 'light', index: i, intensity, position, poly, radius: d };
        });

        state.lights.forEach(({ poly, position, radius, intensity }) => {
          ctxt.setTransform(1, 0, 0, 1, 0, 0);
          ctxt.filter = 'none';

          ctxt.setTransform(2, 0, 0, 2, 0, 0); // Must scale up
          const gradient = ctxt.createRadialGradient(
            position.x, position.y, 0,
            // position.x, position.y, radius,
            position.x, position.y, 300 * intensity, // TEST
          );
          gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
          gradient.addColorStop(0.56, `rgba(0, 0, 0, ${intensity / 2})`);
          gradient.addColorStop(0.86, '#00000000');
          ctxt.fillStyle = gradient;
          fillPolygon(state.ctxt, [poly]);
        });

        ctxt.globalCompositeOperation = 'source-in';
        ctxt.setTransform(1, 0, 0, 1, 2 * json.pngRect.x, 2 * json.pngRect.y);
        ctxt.drawImage(json.image, 0, 0);

        // TEST
        ctxt.globalCompositeOperation = 'source-over';
        ctxt.setTransform(2, 0, 0, 2, 0, 0)
        state.lights.forEach(({ poly }) => {
          ctxt.fillStyle = 'none';
          ctxt.strokeStyle = '#500';
          strokePolygon(state.ctxt, [poly]);
        });
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
