import * as React from 'react';
import { css } from '@emotion/react';
import { Rect, Vect } from '../geom';
import { getSvgPos, generateId } from '../service';
import useForceRefresh from '../hooks/use-force-refresh';

/** @param {React.PropsWithChildren<{}>} props */
export default function PanZoom(props) {

  const [refresh, state] = useForceRefresh(() => {
    const viewBox = new Rect(0, 0, 500, 500);
    const initViewBox = viewBox.clone();
    return {
      panFrom: /** @type {null|Vect} */ (null),
      zoom: 1,
      viewBox,
      initViewBox,
      gridBounds: new Rect(-5000, -5000, 10000 + 1, 10000 + 1),
      /** @param {WheelEvent} e */
      onWheel: e => {
        e.preventDefault();
        const zoom = Math.min(Math.max(state.zoom - 0.003 * e.deltaY, 0.4), 2);
        const { x: rx, y: ry } = getSvgPos(e);
        viewBox.x = (state.zoom / zoom) * (viewBox.x - rx) + rx;
        viewBox.y = (state.zoom / zoom) * (viewBox.y - ry) + ry;
        viewBox.width = (1 / zoom) * initViewBox.width;
        viewBox.height = (1 / zoom) * initViewBox.height;
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
      {props.children}
    </svg>
  );
}

/** @param {{ bounds: Rect }} props */
function Grid(props) {
  const gridId = React.useMemo(() => generateId('grid-'), []);
  return <>
    <defs>
      <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="0.3"/>
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

const MemoedGrid = React.memo(Grid);
