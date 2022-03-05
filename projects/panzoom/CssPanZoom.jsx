/**
 * Based on @panzoom/panzoom
 * TODO
 * - add grid
 * - clean
 */
import React from 'react';
import classNames from "classnames";
import { css } from "goober";
import { Vect } from "projects/geom";
import useMuState from "../hooks/use-mu-state";

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useMuState(() => {

    return {
      root: /** @type {HTMLDivElement} */ ({}),
      parent: /** @type {HTMLDivElement} */ ({}),
      opts: { minScale: 0.2, maxScale: 8, step: 0.1 },
      pointers: /** @type {PointerEvent[]} */ ([]),
      isPanning: false,
      x: 0, y: 0, scale: 1,
      origin: /** @type {Vect | undefined} */ (undefined),
      start: { clientX: /** @type {number | undefined} */ (0), clientY: /** @type {number | undefined} */ (0), scale: 1, distance: 0 },

      evt: {
        /** @param {WheelEvent} e */
        wheel(e) {
          state.zoomWithWheel(e);
        },
        /** @param {PointerEvent} e */
        pointerdown(e) {
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
          if (state.origin === undefined || state.start.clientX === undefined || state.start.clientY === undefined) {
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
            state.zoomToPoint(toScale, current);
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
          // Note: don't remove all pointers
          // Can restart without having to reinitiate all of them
          // Remove the pointer regardless of the isPanning state
          removePointer(state.pointers, e)
          if (!state.isPanning) {
            return
          }
          state.isPanning = false
          state.origin = state.start.clientX = state.start.clientY = undefined;
        },
      },
      /**
       * @param {number} toX 
       * @param {number} toY 
       */
      pan(toX, toY) {
        // const result = constrainXY(toX, toY, scale, panOptions)
        // Only try to set if the result is somehow different
        if (state.x !== toX || state.y !== toY) {
          state.x = toX, state.y = toY;
          state.root.style.transform = `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`;
        }
        // Originally there was a return value
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef(el) {
        if (el) {
          state.root = el;
          state.parent = /** @type {*} */ (el.parentElement);
          state.parent.addEventListener('wheel', state.evt.wheel);
          state.parent.addEventListener('pointerdown', state.evt.pointerdown);
          state.parent.addEventListener('pointermove', state.evt.pointermove);
          state.parent.addEventListener('pointerup', state.evt.pointerup);
          state.parent.addEventListener('pointerleave', state.evt.pointerup);
          state.parent.addEventListener('pointercancel', state.evt.pointerup);
        }
      },
      /**
       * TODO could reintroduce opt `animate`
       * @param {number} toScale 
       * @param {{ focal?: Geom.VectJson }} opts 
       */
      zoom(toScale, opts) {
        toScale = Math.min(Math.max(toScale, state.opts.minScale), state.opts.maxScale);
        let toX = state.x, toY = state.y
    
        if (opts.focal) {
          // The difference between the point after the scale and the point before the scale
          // plus the current translation after the scale
          // neutralized to no scale (as the transform scale will apply to the translation)
          const focal = opts.focal
          toX = (focal.x / toScale - focal.x / state.scale + state.x * toScale) / toScale
          toY = (focal.y / toScale - focal.y / state.scale + state.y * toScale) / toScale
        }
        // const panResult = constrainXY(toX, toY, toScale, { relative: false, force: true })
        // state.x = panResult.x, state.y = panResult.y;
        state.x = toX, state.y = toY, state.scale = toScale;
        state.root.style.transform = `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`;
        // Originally there was a return value
      },
      /**
       * @param {number} toScale 
       * @param {{ clientX: number; clientY: number }} point 
       * @returns 
       */
      zoomToPoint(toScale, point) {
        const dims = getDimensions(state.root)
    
        // Instead of thinking of operating on the panzoom element,
        // think of operating on the area inside the panzoom
        // element's parent
        // Subtract padding and border
        const effectiveArea = {
          width:
            dims.parent.width -
            dims.parent.padding.left -
            dims.parent.padding.right -
            dims.parent.border.left -
            dims.parent.border.right,
          height:
            dims.parent.height -
            dims.parent.padding.top -
            dims.parent.padding.bottom -
            dims.parent.border.top -
            dims.parent.border.bottom
        }
    
        // Adjust the clientX/clientY to ignore the area
        // outside the effective area
        let clientX =
          point.clientX -
          dims.parent.left -
          dims.parent.padding.left -
          dims.parent.border.left -
          dims.elem.margin.left
        let clientY =
          point.clientY -
          dims.parent.top -
          dims.parent.padding.top -
          dims.parent.border.top -
          dims.elem.margin.top
    
        // Adjust the clientX/clientY for HTML elements,
        // because they have a transform-origin of 50% 50%
        clientX -= dims.elem.width / state.scale / 2;
        clientY -= dims.elem.height / state.scale / 2;
    
        // Convert the mouse point from it's position over the
        // effective area before the scale to the position
        // over the effective area after the scale.
        const focal = {
          x: (clientX / effectiveArea.width) * (effectiveArea.width * toScale),
          y: (clientY / effectiveArea.height) * (effectiveArea.height * toScale)
        }
    
        return state.zoom(toScale, { focal });
      },
      /**
       * @param {WheelEvent} event 
       */
      zoomWithWheel(event) {
        // Need to prevent the default here
        // or it conflicts with regular page scroll
        event.preventDefault()
        // Normalize to deltaX in case shift modifier is used on Mac
        const delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY
        const wheel = delta < 0 ? 1 : -1
        const toScale = Math.min(Math.max(state.scale * Math.exp((wheel * state.opts.step) / 3), state.opts.minScale), state.opts.maxScale);
        return state.zoomToPoint(toScale, event);
      }
    };
  });

  return (
    <div className={classNames("panzoom-parent", rootCss(props))}>
      <div
        ref={state.rootRef}
        className={classNames("panzoom-root", props.className)}
      >
        {props.children}
        <div className="grid" />
      </div>
    </div>
  )
}

const gridExtent = 2000;

/** @param {Props} props */
const rootCss = (props) => css`
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  /** This is important for mobile to prevent scrolling while panning */
  touch-action: none;
  cursor: auto;

  background-color: ${props.dark ? '#000' : '#fff'};
  
  .panzoom-root {
    width: 100%;
    height: 100%;
    user-select: none;
    touch-action: none;
    transform-origin: 50% 50%;
    
    .grid {
      position: absolute;
      pointer-events: none;
      left: ${-gridExtent}px;
      top: ${-gridExtent}px;
      width: ${2 * gridExtent}px;
      height: ${2 * gridExtent}px;
      background-size: 10px 10px;
      background-image:
        linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);
    }
  }
`;

/**
 * @typedef Props @type {object}
 * @property {string} [className]
 * @property {boolean} [dark]
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
      margin: getBoxStyle(elem, 'margin', style),
      border: getBoxStyle(elem, 'border', style)
    },
    parent: {
      style: parentStyle,
      width: rectParent.width,
      height: rectParent.height,
      top: rectParent.top,
      bottom: rectParent.bottom,
      left: rectParent.left,
      right: rectParent.right,
      padding: getBoxStyle(parent, 'padding', parentStyle),
      border: getBoxStyle(parent, 'border', parentStyle)
    }
  }
}

/**
 * @param {HTMLElement | SVGElement} elem 
 * @param {string} name 
 * @param {CSSStyleDeclaration} [style] 
 * @returns 
 */
function getBoxStyle(elem, name, style = window.getComputedStyle(elem)) {
  // Support: FF 68+
  // Firefox requires specificity for border
  const suffix = name === 'border' ? 'Width' : ''
  return {
    left: getCSSNum(`${name}Left${suffix}`, style),
    right: getCSSNum(`${name}Right${suffix}`, style),
    top: getCSSNum(`${name}Top${suffix}`, style),
    bottom: getCSSNum(`${name}Bottom${suffix}`, style)
  }
}

/**
 * @param {string} name
 * @param {CSSStyleDeclaration} style
 */
function getCSSNum(name, style) {
  // return parseFloat(style[getPrefixedName(name) as any]) || 0
  return parseFloat(style[/** @type {*} */ (name)]) || 0
}
