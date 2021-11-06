import * as React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { Vect } from '../geom';
import { getSvgPos, getSvgMid, canTouchDevice, projectSvgEvt, isSvgEvent } from '../service';

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoom(props) {

  const [state] = React.useState(() => {
    const viewBox = props.initViewBox.clone();
    const minZoom = props.minZoom || 0.5;
    const maxZoom = props.maxZoom || 2;
    const wheelDelta = 0.003;

    return {
      viewBox,
      /** @type {null | Vect} */
      panFrom: null,
      zoom: props.initZoom || 1,
      /** @type {import('../service').SvgPtr[]} */
      ptrs: [],
      /** @type {null | number} */
      ptrDiff: null,
      /**
       * @param {DOMPoint} point 
       * @param {number} delta 
       */
      zoomTo: (point, delta) => {
        const zoom = Math.min(Math.max(state.zoom + delta, minZoom), maxZoom);
        viewBox.x = (state.zoom / zoom) * (viewBox.x - point.x) + point.x;
        viewBox.y = (state.zoom / zoom) * (viewBox.y - point.y) + point.y;
        viewBox.width = (1 / zoom) * props.initViewBox.width;
        viewBox.height = (1 / zoom) * props.initViewBox.height;
        state.zoom = zoom;
      },
      /** @param {WheelEvent} e */
      onWheel: e => {
        e.preventDefault();
        if (isSvgEvent(e)) {
          const point = getSvgPos(projectSvgEvt(e));
          state.zoomTo(point, -wheelDelta * e.deltaY);
          state.root.setAttribute('viewBox', `${state.viewBox}`);
          props.onUpdate?.(state.root);
        }
      },
      /** @param {PointerEvent} e */
      onPointerDown: e => {
        if (isSvgEvent(e) && state.ptrs.length < 2) {
          state.panFrom = (new Vect).copy(getSvgPos(projectSvgEvt(e)));
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
            state.root.setAttribute('viewBox', `${state.viewBox}`);
            props.onUpdate?.(state.root);
          }          
          state.ptrDiff = ptrDiff;
        } else if (state.panFrom) {
          const mouse = getSvgPos(projectSvgEvt(e));
          viewBox.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);
          state.root.setAttribute('viewBox', `${state.viewBox}`);
          props.onUpdate?.(state.root);
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
      /** @type {(el: null | SVGSVGElement) => void} */
      rootRef: el => {
        if (el) {
          state.root = el;
          el.addEventListener('wheel', state.onWheel, { passive: false });
          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });
          el.addEventListener('pointermove', state.onPointerMove, { passive: true });
          el.addEventListener('pointerup', state.onPointerUp, { passive: true });
          el.addEventListener('pointercancel', state.onPointerUp, { passive: true });
          el.addEventListener('pointerleave', state.onPointerUp, { passive: true });
          el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
        }
      },
      /** @type {SVGSVGElement} */
      root: ({}),
      rootCss: css`
        width: 100%;
        height: 100%;
        touch-action: pan-x pan-y pinch-zoom;
        > g.content {
          shape-rendering: ${canTouchDevice ? 'optimizeSpeed' : 'auto'};
        }
        > .grid {
          pointer-events: none;
        }
      `,
    };
  });

  return (
    <svg
      ref={state.rootRef}
      className={state.rootCss}
      preserveAspectRatio="xMinYMin"
      viewBox={`${state.viewBox}`}
    >
      <g className={classNames("content", props.className)}>
        {props.children}
      </g>
      <Grid bounds={props.gridBounds} />
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

/** @param {{ bounds: Geom.Rect }} props */
function Grid(props) {
  const uid = React.useMemo(() => gridPatternCount++, []);

  return <>
    {[10, 60].flatMap(dim => [
      <defs>
        <pattern
          id={`pattern-grid-${dim}x${dim}--${uid}`}
          width={dim}
          height={dim}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${dim} 0 L 0 0 0 ${dim}`}
            fill="none"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="0.3"
          />
        </pattern>
      </defs>,
      <rect
        className="grid"
        x={props.bounds.x}
        y={props.bounds.y}
        width={props.bounds.width}
        height={props.bounds.height}
        fill={`url(#pattern-grid-${dim}x${dim}--${uid})`}
      />
    ])}
  </>;
}

let gridPatternCount = 0;