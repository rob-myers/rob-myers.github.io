import * as React from 'react';
import { css } from 'goober';
import { Vect, Rect } from '../geom';
import { getSvgPos, getSvgMid, generateId } from '../service';

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoom(props) {

  const state = React.useMemo(() => {
    const viewBox = props.initViewBox.clone();
    const minZoom = props.minZoom || 0.5;
    const maxZoom = props.maxZoom || 2;
    return {
      viewBox,
      /** @type {null | Vect} */
      panFrom: null,
      zoom: props.initZoom || 1,
      /** @type {PointerEvent[]} */
      ptrEvent: [],
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
        const point = getSvgPos(e);
        state.zoomTo(point, -0.003 * e.deltaY);
        state.root.setAttribute('viewBox', `${state.viewBox}`);
      },
      /** @param {PointerEvent} e */
      onPointerDown: e => {
        state.panFrom = (new Vect(0, 0)).copy(getSvgPos(e));
        state.ptrEvent.push(e);
      },
      /** @param {PointerEvent} e */
      onPointerMove: e => {
        state.ptrEvent = state.ptrEvent.map(x => x.pointerId === e.pointerId ? e : x);

        if (state.ptrEvent.length === 2) {
          
          const ptrDiff = Math.abs(state.ptrEvent[1].clientX - state.ptrEvent[0].clientX);
          if (state.ptrDiff !== null) {
            const point = getSvgMid(state.ptrEvent);
            state.zoomTo(point, 0.02 * (ptrDiff - state.ptrDiff));
            state.root.setAttribute('viewBox', `${state.viewBox}`);
          }          
          state.ptrDiff = ptrDiff;
        } else if (state.panFrom) {
          const mouse = getSvgPos(e);
          viewBox.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);
          state.root.setAttribute('viewBox', `${state.viewBox}`);
        }
      },
      /** @param {PointerEvent} e */
      onPointerUp: (e) => {
        state.panFrom = null;
        state.ptrEvent = state.ptrEvent.filter(alt => e.pointerId !== alt.pointerId);
        if (state.ptrEvent.length < 2) {
          state.ptrDiff = null;
        }
      },
      /** @type {(el: null | SVGSVGElement) => void} */
      rootRef: el => {
        if (el) {
          state.root = el;
          el.addEventListener('wheel', state.onWheel);
          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });
          el.addEventListener('pointermove', state.onPointerMove, { passive: true });
          el.addEventListener('pointerup', state.onPointerUp, { passive: true });
          el.addEventListener('pointercancel', state.onPointerUp, { passive: true });
          el.addEventListener('pointerleave', state.onPointerUp, { passive: true });
          el.addEventListener('pointerout', state.onPointerUp, { passive: true });
          el.addEventListener('touchstart', e => e.preventDefault());
        } else if (state.root) {
          state.root.removeEventListener('wheel', state.onWheel);
          state.root.removeEventListener('pointerdown', state.onPointerDown);
          state.root.removeEventListener('pointermove', state.onPointerMove);
          state.root.removeEventListener('pointerup', state.onPointerUp);
          state.root.removeEventListener('pointercancel', state.onPointerUp);
          state.root.removeEventListener('pointerleave', state.onPointerUp);
          state.root.removeEventListener('pointerout', state.onPointerUp);
          state.root.removeEventListener('touchstart', e => e.preventDefault());
        }
      },
      /** @type {SVGSVGElement} */
      root: ({}),
      rootCss: css`
        width: 100%;
        height: 100%;
        /* background: #fff; */
        touch-action: pan-x pan-y pinch-zoom;

        > g.contents {
          shape-rendering: optimizeSpeed;
        }
      `,
    };
  }, []);

  return (
    <svg
      ref={state.rootRef}
      className={state.rootCss}
      preserveAspectRatio="xMinYMin"
      viewBox={`${state.viewBox}`}
    >
      <Grid bounds={props.gridBounds} />
      <g className="contents">
        {props.children}
      </g>
    </svg>
  );
}

/**
 * @typedef Props @type {object}
 * @property {Rect} gridBounds World bounds
 * @property {Rect} initViewBox Initial viewbox in world coords
 * @property {number=} minZoom Minimum zoom factor (default 0.5)
 * @property {number=} maxZoom Maximum zoom factor (default 2)
 * @property {number=} initZoom Initial zoom factor (default 1)
 */

/** @param {{ bounds: Rect }} props */
function Grid(props) {
  const gridId = React.useMemo(() => generateId('grid-'), []);

  return <>
    <defs>
      <pattern
        id={gridId}
        width="10" 
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 10 0 L 0 0 0 10"
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.3"
        />
      </pattern>
    </defs>
    <rect
      x={props.bounds.x}
      y={props.bounds.y}
      width={props.bounds.width}
      height={props.bounds.height}
      fill={`url(#${gridId})`}
    />
  </>;
}
