import React from "react";
import { css } from "goober";
import { getSvgPos } from "../service/dom";
import { Vect } from "../geom/vect";

/** @param {NPC.DraggableRayProps} props */
export default function DraggableRay(props) {

  const [state] = React.useState(() => {

    const output = {
      /** Assumed constant during ray drag */
      source: new Vect,
      /** Assumed constant during ray drag */
      angle: 0,

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
        state.target.copy(state.source);
        props.onStart?.();
      },
      /** @param {PointerEvent}  e */
      onMove: (e) => {
        e.stopPropagation();
        if (state.dragging) {
          const target = getSvgPos({
            clientX: e.clientX,
            clientY: e.clientY,
            ownerSvg: /** @type {SVGSVGElement} */ (state.lineEl.ownerSVGElement),
            pointerId: null,
          });
          state.target.copy(target);
          /** Must account for NPC offset and angle (???) */
          const delta = Vect.from(target).sub(state.source).rotate(-state.angle);
          if (delta.length >= 20) {
            state.lineEl.setAttribute('x2', String(delta.x));
            state.lineEl.setAttribute('y2', String(delta.y));
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
        const distance = state.source.distanceTo(state.target);

        if (distance < 8) {// Click 
          // console.log('click')
          props.onClick?.(state.target.clone());
        } else if (distance > 20) {// Drag
          // console.log('drag')
          props.onStop?.(state.target.clone());
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
      enable: (source, angle) => {
        state.source.copy(source);
        state.angle = angle;
        state.disabled = false;
      },
      setAngle: (angle) => {
        state.angle = angle;
      },
    });

    return output;
  });

  return (
    <g className={rootCss} ref={state.rootRef}>
      <circle
        className="drag-source"
        fill="rgba(0, 0, 0, 0.2)"
        r={props.radius}
      />
      <line
        className="drag-indicator"
        stroke="#444"
        strokeWidth={2}
      />
    </g>
  );
}

const rootCss = css`
  circle {
    cursor: crosshair;
  }
  line {
    pointer-events: none;
  }
`;
