import React, { useMemo } from 'react';
import { css } from '@emotion/react'
import { nanoid } from 'nanoid';
import useForceRefresh from 'runtime/hooks/use-force-refresh';
import { getSvgPos } from 'runtime/service/dom';
import { Rect } from 'runtime/geom';

/** @param {React.PropsWithChildren<{}>} props */
export default function PanZoom({ children }) {

  const [refresh, state] = useForceRefresh(() => {
    const viewBox = new Rect(0, 0, 200, 200);
    const initViewBox = viewBox.clone();
    return {
      zoom: 1,
      viewBox,
      initViewBox,
      gridBounds: new Rect(-1000, -1000, 2000 + 1, 2000 + 1),
      /** @param {WheelEvent & { currentTarget: any }} e */
      onWheel: e => {
        e.preventDefault();
        if (e.shiftKey) {// Zoom
          const zoom = state.zoom + 0.003 * e.deltaY;
          if (zoom <= 0.2) {
            return;
          }
          // Preserve world position of mouse while scaling
          const { x: rx, y: ry } = getSvgPos(e);
          viewBox.x = (zoom / state.zoom) * (viewBox.x - rx) + rx;
          viewBox.y = (zoom / state.zoom) * (viewBox.y - ry) + ry;
          viewBox.width = zoom * initViewBox.width;
          viewBox.height = zoom * initViewBox.height;
          state.zoom = zoom;
        } else {// Pan
          viewBox.delta(0.25 * e.deltaX, 0.25 * e.deltaY);
        }
        refresh();
      },
      /** @type {React.LegacyRef<SVGSVGElement>} */
      rootRef: el => {
        el?.addEventListener('wheel', state.onWheel);
      },
      rootCss: css`
        width: 100%;
        height: 100%;
        background: #fff;
        position: absolute; /** Fixes Safari issue? */
      `,
    };
  });

  return (
    <svg
      ref={state.rootRef}
      css={state.rootCss}
      preserveAspectRatio="xMinYMin"
      viewBox={`${state.viewBox}`}
    >
      <MemoedGrid bounds={state.gridBounds} />
      {children}
    </svg>
  );
}

/** @param {{ bounds: Rect }} props */
function Grid({ bounds }) {
  const gridId = useMemo(() => `grid-${nanoid()}`, []);
  return <>
    <defs>
      <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
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
