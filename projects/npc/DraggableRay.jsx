import React from "react";
import { css } from "goober";
import { getSvgPos } from "../service/dom";
import { Vect } from "../geom/vect";

/** @param {Props} props */
export default function DraggableRay(props) {

  const [state] = React.useState(() => {

    const output = {
      /** Expected to be constant during ray drag */
      source: new Vect,
      target: new Vect,
      dragging: false,
      disabled: true,
      circleEl: /** @type {SVGCircleElement} */ ({}),
      lineEl: /** @type {SVGLineElement} */ ({}),

      /** @type {React.RefCallback<SVGGElement>} */
      rootRef(el) {
        if (el) {
          state.circleEl = /** @type {SVGCircleElement} */ (el.querySelector('circle.drag-source'));
          state.lineEl = /** @type {SVGLineElement} */ (el.querySelector('line.drag-indicator'));
          state.circleEl.addEventListener('pointerdown', state.startDrag);
          state.circleEl.addEventListener('pointerup', state.applyDrag);
        }
      },
      /** @param {PointerEvent} e */
      startDrag: (e) => {
        if (state.disabled) return;
        e.stopPropagation();
        state.dragging = true;
        state.lineEl.style.display = 'inline';
        ['x2', 'y2'].forEach(attr => state.lineEl.setAttribute(attr, '0'));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.addEventListener('pointermove', state.onMove);
        svg.addEventListener('pointerleave', state.endDrag);
        svg.addEventListener('pointerup', state.applyDrag);
        window.addEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'grabbing';
        props.onStart?.();
      },
      /** @param {PointerEvent}  e */
      onMove: (e) => {
        e.stopPropagation();
        if (state.dragging) {
          const { x, y } = getSvgPos({
            clientX: e.clientX,
            clientY: e.clientY,
            ownerSvg: /** @type {SVGSVGElement} */ (state.lineEl.ownerSVGElement),
            pointerId: null,
          });
          const target = new Vect(x, y).sub(state.source);
          if (target.length >= 20) {
            state.target.copy(target);
            state.lineEl.setAttribute('x2', String(target.x));
            state.lineEl.setAttribute('y2', String(target.y));
          }
        }
      },
      endDrag: () => {
        if (!state.dragging) return;
        state.dragging = false;
        state.lineEl.style.display = 'none';
        ['x2', 'y2'].forEach(attr => state.lineEl.setAttribute(attr, '0'));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.removeEventListener('pointermove', state.onMove);
        svg.removeEventListener('pointerleave', state.endDrag);
        svg.removeEventListener('pointerup', state.applyDrag);
        window.removeEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'auto';
      },
      applyDrag: () => {
        if (!state.dragging) return;
        state.endDrag();

        if (props.shouldCancel?.(state.target)) {
          return;
        } else if (state.target.length < 20) {// Click 
          console.log('click')
          // props.onClick?.(state.position.clone());
        } else {// Drag
          console.log('drag', state.target.clone())
          // props.onStop?.(state.target.clone()); // TODO
        }
      },
      /** @param {KeyboardEvent} e */
      endDragOnEscape: (e) => {
        e.key === 'Escape' && state.endDrag();
      },
    };

    props.onLoad?.({
      disable: () => {
        state.disabled = true;
      },
      enable: (source) => {
        state.source.copy(source);
        state.disabled = false;
      },
    });

    return output;
  });

  return (
    <g className={rootCss} ref={state.rootRef}>
      <circle
        className="drag-source"
        // fill="blue"
        fill="rgba(0, 0, 0, 0.2)"
        r={props.radius}
      />
      <line
        className="drag-indicator"
        stroke="blue"
        strokeWidth={1}
      />
    </g>
  );
}


const rootCss = css`
  circle {
    cursor: crosshair;
  }
`;

/**
 * @typedef Props @type {object}
 * @property {number} radius
 * @property {(api: NPC.DraggableRayApi) => void} [onLoad]
 * @property {() => void} [onStart]
 * @property {(angle: number) => void} [onStop]
 * @property {(target: Geom.Vect) => void} [shouldCancel]
 */
