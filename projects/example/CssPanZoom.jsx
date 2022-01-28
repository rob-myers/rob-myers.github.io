import React from 'react';
import { css } from 'goober';
import useMeasure from 'react-use-measure';
import { Rect } from '../geom';
import useUpdate from '../hooks/use-update';

/** @param {Props} props */
export default function CssPanZoom(props) {

  const [measureRef, bounds] = useMeasure({ debounce: 30, scroll: false });
  const update = useUpdate();

  const [state] = React.useState(() => {
    /** @type {Context} */
    const ctxt = {
      renderBounds: new Rect,
    };

    return {
      root: /** @type {SVGSVGElement} */ ({}),
      ctxt,
      Context: React.createContext(ctxt),

      /** @type {React.RefCallback<SVGSVGElement>} */
      rootRef(el) {
        measureRef(el);
        el && (state.root = el);
      },
      /** @param {Partial<Context>} partial */
      updateCtxt: () => {
        state.ctxt = { ...state.ctxt };
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

  return (
    <svg
      ref={state.rootRef}
      className={rootCss}
      preserveAspectRatio="xMinYMin slice"
    >
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
 * @property {{ width?: number; height?: number }} size
 */

/**
 * @typedef Context @type {object}
 * @property {Geom.Rect} renderBounds
 */
