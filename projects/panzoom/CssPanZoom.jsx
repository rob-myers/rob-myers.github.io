import classNames from "classnames";
import { css } from "goober";
import { Vect, Rect } from "projects/geom";
import useMuState from "../hooks/use-mu-state";

/**
 * TODO write based on @panzoom/panzoom
 */

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useMuState(() => {

    return {
      root: /** @type {HTMLDivElement} */ ({}),
      opts: { minScale: 0.2, maxScale: 10 },
      renderBounds: new Rect,
      zoom: 1,

      evt: {
        /** @param {WheelEvent} e */
        wheel(e) {
          e.preventDefault();
        },
        /** @param {MouseEvent} e */
        mousemove(e) {
          e.preventDefault();
        },
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef(el) {
        if (el) {
          state.root = el;
          state.root.addEventListener('wheel', state.evt.wheel);
        }
      },
      /**
       * @param {Geom.VectJson} to 
       * @param {number} nextZoom 
       */
      zoomTo(to, nextZoom) {
      }
    };
  });

  return (
    <div
      ref={state.rootRef}
      className={classNames(rootCss, props.className)}
    >
      {props.children}
    </div>
  )
}

const rootCss = css`
  width: 100%;
  height: 100%;
`;

/**
 * @typedef Props @type {object}
 * @property {string} [className]
 */
