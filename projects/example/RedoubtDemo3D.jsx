import React from 'react';
import { css } from "goober";
import { Vect } from '../geom';

/**
 * TODO
 * - 3d pyramid with base 9km * 9km and height 9 km
 * - movable camera e.g. mouse movement changes rotation transform?
 * - 125 layered squares
 *   - but only show ≤ 10 at a time, fading out?
 * - can select layer and it comes out
 */


export default function RedoubtDemo3D() {

  const [state] = React.useState(() => {

    return {
      dragging: false,
      dragPoint: new Vect,
      el: {
        root: /** @type {HTMLDivElement} */ ({}),
        outer: /** @type {HTMLDivElement} */ ({}),
        inner: /** @type {HTMLDivElement} */ ({}),
      },

      /** @param {PointerEvent} e */
      onDragStart: (e) => {
        state.dragging = true;
        state.dragPoint.set(e.clientX, e.clientY);
      },
      /** @param {PointerEvent} e */
      onDragMove: (e) => {
        if (!state.dragging) return;
        const deltaY = e.clientY - state.dragPoint.y;
        // console.log(deltaY);
        // state.el.root.style.perspective = `${perspectivePx + 1000 * deltaY}px`;
        state.el.inner.style.transform = `translateZ(${deltaY}px)`;
        // state.el.inner.style.transform = `rotateX(${(deltaY / 534) * Math.PI})`;
      },
      onDragEnd: () => {
        state.dragging = false;
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef: (el) => {
        if (el) {
          // state.el.root = el;
          // state.el.inner = /** @type {*} */ (el.querySelector('div.inner'));
          // state.el.outer = /** @type {*} */ (el.querySelector('div.outer'));
          // el.addEventListener('pointerdown', state.onDragStart);
          // el.addEventListener('pointermove', state.onDragMove);
          // el.addEventListener('pointerup', state.onDragEnd);
        }
      },
    };
  });

  return <>
    <div className={pyramidCss}>
      <div className="camera">
        <div className="side north"></div>
        <div className="side east"></div>
        <div className="side south"></div>
        <div className="side west"></div>
      </div>
      <div className="dot"></div>
    </div>
  </>;
}

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
    transform: translate3d(0, -50px, 0) rotateX(10deg);
    height: 100%; /** ? */
  }

  .dot {
    position: absolute;
    width: 5px;
    height: 5px;
    left: -2.5px;
    top: -2.5px;
    background: red;
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
    border-top: ${pyBaseHeight}px solid rgba(0, 0, 255, 0.4);
    transform-origin: top;
    transform: rotateX(60deg);
  }
  .east {
    left: ${-pyBaseHeight + pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseHeight}px solid rgba(255, 255, 0, 0.4);
    transform-origin: right;
    transform: rotateY(60deg);
  }
  /** We raise south-facing side pi/3, looking down from above */
  .south {
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseHeight}px;
    border-left: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseDim / 2}px solid transparent;
    border-bottom: ${pyBaseHeight}px solid rgba(255, 0, 0, 0.4);
    transform-origin: bottom;
    transform: rotateX(-60deg);
  }
  .west {
    left: ${-pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-left: ${pyBaseHeight}px solid #869e84;
    transform-origin: left;
    transform: rotateY(-60deg);
  }

`;
