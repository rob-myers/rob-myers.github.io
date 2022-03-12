import React from 'react';
import { css } from "goober";
import { Rect, Vect } from '../geom';
import useMuState from '../hooks/use-mu-state';

/**
 * TODO
 * - 3d pyramid with 9km * 9km base and slope height 9 km ✅
 * - show green dot when dragging ✅
 */

export default function Pyramid3dDemo() {

  const state = useMuState(() => {

    return {
      dragging: false,
      dragFrom: new Vect,
      dragTo: new Vect,
      bounds: new Rect,
      /** (y, z) */
      camPos: new Vect(-camMaxH, camMaxH),
      /**
       * Assume camera lies on specific circle in plane x=0, with
       * topmost point (0, -camMaxH, -camMaxH) and rightmost (0, 0, 0).
       * This angle parameterises it, going anticlockwise from rightmost.
       * We'll constrain it to [pi/4, pi/2]
       */
      camAngle: Math.PI/2,
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

        // state.el.dragLine.style.transform = `${state.el.redDot.style.transform} rotateZ(${state.dragTo.y > state.dragFrom.y ? 90 : -90}deg)`;
        const delta = state.dragTo.y - state.dragFrom.y;
        // state.el.dragLine.style.width = `${Math.abs(delta)}px`;

        // TODO pivot about fixed intiial camAngle
        state.camAngle = Math.max(Math.min(state.camAngle + delta * 0.0001, Math.PI/2 + Math.PI/4), Math.PI/50);
        state.updateCamera();
      },
      /** @param {PointerEvent} e */
      onDragEnd: (e) => {
        state.dragging = false;
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
          el.addEventListener('pointerleave', (e) => state.onDragEnd(e));
          state.updateCamera();
        }
      },
      updateCamera() {
        const [cy, cz, tilt] = [
          camMaxH * (1 - Math.cos(state.camAngle)),
          camMaxH * Math.sin(state.camAngle),
          Math.atan((1 - Math.cos(state.camAngle)) / (Math.sin(state.camAngle) - pyHeight/(2 * camMaxH))),
        ];
        state.el.camera.style.transform = `rotateX(${tilt}rad) translate3d(0, ${-cy}px, ${-cz}px)`;
      }
    };
  });

  return <>
    <div className={rootCss} ref={state.rootRef}>
      <div className={pyramidCss}>
        <div className="camera">
          <div className="pyramid">
            <div className="base" />
            <div className="side north"></div>
            <div className="side east"></div>
            <div className="side south"></div>
            <div className="side west"></div>
          </div>
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

const dotDim = 4;
const scale = 0.04;
const pyBaseDim = 9000 * scale;
/** Length along the face from base to pinacle */
const pyFaceLength = 9000 * scale;
const pyHeight = 9000 * (Math.sqrt(3) / 2) * scale;
/** Maximum camera height */
const camMaxH = 120000 * scale; 

const pyramidCss = css`
  width: 100%;
  height: 100%;
  transform: translate(50%, 50%);
  /* transform: scale(1.5) translate(50%, 50%); */
  transform-origin: center;
  position: relative;
  
  perspective: ${camMaxH}px;
  perspective-origin: 0 0;
  transform-style: preserve-3d;
  
  .camera {
    transform-style: preserve-3d;
    transform: rotateX(45deg) translate3d(0, ${-camMaxH}px, ${-camMaxH}px);
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
    width: ${dotDim}px;
    height: ${dotDim}px;
    left: ${-dotDim/2}px;
    top: ${-dotDim/2}px;
    pointer-events: none;
  }
  .dot.red {
    background: red;
  }
  .dot.green {
    background: green;
  }

  .pyramid {
    transform-style: preserve-3d;
    transform-origin: 0 ${-pyBaseDim/2}px;
    transform: rotateZ(45deg); /** TODO can adjust */
  }
  .base {
    position: absolute;
    width: ${pyBaseDim}px;
    height: ${pyBaseDim}px;
    left: ${-pyBaseDim / 2}px;
    top: ${-pyBaseDim}px;
    background: rgba(255, 0, 0, 0.1);
    backface-visibility: hidden;
  }

  .side {
    position: absolute;
    width: 0;
    height: 0;
    backface-visibility: hidden;
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
