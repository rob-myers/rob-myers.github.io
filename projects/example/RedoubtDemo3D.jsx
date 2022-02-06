import React from 'react';
import { css } from "goober";
import { Rect, Vect } from '../geom';
import useMuState from '../hooks/use-mu-state';

/**
 * TODO
 * - 3d pyramid with 9km * 9km base and slope height 9 km
 * - movable camera
 *   - show green dot when dragging
 *   - show drag line when dragging
 *   - go through css-camera and understand a demo
 *   - look at pyramid base center whilst rotX or rotZ
 * - can scale via mousewheel or pinch
 * - 125 layered squares
 *   - but only show ≤ 10 at a time, fading out?
 * - can select layer and it comes out
 */


export default function RedoubtDemo3D() {

  const state = useMuState(() => {

    return {
      dragging: false,
      dragFrom: new Vect,
      dragTo: new Vect,
      bounds: new Rect,
      el: {
        root: /** @type {HTMLDivElement} */ ({}),
        camera: /** @type {HTMLDivElement} */ ({}),
        redDot: /** @type {HTMLDivElement} */ ({}),
        greenDot: /** @type {HTMLDivElement} */ ({}),
        dragLine: /** @type {HTMLDivElement} */ ({}),
      },

      /** @param {PointerEvent} e */
      onDragStart: (e) => {
        state.dragging = true;
        state.el.root.style.cursor = 'none';
        state.bounds.copy(state.el.root.getBoundingClientRect());
        state.dragFrom.set(e.clientX - state.bounds.cx, e.clientY - state.bounds.cy);
        state.el.redDot.style.transform = state.el.greenDot.style.transform = `translate(${state.dragFrom.x}px, ${state.dragFrom.y}px)`;
      },
      /** @param {PointerEvent} e */
      onDragMove: (e) => {
        if (!state.dragging) return;
        state.bounds.copy(state.el.root.getBoundingClientRect());
        state.dragTo.set(e.clientX - state.bounds.cx, e.clientY - state.bounds.cy);
        state.el.greenDot.style.transform = `translate(${state.dragFrom.x}px, ${state.dragTo.y}px)`;
        state.el.dragLine.style.transform = `${state.el.redDot.style.transform} rotateZ(90deg)`;
        state.el.dragLine.style.width = `${state.dragFrom.distanceTo(state.dragTo)}px`;
      },
      /** @param {PointerEvent} e */
      onDragEnd: (e) => {
        state.dragging = false;
        state.el.root.style.cursor = 'default';
        state.el.redDot.style.transform = state.el.greenDot.style.transform
        state.el.dragLine.style.width = `0px`;
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      rootRef: (el) => {
        if (el) {
          state.el.root = el;
          state.el.camera = /** @type {*} */ (el.querySelector('div.camera'));
          state.el.redDot = /** @type {*} */ (el.querySelector('div.dot.red'));
          state.el.greenDot = /** @type {*} */ (el.querySelector('div.dot.green'));
          state.el.dragLine = /** @type {*} */ (el.querySelector('div.drag-line'));
          // Pattern (e) => state.foo(e) supports HMR
          el.addEventListener('pointerdown', (e) => state.onDragStart(e));
          el.addEventListener('pointermove', (e) => state.onDragMove(e));
          el.addEventListener('pointerup', (e) => state.onDragEnd(e));
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
        <div className="drag-line"></div>
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
/** Length along the face from base to pinacle */
const pyFaceLength = 9000 * scale;
// const pyHeight = 9000 * (Math.sqrt(3) / 2) * scale;
const cameraHeight = 80000 * scale; 

const pyramidCss = css`
  width: 100%;
  height: 100%;
  transform: translate(50%, 50%);
  transform-origin: center;
  position: relative;
  
  perspective: ${cameraHeight}px;
  perspective-origin: 0 0;
  transform-style: preserve-3d;
  
  .camera {
    transform-style: preserve-3d;
    transform: rotateX(10deg) translate3d(0, -${100}px, 0);
    /* transform: rotateX(70deg) translate3d(0, -${cameraHeight}px, 0); */
    /** ? */
    height: 100%;
  }

  .drag-line {
    position: absolute;
    height: 2px;
    width: 0px;
    left: 0;
    top: 0;
    background: white;
    transform-origin: left center;
  }
  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    left: -5px;
    top: -5px;
    pointer-events: none;
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
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseDim}px;
    background: rgba(255, 0, 0, 0.1);
  }

  .side {
    position: absolute;
    width: 0;
    height: 0;
  }
  .north {
    left: ${-pyBaseDim / 2}px;
    top: ${-pyFaceLength}px;
    border-left: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyFaceLength}px solid rgba(255, 255, 255, 0.1);
    transform-origin: top;
    transform: rotateX(60deg);
  }
  .east {
    left: ${-pyFaceLength + pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyFaceLength}px solid rgba(255, 255, 255, 0.2);
    transform-origin: right;
    transform: rotateY(60deg);
  }
  /** We raise south-facing side pi/3, looking down from above */
  .south {
    left: ${-pyBaseDim / 2}px;
    top: ${-pyFaceLength}px;
    border-left: ${pyBaseDim / 2}px solid transparent;
    border-right: ${pyBaseDim / 2}px solid transparent;
    border-bottom: ${pyFaceLength}px solid rgba(255, 255, 255, 0.3);
    transform-origin: bottom;
    transform: rotateX(-60deg);
  }
  .west {
    left: ${-pyBaseDim/2}px;
    top: ${-pyBaseDim}px;
    border-bottom: ${pyBaseDim / 2}px solid transparent;
    border-top: ${pyBaseDim / 2}px solid transparent;
    border-left: ${pyFaceLength}px solid rgba(255, 255, 255, 0.4);
    transform-origin: left;
    transform: rotateY(-60deg);
  }

`;
