import React, { useMemo } from 'react';
import { css } from '@emotion/react'
import { nanoid } from 'nanoid';
import useForceRefresh from '../hooks/use-force-refresh';
import { getSvgPos } from '../service/dom';
import { Rect, Vect } from '../geom';

/** @param {React.PropsWithChildren<{}>} props */
export default function PanZoom({ children }) {

  const [refresh, state] = useForceRefresh(() => {
    const viewBox = new Rect(0, 0, 200, 200);
    const initViewBox = viewBox.clone();
    return {
      panFrom: /** @type {null|Vect} */ (null),
      zoom: 1,
      viewBox,
      initViewBox,
      gridBounds: new Rect(-1000, -1000, 2000 + 1, 2000 + 1),
      /** @param {WheelEvent} e */
      onWheel: e => {
        e.preventDefault();
        const zoom = Math.min(Math.max(state.zoom + 0.003 * e.deltaY, 0.2), 2);
        const { x: rx, y: ry } = getSvgPos(e);
        viewBox.x = (zoom / state.zoom) * (viewBox.x - rx) + rx;
        viewBox.y = (zoom / state.zoom) * (viewBox.y - ry) + ry;
        viewBox.width = zoom * initViewBox.width;
        viewBox.height = zoom * initViewBox.height;
        state.zoom = zoom;
        refresh();
      },
      /** @param {PointerEvent} e */
      onPointerDown: e => state.panFrom = (new Vect(0, 0)).copy(getSvgPos(e)),
      /** @param {PointerEvent} e */
      onPointerMove: e => {
        if (state.panFrom) {
          const mouse = getSvgPos(e);
          viewBox.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);
          refresh();
        }
      },
      onPointerUp: () => state.panFrom = null,
      /** @type {React.LegacyRef<SVGSVGElement>} */
      rootRef: el => {
        if (el) {
          el.addEventListener('wheel', state.onWheel);
          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });
          el.addEventListener('pointermove', state.onPointerMove, { passive: true });
          el.addEventListener('pointerup', state.onPointerUp, { passive: true });
          el.addEventListener('pointerleave', state.onPointerUp, { passive: true });
          el.addEventListener('touchstart', e => e.preventDefault());
        }
      },
      rootCss: css`
        width: 100%;
        height: 100%;
        background: #fff;
        position: absolute; /** Fixes Safari issue? */
        touch-action: pan-x pan-y pinch-zoom;
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
