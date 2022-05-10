/**
 * Based on @panzoom/panzoom
 */
import React from 'react';
import classNames from "classnames";
import { css } from "goober";
import { Mat, Vect } from "../geom";
import { ensureWire } from '../service/wire';
import useStateRef from "../hooks/use-state-ref";

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useStateRef(() => {
    return {
      root: /** @type {HTMLDivElement} */ ({}),
      parent: /** @type {HTMLDivElement} */ ({}),
      opts: { minScale: 0.05, maxScale: 10, step: 0.05 },
      pointers: /** @type {PointerEvent[]} */ ([]),
      isPanning: false,
      x: 0,
      y: 0,
      scale: 1,
      origin: /** @type {Vect | undefined} */ (undefined),
      start: {
        clientX: /** @type {number | undefined} */ (undefined),
        clientY: /** @type {number | undefined} */ (undefined),
        scale: 1,
        distance: 0,
      },
      transitionTimeoutId: 0,

      evt: {
        /** @param {WheelEvent} e */
        wheel(e) {
          state.clearTransition();
          state.zoomWithWheel(e);
        },
        /** @param {PointerEvent} e */
        pointerdown(e) {
          state.clearTransition();
          // e.preventDefault();
          ensurePointer(state.pointers, e);
          state.isPanning = true;
          state.origin = new Vect(state.x, state.y);
          // This works whether there are multiple pointers or not
          const point = getMiddle(state.pointers)
          state.start = {
            clientX: point.clientX,
            clientY: point.clientY,
            scale: state.scale,
            distance: getDistance(state.pointers),
          };
        },
        /** @param {PointerEvent} e */
        pointermove(e) {
          // e.preventDefault();
          if (
            state.origin === undefined
            || state.start.clientX === undefined
            || state.start.clientY === undefined
          ) {
            return
          }
          ensurePointer(state.pointers, e);
          const current = getMiddle(state.pointers);
          if (state.pointers.length > 1) {
            // A startDistance of 0 means there weren't 2 pointers handled on start
            if (state.start.distance === 0) {
              state.start.distance = getDistance(state.pointers);
            }
            // Use the distance between the first 2 pointers
            // to determine the current scale
            const diff = getDistance(state.pointers) - state.start.distance
            const step = 3 * state.opts.step;
            const toScale = Math.min(Math.max(((diff * step) / 80 + state.start.scale), state.opts.minScale), state.opts.maxScale);
            state.zoomToClient(toScale, current);
          } else {
            // Panning during pinch zoom can cause issues
            // because the zoom has not always rendered in time
            // for accurate calculations
            // See https://github.com/timmywil/panzoom/issues/512
            state.pan(
              state.origin.x + (current.clientX - state.start.clientX) / state.scale,
              state.origin.y + (current.clientY - state.start.clientY) / state.scale,
            );
          }
        },
        /** @param {PointerEvent} e */
        pointerup(e) {
          // e.preventDefault();
          /**
           * NOTE: don't remove all pointers.
           * Can restart without having to reinitiate all of them.
           * Remove the pointer regardless of the isPanning state.
           */
          removePointer(state.pointers, e);
          if (!state.isPanning) {
            return;
          }
          if (props.wireKey) {
            state.sendPointOnWire(props.wireKey, e);
          }
          state.isPanning = false;
          state.origin = state.start.clientX = state.start.clientY = undefined;
          state.clearTransition();
        },
      },

      /** @param {{ clientX: number; clientY: number; }} e */
      getWorld(e) {
        const dims = getDimensions(state.root);
        // TODO we control `transform` so can do this more efficiently
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.root).transform).inverse();
        return matrix.transformPoint({ x: e.clientX - dims.parent.left, y: e.clientY - dims.parent.top });
      },
      getWorldAtCenter() {
        const dims = getDimensions(state.root);
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.root).transform).inverse();
        return matrix.transformPoint({ x: dims.parent.width/2, y: dims.parent.height/2 });
      },
      /**
       * @param {number} toX 
       * @param {number} toY 
       */
      pan(toX, toY) {
        // const result = constrainXY(toX, toY, scale, panOptions)
        // Only try to set if the result is somehow different
        if (state.x !== toX || state.y !== toY) {
          state.x = toX;
          state.y = toY;
          state.updateView();
        }
        // Originally there was a return value
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef(el) {
        if (el) {
          state.root = el;
          state.parent = /** @type {*} */ (el.parentElement);
          state.parent.addEventListener('wheel', e => state.evt.wheel(e));
          state.parent.addEventListener('pointerdown', e => state.evt.pointerdown(e));
          state.parent.addEventListener('pointermove', e => state.evt.pointermove(e));
          state.parent.addEventListener('pointerup', e => state.evt.pointerup(e));
          state.parent.addEventListener('pointerleave', e => state.evt.pointerup(e));
          state.parent.addEventListener('pointercancel', e => state.evt.pointerup(e));
        }
      },
      /**
       * Send world position of mouse/touch event
       * @param {string} wireKey 
       * @param {{ clientX: number; clientY: number; }} e 
       */
      sendPointOnWire(wireKey, e) {
        const wire = ensureWire(wireKey);
        const point = state.getWorld(e);
        wire.next({ key: 'pointerup', point: { x: point.x, y: point.y }});
      },
      clearTransition() {
        if (state.transitionTimeoutId !== 0) {
          window.clearTimeout(state.transitionTimeoutId);
          state.transitionTimeoutId = 0;
          // We assume computed `state.root.transform` has form
          // `matrix(scale, 0, scale, k, x, y)`
          [this.scale, , , , this.x, this.y] = window.getComputedStyle(state.root)
            .transform.slice('matrix('.length, -')'.length).split(',').map(Number);
          state.root.style.transition = `transform 100ms linear`;
          window.setTimeout(() => state.transitionTimeoutId === 0
            && (state.root.style.transition = '')
          , 500);
        }
      },
      updateView() {
        state.root.style.transform = `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`;
      },
      /**
       * @param {number} toScale 
       * @param {{ focalClient?: Geom.VectJson }} opts 
       */
      zoom(toScale, opts) {
        toScale = Math.min(Math.max(toScale, state.opts.minScale), state.opts.maxScale);
        let toX = state.x, toY = state.y
    
        if (opts.focalClient) {
          // The difference between the point after the scale and the point before the scale
          // plus the current translation after the scale
          // neutralized to no scale (as the transform scale will apply to the translation)
          const focal = opts.focalClient
          toX = (focal.x / toScale - focal.x / state.scale + state.x * toScale) / toScale
          toY = (focal.y / toScale - focal.y / state.scale + state.y * toScale) / toScale
        }
        state.x = toX;
        state.y = toY;
        state.scale = toScale;
        state.updateView();
      },
      /**
       * @param {number} toScale 
       * @param {{ clientX: number; clientY: number }} point 
       */
      zoomToClient(toScale, point) {
        // Adjust the clientX/clientY to ignore the area outside the effective area
        const { left, top } = state.parent.getBoundingClientRect();
        let clientX = point.clientX - left;
        let clientY = point.clientY - top;
    
        // Convert the mouse point from it's position over the
        // effective area before the scale to the position
        // over the effective area after the scale.
        return state.zoom(toScale, { focalClient: { x: clientX * toScale, y: clientY * toScale } });
      },
      /**
       * @param {number} [toScale] 
       * @param {Geom.VectJson} [worldPoint] 
       */
      zoomToWorld(toScale, worldPoint, transitionMs = 0) {
        toScale = toScale || state.scale;

        // TODO if no point get world point at center
        const center = worldPoint
          ? tempPoint1.copy(worldPoint).scale(toScale)
          : tempPoint1.copy(state.getWorldAtCenter()).scale(toScale);
        
        // (x, y, scale) are s.t. transform is `scale(scale) translate(x, y)`
        const { width, height } = state.parent.getBoundingClientRect();
        state.x = width/2 - center.x;
        state.y = height/2 - center.y;
        state.scale = 1;
        state.zoom(toScale, { focalClient: { x: toScale * (state.x), y: toScale * (state.y) } });

        state.clearTransition();
        if (transitionMs > 0) {
          state.root.style.transition = `transform ${transitionMs}ms ease`;
          state.transitionTimeoutId = window.setTimeout(() => state.clearTransition(), transitionMs);
        }
      },
      /**
       * @param {WheelEvent} event 
       */
      zoomWithWheel(event) {
        // Need to prevent the default here
        // or it conflicts with regular page scroll
        event.preventDefault();
        // Normalize to deltaX in case shift modifier is used on Mac
        const delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY;
        const wheel = delta < 0 ? 1 : -1;
        const toScale = Math.min(Math.max(state.scale * Math.exp((wheel * state.opts.step * 0.25) / 3), state.opts.minScale), state.opts.maxScale);
        return state.zoomToClient(toScale, event);
      }
    };
  }, { deeper: ['evt'] });

  React.useEffect(() => {
    props.onLoad?.(state);
    // Apply initial zoom and centering.
    state.zoomToWorld(props.initZoom || 1, props.initCenter || { x: 0, y: 0 });
  }, []);

  return (
    <div className={classNames("panzoom-parent", rootCss, backgroundCss(props))}>
      <div
        ref={state.rootRef}
        className={classNames("panzoom-root", props.className)}
      >
        <div className="origin" />
        <div className="small-grid" />
        {props.children}
        <div className="large-grid" />
      </div>
    </div>
  )
}

/** Must divide 60 */
const gridExtent = 60 * 60;

const rootCss = css`
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  /** This is important for mobile to prevent scrolling while panning */
  touch-action: none;
  cursor: auto;
  
  .panzoom-root {
    width: 100%;
    height: 100%;
    user-select: none;
    touch-action: none;
    /** @panzoom/panzoom uses 50% 50% instead */
    transform-origin: 0 0;
    /* transition: transform 1s ease; */
    
    .small-grid, .large-grid {
      position: absolute;
      pointer-events: none;
      left: ${-gridExtent}px;
      top: ${-gridExtent}px;
      width: ${2 * gridExtent}px;
      height: ${2 * gridExtent}px;
    }
    .small-grid {
      background-image:
        linear-gradient(to right, rgba(200, 200, 200, 0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);
        background-size: 10px 10px;
      }
      .large-grid {
      background-image:
        linear-gradient(to right, rgba(200, 200, 200, 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 200, 200, 0.35) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .origin {
      position: absolute;
    }
  }
`;

/** @param {Props} props */
const backgroundCss = (props) => css`
  background-color: ${props.dark ? '#000' : '#fff'};
`;

/**
 * @typedef Props @type {object}
 * @property {string} [className]
 * @property {boolean} [dark]
 * @property {string} [wireKey] Global identifier e.g. so shells can receive clicks.
 * @property {number} [initZoom] e.g. `1`
 * @property {Geom.VectJson} [initCenter]
 * @property {(api: PanZoom.CssExtApi) => void} [onLoad]
 */

/**
 * 
 * @param {PointerEvent[]} pointers 
 * @param {PointerEvent} event 
 * @returns 
 */
function ensurePointer(pointers, event) {
  let i
  // Add touches if applicable -- why?
  if (/** @type{*} */ (event).touches) {
    i = 0
    for (const touch of /** @type{*} */ (event).touches) {
      touch.pointerId = i++
      ensurePointer(pointers, touch)
    }
    return;
  }
  i = pointers.findIndex(other => other.pointerId === event.pointerId);
  if (i > -1) pointers.splice(i, 1)
  pointers.push(event);
}

/**
 * 
 * @param {PointerEvent[]} pointers 
 * @returns 
 */
function getMiddle(pointers) {
  // Copy to avoid changing by reference
  pointers = pointers.slice(0)
  let event1 = /** @type {Pick<PointerEvent, 'clientX' | 'clientY'>} */ (pointers.pop())
  let event2;
  while ((event2 = pointers.pop())) {
    event1 = {
      clientX: (event2.clientX - event1.clientX) / 2 + event1.clientX,
      clientY: (event2.clientY - event1.clientY) / 2 + event1.clientY
    }
  }
  return event1
}

/**
 * @param {PointerEvent[]} pointers 
 */
function getDistance(pointers) {
  if (pointers.length < 2) {
    return 0
  }
  const event1 = pointers[0]
  const event2 = pointers[1]
  return Math.sqrt(
    Math.pow(Math.abs(event2.clientX - event1.clientX), 2) +
      Math.pow(Math.abs(event2.clientY - event1.clientY), 2)
  )
}

/**
 * 
 * @param {PointerEvent[]} pointers 
 * @param {PointerEvent} event 
 */
function removePointer(pointers, event) {
  // Add touches if applicable
  if (/** @type {*} */  (event).touches) {
    // Remove all touches
    while (pointers.length) {
      pointers.pop()
    }
    return
  }
  const i = pointers.findIndex(other => other.pointerId === event.pointerId);
  if (i > -1) {
    pointers.splice(i, 1)
  }
}

/**
 * Dimensions used in containment and focal point zooming
 * We assume `parent` has no padding/margin/border
 * @param {HTMLElement} elem
 */
 function getDimensions(elem) {
  const parent = /** @type {HTMLElement} */ (elem.parentNode);
  const style = window.getComputedStyle(elem)
  const parentStyle = window.getComputedStyle(parent)
  const rectElem = elem.getBoundingClientRect()
  const rectParent = parent.getBoundingClientRect()

  return {
    elem: {
      style,
      width: rectElem.width,
      height: rectElem.height,
      top: rectElem.top,
      bottom: rectElem.bottom,
      left: rectElem.left,
      right: rectElem.right,
    },
    parent: {
      style: parentStyle,
      width: rectParent.width,
      height: rectParent.height,
      top: rectParent.top,
      bottom: rectParent.bottom,
      left: rectParent.left,
      right: rectParent.right,
    }
  }
}

const tempPoint1 = new Vect;
