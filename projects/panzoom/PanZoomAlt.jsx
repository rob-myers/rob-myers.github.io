import React, { useEffect } from "react";
import { css } from "goober";

import { Rect, Vect } from "../geom";
import { isSvgEvent } from "../service";
import { Grid } from './PanZoom';

/**
 * TODO alternative pan zoom
 */

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoomAlt(props) {

  /** @type {React.RefObject<SVGSVGElement>} */
  const rootRef = (React.useRef());
  const [bounds, setBounds] = React.useState(() => new Rect);
  const [zoomFactor, setZoomFactor] = React.useState(100);
  const scale = zoomFactor / 100;

  useEffect(() => {
    const parentEl = rootRef.current?.parentElement;
    if (parentEl) {
      setBounds(new Rect(0, 0, parentEl.offsetWidth, parentEl.offsetHeight));
    }
  }, []);

  return (
    <svg
      ref={rootRef}
      className={rootCss}

      // Initially, just try to get orig approach working
      // onMouseUp={this.debugMouseWorldPosition}
      onWheel={(e) => {
        e.preventDefault();

        if (e.shiftKey) {// Zoom
          const nextZoom = zoomFactor - 0.5 * e.deltaY;
          if (
            Math.abs(e.deltaY) > 0.1 && nextZoom >= 25 && nextZoom <= 800
          ) {
            setZoomFactor(nextZoom);
            
            // Preserve world position of mouse.
            const { x: svgPosX, y: svgPosY } = getRelativePos(e)
            bounds.x += svgPosX * 100 * (1 / zoomFactor - 1 / nextZoom); // Mutate
            bounds.y += svgPosY * 100 * (1 / zoomFactor - 1 / nextZoom);
          }
        } else {// Pan.
          // Fresh render bounds triggers update.
          const nextBounds = bounds.clone().delta(0.5 * e.deltaX, 0.5 * e.deltaY);
          setBounds(nextBounds);
        }
      }}
    >
      <g transform={`scale(${scale})`}>
        <g transform={`translate(${-bounds.x}, ${-bounds.y})`}>
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
 * @property {(el: SVGSVGElement) => void} [onUpdate]
 */


const rootCss = css`
  width: 100%;
  height: 100%;
  /* background: #000; */
  /** Fixes Safari height issue. */
  position: 'absolute';
  // filter: 'invert(100%)',
`;

/** @param {React.MouseEvent} e */
function getRelativePos(e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return new Vect(e.clientX - left, e.clientY - top);
}
