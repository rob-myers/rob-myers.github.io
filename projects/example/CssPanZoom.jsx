import React from 'react';
import { css } from 'goober';
import useMeasure from 'react-use-measure';
import { Rect } from '../geom';
import useUpdate from '../hooks/use-update';
import { getRelativePos } from '../service/dom';

/** @param {Props} props */
export default function CssPanZoom(props) {

  const [measureRef, bounds] = useMeasure({ debounce: 30, scroll: false });
  const update = useUpdate();

  const [state] = React.useState(() => {
    /** @type {Context} */
    const ctxt = {
      renderBounds: new Rect,
      zoomFactor: 100,
    };

    return {
      root: /** @type {SVGSVGElement} */ ({}),
      ctxt,
      gridId: `grid-${gridIdCount++}`,
      Context: React.createContext(ctxt),

      /** @type {(e: WheelEvent) => void} */
      onWheel(e) {
        e.preventDefault();
        const ctxt = state.ctxt;
        if (e.ctrlKey) {// Zoom
          const nextZoom = ctxt.zoomFactor - 0.5 * e.deltaY;
          if (Math.abs(e.deltaY) > 0.1 && nextZoom >= 25 && nextZoom <= 800) {
            // Preserve world position of mouse
            const { x: svgPosX, y: svgPosY } = getRelativePos(e)
            ctxt.renderBounds.x += svgPosX * 100 * (1 / ctxt.zoomFactor - 1 / nextZoom);
            ctxt.renderBounds.y += svgPosY * 100 * (1 / ctxt.zoomFactor - 1 / nextZoom);
            state.updateCtxt({ zoomFactor: nextZoom });
          }
        } else {// Pan
          // Fresh render bounds triggers update
          const nextBounds = ctxt.renderBounds.clone()
            .delta(0.5 * e.deltaX, 0.5 * e.deltaY);
          state.updateCtxt({ renderBounds: nextBounds });
        }
      },
      /** @type {React.RefCallback<SVGSVGElement>} */
      rootRef(el) {
        measureRef(el);
        if (el) {
          state.root = el;
          el.addEventListener('wheel', state.onWheel);
        }
      },
      /** @param {Partial<Context>} [partial] */
      updateCtxt(partial) {
        state.ctxt = { ...state.ctxt, ...partial };
        update();
      },
    };
  });

  React.useEffect(() => {
    const { width, height } = state.root.getBoundingClientRect();
    state.ctxt.renderBounds.width = width;
    state.ctxt.renderBounds.height = height;
    state.updateCtxt();
  }, [bounds.width, bounds.height]);


  const scale = state.ctxt.zoomFactor / 100;
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
        <pattern // Grid pattern.
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
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.2"
          />
        </pattern>
      </defs>

      <g transform={`scale(${scale})`}>

        <rect // The grid
          width={`${100 / scale}%`}
          height={`${100 / scale}%`}
          fill={`url(#${state.gridId})`}
        />

      </g>

      <state.Context.Provider value={state.ctxt}>

      </state.Context.Provider>
    </svg>
  ); 
}

const rootCss = css`
  width: 100%;
  height: 100%;
  background: #888;
`

/**
 * @typedef Props @type {object}
 */

/**
 * @typedef Context @type {object}
 * @property {Geom.Rect} renderBounds
 * @property {number} zoomFactor
 */

const gridDim = 5;
let gridIdCount = 0;
