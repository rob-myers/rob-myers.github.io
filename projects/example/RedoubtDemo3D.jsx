import React from 'react';
import { css } from "goober";
import { Rect, Vect } from '../geom';

/**
 * TODO
 * - 3d pyramid with base 9km * 9km and height 9 km
 * - movable camera
 *   - show green dot when dragging
 * - 125 layered squares
 *   - but only show ≤ 10 at a time, fading out?
 * - can select layer and it comes out
 */


export default function RedoubtDemo3D() {

  const [state] = React.useState(() => {

    return {
      dragging: false,
      dragFrom: new Vect,
      bounds: new Rect,
      el: {
        root: /** @type {HTMLDivElement} */ ({}),
        camera: /** @type {HTMLDivElement} */ ({}),
        redDot: /** @type {HTMLDivElement} */ ({}),
        greenDot: /** @type {HTMLDivElement} */ ({}),
      },

      /** @param {PointerEvent} e */
      onDragStart: (e) => {
        state.dragging = true;
        state.el.root.style.cursor = 'none';
        state.dragFrom.set(e.clientX, e.clientY);
      },
      /** @param {PointerEvent} e */
      onDragMove: (e) => {
        if (!state.dragging) return;
        // const deltaY = e.clientY - state.dragFrom.y;
        // // console.log(deltaY);
        // // state.el.root.style.perspective = `${perspectivePx + 1000 * deltaY}px`;
        // state.el.inner.style.transform = `translateZ(${deltaY}px)`;
        // // state.el.inner.style.transform = `rotateX(${(deltaY / 534) * Math.PI})`;

        state.bounds.copy(state.el.root.getBoundingClientRect());
        const deltaX = e.clientX - state.bounds.cx;
        const deltaY = e.clientY - state.bounds.cy;
        state.el.greenDot.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      },
      onDragEnd: () => {
        state.dragging = false;
        state.el.root.style.cursor = 'default';
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef: (el) => {
        if (el) {
          state.el.root = el;
          state.el.camera = /** @type {*} */ (el.querySelector('div.camera'));
          state.el.redDot = /** @type {*} */ (el.querySelector('div.dot.red'));
          state.el.greenDot = /** @type {*} */ (el.querySelector('div.dot.green'));
          el.addEventListener('pointerdown', state.onDragStart);
          el.addEventListener('pointermove', state.onDragMove);
          el.addEventListener('pointerup', state.onDragEnd);
        }
      },
    };
  });

  return <>
    <div className={rootCss} ref={state.rootRef}>
      <div className={pyramidCss}>
        <div className="camera">
          <div className="base" />
          <div className="side north"></div>
          <div className="side east"></div>
          <div className="side south"></div>
          <div className="side west"></div>
        </div>
        <div className="dot red"></div>
        <div className="dot green"></div>
      </div>
    </div>
  </>;
}

const rootCss = css`
  background: #000000;
  height: 100%;
`;

const scale = 0.02;
const pyBaseDim = 9000 * scale;
const pyBaseHeight = Number((9000 * scale).toFixed(2));

const pyramidCss = css`
  width: 100%;
  height: 100%;
  transform: translate(50%, 50%);
  transform-origin: center;
  position: relative;
  
  perspective: 10000px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
  
  .camera {
    transform-style: preserve-3d;
    transform: translate3d(0, -50px, 300px) rotateX(10deg);
    height: 100%; /** ? */
  }

  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    left: -5px;
    top: -5px;
  }
  .dot.red {
    background: red;
  }
  .dot.green {
    background: green;
  }

  .base {
    position: absolute;
    width: ${pyBaseDim}px;
    height: ${pyBaseDim}px;
    background: rgba(255, 0, 0, 0.1);
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseDim}px;
  }

  .side {
    position: absolute;
    width: 0;
    height: 0;
  }
  .north {
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseHeight}px;
    border-left: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseHeight}px solid rgba(255, 255, 255, 0.1);
    transform-origin: top;
    transform: rotateX(60deg);
  }
  .east {
    left: ${-pyBaseHeight + pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseHeight}px solid rgba(255, 255, 255, 0.2);
    transform-origin: right;
    transform: rotateY(60deg);
  }
  /** We raise south-facing side pi/3, looking down from above */
  .south {
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseHeight}px;
    border-left: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseDim / 2}px solid transparent;
    border-bottom: ${pyBaseHeight}px solid rgba(255, 255, 255, 0.3);
    transform-origin: bottom;
    transform: rotateX(-60deg);
  }
  .west {
    left: ${-pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-left: ${pyBaseHeight}px solid rgba(255, 255, 255, 0.4);
    transform-origin: left;
    transform: rotateY(-60deg);
  }

`;
