/**
 * TODO
 * - <canvas> with drawImage of geomorph
 * - draw each light on top of it
 */

import React from "react";
import useMuState from "../hooks/use-mu-state";

/** @param {NPC.LightsProps} props */
export default function CanvasLights(props) {

  const state = useMuState(() => {
    return {
      canvas: /** @type {HTMLCanvasElement} */ ({}),
      ctxt: /** @type {CanvasRenderingContext2D} */ ({}),
      /** @type {React.RefCallback<HTMLCanvasElement>} */
      rootRef(el) {
        if (el) {
          state.canvas = el;
          // PNG was scaled up, so looks better zoomed in
          state.canvas.width = 2 * props.json.pngRect.width;
          state.canvas.height = 2 * props.json.pngRect.height;
          state.ctxt = /** @type {*} */ (state.canvas.getContext('2d'));
          state.updateLights();
        }
      },
      updateLights() {
        // IOS does not support, but there is a polyfill
        // https://github.com/davidenke/context-filter-polyfill
        state.ctxt.filter = 'brightness(50%)';
        state.ctxt.drawImage(props.json.image, 0, 0);
        // TODO add radial fill lights
      },
    };
  });

  React.useEffect(() => {
    state.updateLights();
  }, [props.defs]);

  return (
    <canvas
      ref={state.rootRef} // Undo scale up:
      style={{ width: props.json.pngRect.width }}
    />
  );
}
