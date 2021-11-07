import React from "react";
import { css } from "goober";

import { Rect, Vect } from "../geom";
import { isSvgEvent } from "../service";
import { Grid } from './PanZoom';

/**
 * TODO
 * - get original panzoom controls working
 */

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoomAlt(props) {

  const [state] = React.useState(() => {
    const zoomFactor = 100;
    return {
      /** @type {React.RefCallback<SVGSVGElement>} */
      rootRef: (el) => {
        if (el) {
          state.root = el;
          state.gScale = /** @type {*} */ (el.children[0]);
          state.gTranslate = /** @type {*} */ (state.gScale.children[0]);
        }
      },
      bounds: new Rect,
      zoomFactor,
      scale: zoomFactor / 100,
      /** @type {SVGSVGElement} */
      root: ({}),
      /** @type {SVGGElement} */
      gScale: ({}),
      /** @type {SVGGElement} */
      gTranslate: ({}),
    };
  });

  React.useEffect(() => {
    const { width, height } = state.root.getBoundingClientRect();
    state.bounds.set(0, 0, width, height);
    state.gTranslate.style.transform = `translate(${-0}px, ${-0}px)`;
  }, []);

  React.useLayoutEffect(() => {
    if (props.children && props.onUpdate) {
      props.onUpdate(state.scale, state.bounds);
    }
  }, [!!props.children]);

  return (
    <svg
      ref={state.rootRef}
      className={rootCss}

      // Initially, just try to get orig approach working
      // onMouseUp={this.debugMouseWorldPosition}
      onWheel={(e) => {
        e.preventDefault();

        if (e.shiftKey) {// Zoom
          const nextZoom = state.zoomFactor - 0.5 * e.deltaY;
          if (Math.abs(e.deltaY) > 0.1 && nextZoom >= 25 && nextZoom <= 800) {
            // setZoomFactor(nextZoom);
            state.zoomFactor = nextZoom;

            // Preserve world position of mouse
            const { x: svgPosX, y: svgPosY } = getRelativePos(e)
            state.bounds.x += svgPosX * 100 * (1 / state.zoomFactor - 1 / nextZoom); // Mutate
            state.bounds.y += svgPosY * 100 * (1 / state.zoomFactor - 1 / nextZoom);
            props.onUpdate?.(nextZoom/100, state.bounds);

            state.gScale.style.transform = `scale(${nextZoom})`;
            state.gTranslate.style.transform = `translate(${-state.bounds.x}px, ${-state.bounds.y}px)`;
          }
        } else {// Pan
          // Fresh render bounds triggers update
          state.bounds.delta(0.5 * e.deltaX, 0.5 * e.deltaY);
          state.gTranslate.style.transform = `translate(${-state.bounds.x}px, ${-state.bounds.y}px)`;
          props.onUpdate?.(state.scale, state.bounds);
        }
      }}
    >
      <g transform={`scale(${state.scale})`}>
        <g transform={`translate(${-state.bounds.x}, ${-state.bounds.y})`}>
          <Grid bounds={props.gridBounds} />
          {props.children}
        </g>
      </g>
    </svg>
  );
}

/**
 * @typedef Props @type {object}
 * @property {Geom.Rect} gridBounds World bounds
 * @property {Geom.Rect} initViewBox Initial viewbox in world coords
 * @property {number} [minZoom] Minimum zoom factor (default 0.5)
 * @property {number} [maxZoom] Maximum zoom factor (default 2)
 * @property {number} [initZoom] Initial zoom factor (default 1)
 * @property {string} [className]
 * @property {(scale: number, bounds: Geom.Rect) => void} [onUpdate]
 */


const rootCss = css`
  width: 100%;
  height: 100%;
  /* filter: invert(100%); */
`;

/** @param {React.MouseEvent} e */
function getRelativePos(e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return new Vect(e.clientX - left, e.clientY - top);
}
