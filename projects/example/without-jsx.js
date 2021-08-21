import * as React from 'react';
import { css } from 'goober';
import { Vect, Rect } from '../geom';
import { getSvgPos, generateId } from '../service';
import useForceRefresh from '../hooks/use-force-refresh';

/** @param {React.PropsWithChildren<Props>} props */
export default function PanZoom(props) {

  const [refresh, state] = useForceRefresh(() => {
    const viewBox = props.initViewBox.clone();
    const minZoom = props.minZoom || 0.5;
    const maxZoom = props.maxZoom || 2;
    return {
      panFrom: /** @type {null | Vect} */ (null),
      zoom: props.initZoom || 1,
      viewBox,
      initViewBox: props.initViewBox,
      gridBounds: props.gridBounds,

      /** @param {WheelEvent} e */
      onWheel: e => {
        e.preventDefault();
        const zoom = Math.min(Math.max(state.zoom - 0.003 * e.deltaY, minZoom), maxZoom);
        const {
          x: rx,
          y: ry
        } = getSvgPos(e);
        viewBox.x = state.zoom / zoom * (viewBox.x - rx) + rx;
        viewBox.y = state.zoom / zoom * (viewBox.y - ry) + ry;
        viewBox.width = 1 / zoom * props.initViewBox.width;
        viewBox.height = 1 / zoom * props.initViewBox.height;
        state.zoom = zoom;
        refresh();
      },

      /** @param {PointerEvent} e */
      onPointerDown: e => state.panFrom = new Vect(0, 0).copy(getSvgPos(e)),

      /** @param {PointerEvent} e */
      onPointerMove: e => {
        if (state.panFrom) {
          const mouse = getSvgPos(e);
          viewBox.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);
          refresh();
        }
      },
      onPointerUp: () => state.panFrom = null,

      /** @type {(el: null | SVGSVGElement) => void} */
      rootRef: el => {
        if (el) {
          el.addEventListener('wheel', state.onWheel);
          el.addEventListener('pointerdown', state.onPointerDown, {
            passive: true
          });
          el.addEventListener('pointermove', state.onPointerMove, {
            passive: true
          });
          el.addEventListener('pointerup', state.onPointerUp, {
            passive: true
          });
          el.addEventListener('pointerleave', state.onPointerUp, {
            passive: true
          });
          el.addEventListener('touchstart', e => e.preventDefault());
        }
      },
      rootCss: css`
        width: 100%;
        height: 100%;
        background: #fff;
        touch-action: pan-x pan-y pinch-zoom;
      `
    };
  });

  return React.createElement(
    "svg",
    {
      ref: state.rootRef,
      className: state.rootCss,
      preserveAspectRatio: "xMinYMin",
      viewBox: `${state.viewBox}`
    },
    React.createElement(
      MemoedGrid,
      {
        bounds: state.gridBounds
      },
    ),
    props.children,
  );
}

/**
 * @typedef Props @type {object}
 * @property {Rect} initViewBox Initial viewbox in world coords
 * @property {Rect} gridBounds World bounds
 * @property {number=} minZoom Minimum zoom factor (default 0.5)
 * @property {number=} maxZoom Maximum zoom factor (default 2)
 * @property {number=} initZoom Initial zoom factor (default 1)
 */

/** @param {{ bounds: Rect }} props */
function Grid(props) {
  const gridId = React.useMemo(() => generateId('grid-'), []);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "defs",
      null,
      React.createElement(
        "pattern",
        {
          id: gridId,
          width: "10",
          height: "10",
          patternUnits: "userSpaceOnUse"
        },
        React.createElement(
          "path",
          {
            d: "M 10 0 L 0 0 0 10",
            fill: "none",
            stroke: "rgba(0,0,0,0.5)",
            strokeWidth: "0.3"
          },
        ),
      ),
    ),
    React.createElement(
      "rect",
      {
        x: props.bounds.x,
        y: props.bounds.y,
        width: props.bounds.width,
        height: props.bounds.height,
        fill: `url(#${gridId})`
      },
    ),
  );
}

const MemoedGrid = React.memo(Grid);