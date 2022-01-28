import React from 'react';
import { css } from 'goober';
import useMeasure from 'react-use-measure';
import { Rect, Vect } from '../geom';
import useUpdate from '../hooks/use-update';
import { getSvgMid, getSvgPos, isSvgEvent, projectSvgEvt } from '../service/dom';

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const [measureRef, bounds] = useMeasure({ debounce: 30, scroll: false });
  const update = useUpdate();

  const [state] = React.useState(() => {
    /** @type {Context} */
    const initialCtxt = {
      renderBounds: new Rect,
      zoom: 1,
    };

    return {
      root: /** @type {SVGSVGElement} */ ({}),
      ctxt: initialCtxt,
      gridId: `grid-${gridIdCount++}`,
      /** @type {null | Geom.Vect} */
      panFrom: null,
      /** @type {import('../service/dom').SvgPtr[]} */
      ptrs: [],
      /** @type {null | number} */
      ptrDiff: null,
      prevMouse: new Vect,
      
      Context: React.createContext(initialCtxt),
      /** @param {PointerEvent} e */
      onPointerDown: e => {
        if (isSvgEvent(e) && state.ptrs.length < 2) {
          state.panFrom = (new Vect).copy(getSvgPos(projectSvgEvt(e)));
          state.ptrs.push(projectSvgEvt(e));
          state.prevMouse.copy(state.panFrom);
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
            state.updateCtxt();
            // props.onUpdate?.(state.root);
          }          
          state.ptrDiff = ptrDiff;
        } else if (state.panFrom) {
          const mouse = getSvgPos(projectSvgEvt(e));
          const ratio = 1 / state.ctxt.zoom;
          state.ctxt.renderBounds.delta(
            ratio * (state.prevMouse.x - mouse.x),
            ratio * (state.prevMouse.y - mouse.y),
          );
          state.updateCtxt();
          // props.onUpdate?.(state.root);
          state.prevMouse.copy(mouse);
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
      /** @type {(e: WheelEvent) => void} */
      onWheel(e) {
        e.preventDefault();
        if (isSvgEvent(e)) {
          const point = getSvgPos(projectSvgEvt(e));
          const nextZoom = state.ctxt.zoom - wheelDelta * e.deltaY;
          if (Math.abs(e.deltaY) > 0.1 && nextZoom >= 0.25 && nextZoom <= 8) { 
            state.zoomTo(point, nextZoom);
            state.updateCtxt({ zoom: nextZoom });
          }
        }
      },
      /** @type {React.RefCallback<SVGSVGElement>} */
      rootRef(el) {
        measureRef(el);
        if (el) {
          state.root = el;
          el.addEventListener('wheel', state.onWheel);
          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });
          el.addEventListener('pointermove', state.onPointerMove, { passive: true });
          el.addEventListener('pointerup', state.onPointerUp, { passive: true });
        }
      },
      /** @param {Partial<Context>} [partial] */
      updateCtxt(partial) {
        state.ctxt = { ...state.ctxt, ...partial };
        update();
      },
      /**
       * Zoom, preserving world position of mouse.
       * @param {Geom.VectJson} point 
       * @param {number} nextZoom
       */
      zoomTo(point, nextZoom) {
        const { x: svgPosX, y: svgPosY } = point;
        state.ctxt.renderBounds.x += svgPosX * (1 / state.ctxt.zoom - 1 / nextZoom);
        state.ctxt.renderBounds.y += svgPosY * (1 / state.ctxt.zoom - 1 / nextZoom);
      },
    };
  });

  React.useEffect(() => {
    const { width, height } = state.root.getBoundingClientRect();
    state.ctxt.renderBounds.width = width;
    state.ctxt.renderBounds.height = height;
    state.updateCtxt();
  }, [bounds.width, bounds.height]);


  const scale = state.ctxt.zoom;
  // Compute grid pattern offset
  const min = state.ctxt.renderBounds;
  const dx = -(min.x > 0 ? min.x % 10 : (min.x % 10) + 10);
  const dy = -(min.y > 0 ? min.y % 10 : (min.y % 10) + 10);

  return (
    <svg
      ref={state.rootRef}
      className={rootCss}
      preserveAspectRatio="xMinYMin slice"
    >
      <defs>
        <pattern // Grid pattern
          id={state.gridId}
          x={dx}
          y={dy}
          width={gridDim * 2}
          height={gridDim * 2}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridDim * 2} 0 L 0 0 0 ${gridDim * 2}`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.9)"
            strokeWidth="0.2"
          />
        </pattern>
      </defs>

      <g transform={`scale(${scale})`}>
        <rect
          className="grid"
          width={`${100 / scale}%`}
          height={`${100 / scale}%`}
          fill={`url(#${state.gridId})`}
        />
        <g transform={`translate(${-min.x}, ${-min.y})`}>
          <state.Context.Provider value={state.ctxt}>
            {props.children}
          </state.Context.Provider>
        </g>
      </g>
    </svg>
  ); 
}

const rootCss = css`
  width: 100%;
  height: 100%;
  background: white;

  rect.grid {
    pointer-events: none;
  }
`

/**
 * @typedef Props @type {object}
 */

/**
 * @typedef Context @type {object}
 * @property {Geom.Rect} renderBounds
 * @property {number} zoom
 */

const wheelDelta = 0.003;
const gridDim = 5;
let gridIdCount = 0;
