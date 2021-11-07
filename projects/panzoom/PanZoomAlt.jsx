import React from "react";
import { css } from "goober";

import { Rect, Vect } from "../geom";
import { getSvgMid, getSvgPos, isSvgEvent, projectSvgEvt } from "../service";
import { Grid } from './PanZoom';

/**
 * TODO
 * - clean
 * - fix resize issue e.g. update initBounds
 */

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoomAlt(props) {

  const [state] = React.useState(() => {
    const zoomFactor = 100;
    const minZoom = props.minZoom || 0.5;
    const maxZoom = props.maxZoom || 2;
    const wheelDelta = 0.003;

    return {
      bounds: new Rect,
      initBounds: new Rect,
      zoomFactor,

      /** @type {import('../service').SvgPtr[]} */
      ptrs: [],
      /** @type {null | number} */
      ptrDiff: null,
      /** @type {null | Vect} */
      panFrom: null,

      scale: zoomFactor / 100,
      /** @type {SVGSVGElement} */
      root: ({}),
      /** @type {SVGGElement} */
      gScale: ({}),
      /** @type {SVGGElement} */
      gTranslate: ({}),

      /**
       * @param {DOMPoint} point 
       * @param {number} delta 
       */
       zoomTo: (point, delta) => {
        const zoom = Math.min(Math.max(state.scale + delta, minZoom), maxZoom);
        state.bounds.set(
          (state.scale / zoom) * (state.bounds.x - point.x) + point.x,
          (state.scale / zoom) * (state.bounds.y - point.y) + point.y,
          (1 / zoom) * state.initBounds.width,
          (1 / zoom) * state.initBounds.height,
        );
        state.scale = zoom;
      },
      /** @param {WheelEvent} e */
      onWheel: e => {
        e.preventDefault();
        if (isSvgEvent(e)) {
          const point = getSvgPos(projectSvgEvt(e), e.target);
          state.zoomTo(point, -wheelDelta * e.deltaY);
          state.gScale.style.transform = `scale(${state.scale})`;
          state.gTranslate.style.transform = `translate(${-state.bounds.x}px, ${-state.bounds.y}px)`;
          props.onUpdate?.(state.scale, state.bounds);
        }
      },
      /** @param {PointerEvent} e */
      onPointerDown: e => {
        if (isSvgEvent(e) && state.ptrs.length < 2) {
          state.panFrom = (new Vect).copy(getSvgPos(projectSvgEvt(e), e.target));
          state.ptrs.push(projectSvgEvt(e));
        }
      },
      /** @param {PointerEvent} e */
      onPointerMove: e => {
        state.ptrs = state.ptrs.map(x => x.pointerId === e.pointerId ? projectSvgEvt(e) : x);

        if (state.ptrs.length === 2) {
          const ptrDiff = Math.abs(state.ptrs[1].clientX - state.ptrs[0].clientX);
          if (state.ptrDiff !== null) {
            const point = getSvgMid(state.ptrs);
            state.zoomTo(point, 0.02 * (ptrDiff - state.ptrDiff));
            state.gScale.style.transform = `scale(${state.scale})`;
            state.gTranslate.style.transform = `translate(${-state.bounds.x}px, ${-state.bounds.y}px)`;
            props.onUpdate?.(state.scale, state.bounds);
          }          
          state.ptrDiff = ptrDiff;
        } else if (state.panFrom) {
          const mouse = getSvgPos(projectSvgEvt(e), e.target);
          state.bounds.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);
          state.gTranslate.style.transform = `translate(${-state.bounds.x}px, ${-state.bounds.y}px)`;
          props.onUpdate?.(state.scale, state.bounds);
        }
      },
      /** @param {PointerEvent} e */
      onPointerUp: (e) => {
        state.panFrom = null;
        state.ptrs = state.ptrs.filter(alt => e.pointerId !== alt.pointerId);
        if (state.ptrs.length < 2) {
          state.ptrDiff = null;
        }
        if (state.ptrs.length === 1) {
          state.panFrom = (new Vect).copy(getSvgPos(state.ptrs[0]));
        }
      },

      /** @type {React.RefCallback<SVGSVGElement>} */
      rootRef: (el) => {
        if (el) {
          state.root = el;
          state.gScale = /** @type {*} */ (el.children[0]);
          state.gTranslate = /** @type {*} */ (state.gScale.children[0]);

          el.addEventListener('wheel', state.onWheel, { passive: false });
          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });
          el.addEventListener('pointermove', state.onPointerMove, { passive: true });
          el.addEventListener('pointerup', state.onPointerUp, { passive: true });
          el.addEventListener('pointercancel', state.onPointerUp, { passive: true });
          el.addEventListener('pointerleave', state.onPointerUp, { passive: true });
          el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
        }
      },
    };
  });

  React.useLayoutEffect(() => {
    const { width, height } = state.root.getBoundingClientRect();
    state.bounds.set(0, 0, width, height);
    state.initBounds.copy(state.bounds);
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


// /** @type {DOMPoint} */
// let svgPoint;
// /**
//  * @param {SVGElement} el 
//  * @param {SvgPtr} ptr 
//  */
// function getSvgPos(el, ptr) {
//   svgPoint = svgPoint || ownerSvg.createSVGPoint();
//   svgPoint.x = ptr.clientX;
//   svgPoint.y = ptr.clientY;
//   return svgPoint.matrixTransform(ptr.ownerSvg.getScreenCTM()?.inverse());
// }
