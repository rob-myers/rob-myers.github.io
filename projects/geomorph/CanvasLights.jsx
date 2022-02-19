/**
 * TODO
 * - <canvas> with drawImage of geomorph
 * - draw each light on top of it
 */

import React from "react";
import { useQuery } from "react-query";
import useMuState from "../hooks/use-mu-state";
import { geomorphPngPath } from "./geomorph.model";

/** @param {NPC.LightsProps} props */
export default function CanvasLights(props) {

  const state = useMuState(() => {
    return {
      canvas: /** @type {HTMLCanvasElement} */ ({}),
      ctxt: /** @type {CanvasRenderingContext2D} */ ({}),
      image: /** @type {HTMLImageElement} */ ({}),
      /** @type {React.RefCallback<HTMLCanvasElement>} */
      rootRef(el) {
        if (el) {
          state.canvas = el;
          state.canvas.width = 2 * props.json.pngRect.width;
          state.canvas.height = 2 * props.json.pngRect.height;
          state.ctxt = /** @type {*} */ (state.canvas.getContext('2d'));
        }
      },
      updateLights() {
        if (state.image) {
          // IOS does not support, but there is a polyfill
          // https://github.com/davidenke/context-filter-polyfill
          state.ctxt.filter = 'brightness(50%)';
          state.ctxt.drawImage(state.image, 0, 0);
          // TODO add radial fill lights
        }
      },
    };
  });

  // TODO better way
  const { data: image } = useQuery(`image:${props.json.key}`, async () => {
    const image = new Image;
    image.src = geomorphPngPath(props.json.key);
    await new Promise((res) => image.onload = res);
    return state.image = image;
  });

  React.useEffect(() => {
    state.updateLights();
  }, [props.defs, image]);

  return (
    <canvas
      ref={state.rootRef}
      style={{ width: props.json.pngRect.width }}
    />
  );
}
