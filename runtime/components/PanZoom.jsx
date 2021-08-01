import { useEffect } from 'react';
import useMeasure from 'react-use-measure';
import { css } from '@emotion/react'
import { nanoid } from 'nanoid';
import useForceRefresh from 'runtime/hooks/use-force-refresh';
import { getRelativePos } from 'runtime/service/dom';
import { Rect } from 'runtime/geom';

/** @typedef {import('react').WheelEvent} WheelEvent */

export default function PanZoom() {
  const [ref, domBounds] = useMeasure();

  const [refresh, state] = useForceRefresh({
    gridId: `grid-${nanoid()}`,
    zoom: 100,
    /** Userspace bounds */
    bounds: new Rect(0, 0, domBounds.width, domBounds.height),
    dx: 0,
    dy: 0,
    /** @type {null | SVGSVGElement} */
    root: null,
    ref: (/** @type {null | SVGSVGElement} */ x) => {
      ref(x);
      state.root = x;
    },
    onWheel: (/** @type {WheelEvent} */ e) => {
      if (e.shiftKey) {// Zoom
        const nextZoom = state.zoom - 0.5 * e.deltaY;
        if (Math.abs(e.deltaY) > 0.1 && nextZoom >= 50 && nextZoom <= 500) {
          const [rx, ry] = getRelativePos(e);
          // We preserve world position of mouse while scaling
          state.bounds.x += rx * 100 * (1/state.zoom - 1/nextZoom);
          state.bounds.y += ry * 100 * (1/state.zoom - 1/nextZoom);
          state.zoom = nextZoom;
          refresh();
        }
      } else {// Pan
        state.bounds.delta(0.5 * e.deltaX, 0.5 * e.deltaY);
        refresh();
      }
      state.dx = -(state.bounds.x > 0 ? state.bounds.x % 10 : (state.bounds.x % 10) + 10);
      state.dy = -(state.bounds.y > 0 ? state.bounds.y % 10 : (state.bounds.y % 10) + 10);
    },
    preventDefault: (/** @type {MouseEvent} */ e) => e.preventDefault(),
  });

  useEffect(() => {// useLayoutEffect?
    state.bounds.width = domBounds.width;
    state.bounds.height = domBounds.height;
    refresh();
  }, [domBounds]);

  useEffect(() => {
    state.root?.addEventListener('wheel', state.preventDefault);
    return () => state.root?.removeEventListener('wheel', state.preventDefault);
  }, []);

  return (
    <svg
      ref={state.ref}
      css={css`
        width: 100%;
        height: 100%;
        background: #fff;
        position: absolute; /** Fixes Safari issue? */
      `}
      onWheel={state.onWheel}
    >
      <GridPattern gridId={state.gridId} dx={state.dx} dy={state.dy} />
      <g transform={`scale(${state.zoom / 100})`}>
        <rect
          width="200%" // since max zoom x2
          height="200%"
          fill={`url(#${state.gridId})`}
        />
        <g transform={`translate(${-state.bounds.x}, ${-state.bounds.y})`}>

          {/* TODO */}
          <rect x={5} y={5} width={20} height={20} fill="red" />

        </g>
      </g>

    </svg>
  );
}

/** @param {{ gridId: string, dx: number; dy: number }} props */
function GridPattern({ gridId, dx, dy }) {
  return (
    <defs>
      <pattern
        id={gridId} x={dx} y={dy} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="0.3"/>
      </pattern>
    </defs>
  );
}
