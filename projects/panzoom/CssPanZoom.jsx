/**
 * Based on @panzoom/panzoom with substantial changes
 */
import React from 'react';
import classNames from "classnames";
import { css } from "goober";
import { Vect } from "../geom";
import { ensureWire } from '../service/wire';
import useStateRef from "../hooks/use-state-ref";

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useStateRef(() => {
    return {
      parent: /** @type {HTMLDivElement} */ ({}),
      translateRoot: /** @type {HTMLDivElement} */ ({}),
      scaleRoot: /** @type {HTMLDivElement} */ ({}),
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
      noTransitionTimeout: 0,

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
        const parentBounds = state.parent.getBoundingClientRect();
        const screenX = e.clientX - parentBounds.left;
        const screenY = e.clientY - parentBounds.top;
        // Compute world position given `translate(x, y) scale(scale)`
        const worldX = (screenX - state.x) / state.scale;
        const worldY = (screenY - state.y) / state.scale;
        return { x: worldX, y: worldY };
      },
      getWorldAtCenter() {
        const parentBounds = state.parent.getBoundingClientRect();
        const worldX = (parentBounds.width/2 - state.x) / state.scale;
        const worldY = (parentBounds.height/2 - state.y) / state.scale;
        return { x: worldX, y: worldY };
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
          state.parent = /** @type {*} */ (el.parentElement);
          state.translateRoot = el;
          state.scaleRoot = /** @type {*} */ (el.children[0]);
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
        if (state.transitionTimeoutId) {
          // Keep small transition for smoothness.
          // It will be totally removed via state.noTransitionTimeout
          state.translateRoot.style.transition = state.scaleRoot.style.transition = 'transform 100ms linear';
          window.clearTimeout(state.transitionTimeoutId);
          state.transitionTimeoutId = 0;
          // Set target transform as current
          [, , , , state.x, state.y] = window.getComputedStyle(state.translateRoot).transform.slice('matrix('.length, -')'.length).split(',').map(Number);
          [state.scale] = window.getComputedStyle(state.scaleRoot).transform.slice('matrix('.length, -')'.length).split(',').map(Number);
          state.updateView();
        }
      },
      updateView() {
        state.translateRoot.style.transform = `translate(${state.x}px, ${state.y}px)`;
        state.scaleRoot.style.transform = `scale(${state.scale})`;
      },
      /**
       * @param {number} toScale 
       * @param {{ clientX: number; clientY: number }} e 
       */
      zoomToClient(toScale, e) {
        const parentBounds = state.parent.getBoundingClientRect();
        const screenX = e.clientX - parentBounds.left;
        const screenY = e.clientY - parentBounds.top;
        // Compute world position given `translate(x, y) scale(scale)`
        const worldX = (screenX - state.x) / state.scale;
        const worldY = (screenY - state.y) / state.scale;
        // To maintain position, need state.x' s.t.
        // worldX' := (screenX - state.x') / toScale = worldPoint.x
        state.x = screenX - (worldX * toScale);
        state.y = screenY - (worldY * toScale);
        state.scale = toScale;
        state.updateView();
      },
      /**
       * @param {number} [toScale] 
       * @param {Geom.VectJson} [worldPoint] 
       */
      zoomToWorld(toScale, worldPoint, transitionMs = 0) {
        toScale = toScale || state.scale;
        state.clearTransition();
        // Can totally remove transition once no transition in progress
        window.clearTimeout(state.noTransitionTimeout);
        state.noTransitionTimeout = window.setTimeout(() => state.translateRoot.style.transition = state.scaleRoot.style.transition = '', transitionMs);

        if (worldPoint) {
          const { width: w, height: h } = state.parent.getBoundingClientRect();
          state.x = w/2 - (state.scale * worldPoint.x);
          state.y = h/2 - (state.scale * worldPoint.y);
          state.translateRoot.style.transition = `transform ${transitionMs}ms ease`;
          state.transitionTimeoutId = window.setTimeout(() => state.clearTransition(), transitionMs);
          state.translateRoot.style.transform = `translate(${state.x}px, ${state.y}px)`;
        }
        
        if (toScale !== state.scale) {
          state.translateRoot.style.transition = `transform ${transitionMs}ms ease`;
          state.scaleRoot.style.transition = `transform ${transitionMs}ms ease`;
          // Compute screen position of world point
          worldPoint = worldPoint || state.getWorldAtCenter();
          const screenX = (worldPoint.x * state.scale) + state.x;
          const screenY = (worldPoint.y * state.scale) + state.y;
          // Compute new translations as done in `state.zoomToClient`
          state.x = screenX - (worldPoint.x * toScale);
          state.y = screenY - (worldPoint.y * toScale);
          state.translateRoot.style.transform = `translate(${state.x}px, ${state.y}px)`;
          state.scaleRoot.style.transform = `scale(${toScale})`;
          state.transitionTimeoutId = window.setTimeout(() => state.clearTransition(), transitionMs);
        }
        
      },
      /**
       * @param {WheelEvent} event 
       */
      zoomWithWheel(event) {
        // Avoid conflict with regular page scroll
        event.preventDefault();
        // Normalize to deltaX in case shift modifier is used on Mac
        const delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY;
        const wheel = delta < 0 ? 1 : -1;
        // Wheel has extra 0.5 scale factor (unlike pinch)
        const toScale = Math.min(Math.max(state.scale * Math.exp((wheel * state.opts.step * 0.5) / 3), state.opts.minScale), state.opts.maxScale);
        return state.zoomToClient(toScale, event);
      }
    };
  }, { deeper: ['evt'] });

  React.useEffect(() => {
    props.onLoad?.(state);
    state.updateView();
    // Apply initial zoom and centering.
    state.zoomToWorld(props.initZoom || 1, props.initCenter || { x: 0, y: 0 }, 2000);
  }, []);

  return (
    <div className={classNames("panzoom-parent", rootCss, backgroundCss(props))}>
      <div
        ref={state.rootRef}
        className={classNames("panzoom-translate", props.className)}
      >
        <div className="panzoom-scale">
          <div className="origin" />
          <div className="small-grid" />
          {props.children}
          <div className="large-grid" />
        </div>
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
  
  .panzoom-translate {
    width: 100%;
    height: 100%;
    user-select: none;
    touch-action: none;
    transform-origin: 0 0;
    
    .panzoom-scale {
      width: 100%;
      height: 100%;
      transform-origin: 0 0;
    }

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
