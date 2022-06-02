/**
 * Based on @panzoom/panzoom with substantial changes
 */
import React from 'react';
import classNames from "classnames";
import { css } from "goober";
import { Subject } from 'rxjs';
import useMeasure from 'react-use-measure';
import { Vect } from "../geom";
import useStateRef from "../hooks/use-state-ref";

/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {

  const state = useStateRef(() => {
    /** @type {PanZoom.CssApi} */
    const output = {
      parent: /** @type {HTMLDivElement} */ ({}),
      translateRoot: /** @type {HTMLDivElement} */ ({}),
      scaleRoot: /** @type {HTMLDivElement} */ ({}),

      panning: false,
      opts: { minScale: 0.05, maxScale: 10, step: 0.05, idleMs: 200 },
      pointers: [],
      origin: undefined,
      scale: 1,
      start: {
        clientX: undefined,
        clientY: undefined,
        scale: 1,
        distance: 0,
      },
      x: 0,
      y: 0,

      events: new Subject,
      idleTimeoutId: 0,
      transitionTimeoutId: 0,
      anims: [null, null],
      worldPointerDown: new Vect,

      evt: {
        wheel(e) {
          state.delayIdle();
          state.cancelAnimations();
          state.zoomWithWheel(e);
        },
        pointerdown(e) {
          // if (e.target !== state.parent) return;
          state.delayIdle();
          state.cancelAnimations();
          // e.preventDefault();
          ensurePointer(state.pointers, e);

          state.panning = true;
          state.origin = new Vect(state.x, state.y);
          // This works whether there are multiple pointers or not
          const point = getMiddle(state.pointers)
          state.start = {
            clientX: point.clientX,
            clientY: point.clientY,
            scale: state.scale,
            distance: getDistance(state.pointers),
          };

          state.worldPointerDown.copy(state.getWorld(e));
        },
        pointermove(e) {
          if (
            state.origin === undefined
            || state.start.clientX === undefined
            || state.start.clientY === undefined
          ) {
            return;
          }

          state.delayIdle();
          ensurePointer(state.pointers, e); // Needed?
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
            const nextX = state.origin.x + (current.clientX - state.start.clientX) / state.scale;
            const nextY = state.origin.y + (current.clientY - state.start.clientY) / state.scale;

            if (state.x !== nextX || state.y !== nextY) {
              state.x = nextX;
              state.y = nextY;
              state.setStyles();
            }
          }
        },
        pointerup(e) {
          /**
           * NOTE: don't remove all pointers.
           * Can restart without having to reinitiate all of them.
           * Remove the pointer regardless of the isPanning state.
           */
          removePointer(state.pointers, e);
          if (!state.panning) {
            return;
          }

          const worldPointerUp = state.getWorld(e);
          state.events.next({
            key: 'pointerup',
            point: worldPointerUp,
            distance: state.worldPointerDown.distanceTo(worldPointerUp),
            tags: (/** @type {HTMLElement} */ (e.target).getAttribute('data-tags') || '').split(' '),
          });

          state.panning = false;
          state.origin = state.start.clientX = state.start.clientY = undefined;
          // state.clearTransition();
        },
      },

      cancelAnimations() {
        // We are (or were) animating iff state.anims[0] non-null
        if (state.anims[0]) {
          state.syncStyles(); // Remember current translate/scale
          state.anims.forEach(anim => anim?.cancel());
          state.anims = [null, null];
        }
      },
      // TODO support changing scale
      computePathKeyframes(path) {
        const worldPoint = state.getWorldAtCenter();
        const elens = path.map((p, i) => Number(p.distanceTo(i === 0 ? worldPoint : path[i - 1]).toFixed(2)));
        
        const { width: screenWidth, height: screenHeight } = state.parent.getBoundingClientRect();
        const current = state.getCurrentTransform();
        const total = elens.reduce((sum, len) => sum + len, 0);
        let sofar = 0;

        /** @type {Keyframe[]} */
        const keyframes = [
          { offset: 0, transform: `translate(${current.x}px, ${current.y}px)` },
          ...elens.map((elen, i) => ({
            offset: (sofar += elen) / total,
            transform: `translate(${screenWidth/2 - (current.scale * path[i].x)}px, ${screenHeight/2 - (current.scale * path[i].y)}px)`,
          })),
        ];
        return { keyframes, distance: total };
      },
      delayIdle() {
        state.idleTimeoutId && window.clearTimeout(state.idleTimeoutId);
        state.idleTimeoutId = window.setTimeout(state.idleTimeout, state.opts.idleMs);
      },
      distanceTo(worldPosition) {
        return worldPosition.distanceTo(state.getWorldAtCenter());
      },
      async followPath(path, { animScaleFactor }) {
        state.cancelAnimations();

        const { keyframes, distance } = state.computePathKeyframes(path);
        const duration = distance * animScaleFactor;

        state.anims[0] = state.translateRoot.animate(keyframes, {
          duration, direction: 'normal', fill: 'forwards', easing: 'linear',
        });
        await new Promise((resolve, reject) => {
          const translateAnim = /** @type {Animation} */ (state.anims[0]);
          translateAnim.addEventListener('finish', () => {
            resolve('completed');
            // state.events.next({ key: 'completed-panzoom-to' })
          });
          translateAnim.addEventListener('cancel', () => {
            reject('cancelled');
            // state.events.next({ key: 'cancelled-panzoom-to' })
          });
        });
      },
      getCurrentTransform() {
        const bounds = state.parent.getBoundingClientRect();
        const trBounds = state.translateRoot.getBoundingClientRect();
        return {
          x: trBounds.x - bounds.x,
          y: trBounds.y - bounds.y,
          // Works because state.scaleRoot.style.width = '1px'
          scale: state.scaleRoot.getBoundingClientRect().width,
        }
      },
      getWorld(e) {
        const parentBounds = state.parent.getBoundingClientRect();
        const screenX = e.clientX - parentBounds.left;
        const screenY = e.clientY - parentBounds.top;
        // state.{x,y,scale} needn't be current transform when transitioning
        const current = state.getCurrentTransform();
        const worldX = (screenX - current.x) / current.scale;
        const worldY = (screenY - current.y) / current.scale;
        return { x: worldX, y: worldY };
      },
      getWorldAtCenter() {
        const parentBounds = state.parent.getBoundingClientRect();
        // state.{x,y,scale} needn't be current transform when transitioning
        const current = state.getCurrentTransform();
        const worldX = (parentBounds.width/2 - current.x) / current.scale;
        const worldY = (parentBounds.height/2 - current.y) / current.scale;
        return { x: worldX, y: worldY };
      },
      idleTimeout() {
        if (state.pointers.length === 0) {
          state.idleTimeoutId = 0;
          state.events.next({ key: 'ui-idle' });
        } else {
          state.delayIdle();
        }
      },
      isIdle() {
        return state.idleTimeoutId === 0;
      },
      async panZoomTo(scale, worldPoint, durationMs, easing) {
        scale = scale || state.scale;
        worldPoint = worldPoint || state.getWorldAtCenter();
        easing = easing || 'ease';
        state.cancelAnimations();

        /**
         * Trying to compute (x, y) s.t. target transform
         * `translate(x, y) scale(scale)` has worldPoint at screen center
         * i.e. x + (scale * worldPoint.x) = screenWidth/2
         * i.e. x := screenWidth/2 - (scale * worldPoint.x)
         */
        const { width: screenWidth, height: screenHeight } = state.parent.getBoundingClientRect();
        const dstX = screenWidth/2 - (scale * worldPoint.x);
        const dstY = screenHeight/2 - (scale * worldPoint.y);

        const current = state.getCurrentTransform();

        state.anims[0] = state.translateRoot.animate([
          { offset: 0, transform: `translate(${current.x}px, ${current.y}px)` },
          { offset: 1, transform: `translate(${dstX}px, ${dstY}px)` },
        ], { duration: durationMs, direction: 'normal', fill: 'forwards', easing });

        if (scale !== current.scale) {
          state.anims[1] = state.scaleRoot.animate([
            { offset: 0, transform: `scale(${current.scale})` },
            { offset: 1, transform: `scale(${scale})` },
          ], { duration: durationMs, direction: 'normal', fill: 'forwards', easing })
        }

        await new Promise((resolve, reject) => {
          const translateAnim = /** @type {Animation} */ (state.anims[0]);
          translateAnim.addEventListener('finish', () => {
            resolve('completed');
            state.events.next({ key: 'completed-panzoom-to' })
          });
          translateAnim.addEventListener('cancel', () => {
            reject('cancelled');
            state.events.next({ key: 'cancelled-panzoom-to' })
          });
        });
      },
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
      syncStyles() {
        Object.assign(state, state.getCurrentTransform());
        state.setStyles();
      },
      setStyles() {
        state.translateRoot.style.transform = `translate(${state.x}px, ${state.y}px)`;
        state.scaleRoot.style.transform = `scale(${state.scale})`;
      },
      zoomToClient(toScale, e) {
        const parentBounds = state.parent.getBoundingClientRect();
        const screenX = e.clientX - parentBounds.left;
        const screenY = e.clientY - parentBounds.top;
        // Compute world position given `translate(x, y) scale(scale)`
        // - world to screen is: state.x + (state.scale * worldX)
        // - screen to world is: (screenX - state.x) / state.scale
        const worldX = (screenX - state.x) / state.scale;
        const worldY = (screenY - state.y) / state.scale;
        // To maintain position, need state.x' s.t.
        // worldX' := (screenX - state.x') / toScale = worldPoint.x
        state.x = screenX - (worldX * toScale);
        state.y = screenY - (worldY * toScale);
        state.scale = toScale;
        state.setStyles();
      },
      zoomWithWheel(event) {
        // Avoid conflict with regular page scroll
        event.preventDefault();
        // Normalize to deltaX in case shift modifier is used on Mac
        const delta = event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY;
        const wheel = delta < 0 ? 1 : -1;
        // Wheel has extra 0.5 scale factor (unlike pinch)
        const toScale = Math.min(
          Math.max(state.scale * Math.exp((wheel * state.opts.step * 0.5) / 3), state.opts.minScale),
          state.opts.maxScale,
        );
        state.zoomToClient(toScale, event);
      }
    };
    return output;
  }, { deeper: ['evt'] });

  React.useEffect(() => {
    props.onLoad?.(state);
    // Apply initial zoom and centering
    state.setStyles();
    state.panZoomTo(props.initZoom || 1, props.initCenter || { x: 0, y: 0 }, 1000);
  }, []);

  const [measureRef, bounds] = useMeasure({ debounce: 30, scroll: false });
  React.useEffect(() => {
    if (bounds.width && bounds.height) {
      state.events.next({ key: 'resized-bounds', bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } });
    }
  }, [bounds.width, bounds.height]);

  return (
    <div
      className={classNames("panzoom-parent", rootCss, backgroundCss(props))}
      data-tags="floor"
      ref={measureRef}
    >
      <div
        ref={state.rootRef}
        className={classNames("panzoom-translate", props.className)}
      >
        <div className="panzoom-scale">
          <div className="origin" />
          {/* <div className="small-grid" /> */}
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
    width: 0;
    height: 0;
    user-select: none;
    touch-action: none;
    transform-origin: 0 0;
    
    .panzoom-scale {
      /** So can infer scale during CSS animation via getBoundingClientRect().width */
      width: 1px;
      height: 1px;
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
        linear-gradient(to right, rgba(200, 200, 200, 0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);
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
 * @property {number} [initZoom] e.g. `1`
 * @property {Geom.VectJson} [initCenter]
 * @property {(api: PanZoom.CssApi) => void} [onLoad]
 */

/**
 * @param {PointerEvent[]} pointers 
 * @param {PointerEvent} event 
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
