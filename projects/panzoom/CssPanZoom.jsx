/**
 * Based on @panzoom/panzoom
 */
import React from 'react';
import classNames from "classnames";
import { css } from "goober";
import { Vect } from "../geom";
import useStateRef from "../hooks/use-state-ref";
import { ensureWire } from '../service/wire';

/**
 * TODO 🚧
 * - support override i.e. transition to specific transform
 */

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useStateRef(() => {
    return {
      root: /** @type {HTMLDivElement} */ ({}),
      parent: /** @type {HTMLDivElement} */ ({}),
      opts: { minScale: 0.05, maxScale: 10, step: 0.025 },
      pointers: /** @type {PointerEvent[]} */ ([]),
      isPanning: false,
      locked: false,
      x: 0,
      y: 0,
      scale: 1,
      origin: /** @type {Vect | undefined} */ (undefined),
      start: {
        clientX: /** @type {number | undefined} */ (0),
        clientY: /** @type {number | undefined} */ (0),
        scale: 1,
        distance: 0,
      },

      evt: {
        /** @param {WheelEvent} e */
        wheel(e) {
          if (state.locked) return;
          state.zoomWithWheel(e);
        },
        /** @param {PointerEvent} e */
        pointerdown(e) {
          if (state.locked) return;
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
            || state.locked
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
          if (state.locked) return;
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
        },
      },

      /** @param {{ clientX: number; clientY: number; }} e */
      getWorld(e) {
        const dims = getDimensions(state.root);
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.root).transform).inverse();
        return matrix.transformPoint({ x: e.clientX - dims.parent.left, y: e.clientY - dims.parent.top });
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
      updateView() {
        state.root.style.transform = `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`;
      },
      /**
       * NOTE could reintroduce opt `animate`
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
        // Originally there was a return value
      },
      /**
       * @param {number} toScale 
       * @param {{ clientX: number; clientY: number }} point 
       */
      zoomToClient(toScale, point) {
        const dims = getDimensions(state.root);
    
        // Instead of thinking of operating on the panzoom element,
        // think of operating on the area inside the panzoom
        // element's parent
        // We assume parent has no padding/margin/border
        const effectiveArea = {
          width: dims.parent.width,
          height: dims.parent.height,
        };
    
        // Adjust the clientX/clientY to ignore the area
        // outside the effective area
        let clientX = point.clientX;
        let clientY = point.clientY;
    
        // Convert the mouse point from it's position over the
        // effective area before the scale to the position
        // over the effective area after the scale.
        const focal = {
          x: (clientX / effectiveArea.width) * (effectiveArea.width * toScale),
          y: (clientY / effectiveArea.height) * (effectiveArea.height * toScale)
        }
    
        return state.zoom(toScale, { focalClient: focal });
      },
      /**
       * @param {number} toScale 
       * @param {Geom.VectJson} point 
       */
      zoomToWorld(toScale, point, lockMs = 0) {
        const { width, height } = state.parent.getBoundingClientRect();
        const center = tempPoint1.copy(point).scale(toScale);
        // (x, y, scale) are s.t. transform is `scale(scale) translate(x, y)`
        state.x = width/2 - center.x;
        state.y = height/2 - center.y;
        state.scale = 1;
        state.zoom(toScale, { focalClient: { x: toScale * (state.x), y: toScale * (state.y) } });

        if (lockMs > 0) {
          state.locked = true;
          state.root.style.transition = `transform ${lockMs}ms ease`;
          setTimeout(() => {
            state.locked = false;
            state.root.style.transition = '';
          }, lockMs);
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
        const delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY
        const wheel = delta < 0 ? 1 : -1
        const toScale = Math.min(Math.max(state.scale * Math.exp((wheel * state.opts.step) / 3), state.opts.minScale), state.opts.maxScale);
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
