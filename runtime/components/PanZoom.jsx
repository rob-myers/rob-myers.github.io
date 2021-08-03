/** @typedef {import('react')} React */
import React, { useEffect, useRef, useMemo } from 'react';
import { css } from '@emotion/react'
import { nanoid } from 'nanoid';
import useForceRefresh from 'runtime/hooks/use-force-refresh';
import { getSvgPos } from 'runtime/service/dom';
import { Rect } from 'runtime/geom';

/** @param {React.PropsWithChildren<{}>} props */
export default function PanZoom({ children }) {

  const [refresh, state] = useForceRefresh(() => {
    const bounds = new Rect(0, 0, 200, 200);
    const baseBounds = bounds.clone();
    return {
      zoom: 100,
      /** Userspace view bounds */
      bounds,
      /** Userspace view initial bounds */
      baseBounds,
      worldBounds: new Rect(-1000, -1000, 2000 + 1, 2000 + 1),
      /** @param {React.WheelEvent<SVGSVGElement>} e */
      onWheel: e => {
        if (e.shiftKey) {// Zoom
          const zoom = state.zoom + 0.03 * e.deltaY;
          if (zoom <= 20) {
            return;
          }
          // Preserve world position of mouse while scaling
          const { x: rx, y: ry } = getSvgPos(e);
          bounds.x = (zoom / state.zoom) * (bounds.x - rx) + rx;
          bounds.y = (zoom / state.zoom) * (bounds.y - ry) + ry;
          bounds.width = (zoom / 100) * baseBounds.width;
          bounds.height = (zoom / 100) * baseBounds.height;
          state.zoom = zoom;
        } else {// Pan
          bounds.delta(0.25 * e.deltaX, 0.25 * e.deltaY);
        }
        refresh();
      },
      /** @param {MouseEvent} e */
      preventDefault: e => e.preventDefault(),
      rootCss: css`
        width: 100%;
        height: 100%;
        background: #fff;
        position: absolute; /** Fixes Safari issue? */
      `,
    };
  });

  const root = useRef(/** @type {null|SVGSVGElement} */ (null));
  useEffect(() => {
    root.current?.addEventListener('wheel', state.preventDefault);
    return () => root.current?.removeEventListener('wheel', state.preventDefault);
  }, []);

  return (
    <svg
      ref={root}
      css={state.rootCss}
      onWheel={state.onWheel}
      viewBox={`${state.bounds}`}
      preserveAspectRatio="xMinYMin"
    >
      <MemoedGrid bounds={state.worldBounds} />
      {children}
    </svg>
  );
}

/** @param {{ bounds: Rect }} props */
function Grid({ bounds }) {
  const gridId = useMemo(() => `grid-${nanoid()}`, []);
  return <>
    <defs>
      <pattern
        id={gridId}
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="0.3"/>
      </pattern>
    </defs>
    <rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.width}
      height={bounds.height}
      fill={`url(#${gridId})`}
    />
  </>;
}

const MemoedGrid = React.memo(Grid);
