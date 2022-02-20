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
          const poly = geom.lightPolygon(position, distance, triangs);
          return { key: 'light', index: i, intensity, position, poly, radius: distance };
        });

        // TODO add radial fill lights
        // ctxt.scale(2, 2);
        // ctxt.translate(-json.pngRect.x, -json.pngRect.y);
        // ctxt.globalCompositeOperation = 'multiply';

        state.lights.forEach(({ poly, position, radius }) => {
          const pattern = /** @type {CanvasPattern} */ (ctxt.createPattern(json.image, 'no-repeat'));
          pattern.setTransform(new DOMMatrix(`scale(0.5) translate(${2 * json.pngRect.x}px, ${2 * json.pngRect.y}px)`))
          ctxt.fillStyle = pattern;
          ctxt.setTransform(2, 0, 0, 2, 0, 0); // Must scale up
          fillPolygon(state.ctxt, [poly]);

          // const gradient = ctxt.createRadialGradient(
          //   position.x, position.y, 0,
          //   position.x, position.y, radius,
          // );
          // gradient.addColorStop(0, 'white');
          // gradient.addColorStop(0.9, 'rgba(255,255,255,0)');
          // ctxt.fillStyle = gradient;
          // fillPolygon(state.ctxt, [poly]);

          ctxt.setTransform(1, 0, 0, 1, 0, 0);
        });

        // ctxt.globalCompositeOperation = 'source-over';
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
