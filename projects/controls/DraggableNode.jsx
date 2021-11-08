import { css } from "goober";
import React from "react";
import { Vect } from "../geom";
import { getSvgPos } from "../service";

/** @param {{ initial: Geom.VectJson; onChange: (position: Geom.Vect) => void; radius?: number }} props */
export default function DraggableNode(props) {

  const [state, setState] = React.useState(() => {
    return {
      position: Vect.from(props.initial),
      target: Vect.from(props.initial),
      dragging: false,
      /** @param {React.PointerEvent} e */
      startDrag: (e) => {
        e.stopPropagation();
        state.dragging = true;
        state.lineEl.style.display = 'inline';
        state.target.copy(state.position);
        ['x1', 'x2'].forEach(attr => state.lineEl.setAttribute(attr, String(state.position.x)));
        ['y1', 'y2'].forEach(attr => state.lineEl.setAttribute(attr, String(state.position.y)));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.addEventListener('pointermove', state.onMove);
        svg.addEventListener('pointerleave', state.endDrag);
        svg.addEventListener('pointerup', state.applyDrag);
        window.addEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'grabbing';
      },
      /** @param {PointerEvent}  e */
      onMove: (e) => {
        if (state.dragging) {
          const { x, y } = getSvgPos({
            clientX: e.clientX,
            clientY: e.clientY,
            ownerSvg: /** @type {SVGSVGElement} */ (state.lineEl.ownerSVGElement),
            pointerId: null,
          });
          state.target.set(x, y);
          state.lineEl.setAttribute('x2', String(x));
          state.lineEl.setAttribute('y2', String(y));
        }
      },
      endDrag: () => {
        state.dragging = false; // Mutate
        state.lineEl.style.display = 'none';
        state.lineEl.setAttribute('x2', /** @type {*} */ (state.lineEl.getAttribute('x1')));
        state.lineEl.setAttribute('y2', /** @type {*} */ (state.lineEl.getAttribute('y1')));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.removeEventListener('pointermove', state.onMove);
        svg.removeEventListener('pointerleave', state.endDrag);
        svg.removeEventListener('pointerup', state.applyDrag);
        window.removeEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'auto';
      },
      applyDrag: () => {
        state.endDrag();
        state.position.copy(state.target);
        state.lineEl.setAttribute('x1', String(state.target.x));
        state.lineEl.setAttribute('y1', String(state.target.y));
        // setRenderCount(x => ++x);
        setState({ ...state });
        props.onChange(Vect.from(state.position));
      },
      /** @param {KeyboardEvent} e */
      endDragOnEscape: (e) => void (e.key === 'Escape' && state.endDrag()),
      /** @type {SVGLineElement} */
      lineEl: ({}),
    };
  });

  const radius = props.radius || 10;

  return (
    <g className={rootCss}>
      <line
        ref={(el) => el && (state.lineEl = el)}
        className="drag-indicator"
      />
      <circle
        className="node"
        cx={state.position.x}
        cy={state.position.y}
        r={radius}
        // TODO does PointerEvents polyfill work?
        onPointerDown={state.startDrag}
        onPointerUp={state.applyDrag}
      />
    </g>
  );
}

const rootCss = css`
  > .node {
    fill: blue;
    stroke: black;
    cursor: pointer;
    stroke-width: 0.5;
  }
  > .drag-indicator {
    stroke: black;
    display: none;
    stroke-width: 2.5;
    user-select: none;
  }
`;
