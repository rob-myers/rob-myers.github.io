import { css } from "goober";
import React from "react";
import { Vect } from "../geom";
import { getSvgPos } from "../service/dom";

/** @param {Props} props */
export default function DraggableNode(props) {

  const [state, setState] = React.useState(() => {
    return {
      position: Vect.from(props.initial),
      target: Vect.from(props.initial),
      dragging: false,

      /** @type {SVGGElement} */
      rootEl: ({}),
      /** @type {SVGLineElement} */
      lineEl: ({}),
      /** @type {SVGCircleElement} */
      circleEl: ({}),

      /** @param {PointerEvent} e */
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
        setState({ ...state });
        props.onStop?.(Vect.from(state.position));
      },
      /** @param {KeyboardEvent} e */
      endDragOnEscape: (e) => void (e.key === 'Escape' && state.endDrag()),
    };
  });

  const radius = props.radius || 10;

  return (
    <g
      className={rootCss}
      ref={(el) => {
        if (el) {
          state.rootEl = el;
          state.lineEl = /** @type {SVGLineElement} */ (el.querySelector('line.drag-indicator'));
          state.circleEl = /** @type {SVGCircleElement} */ (el.querySelector('circle.node'));
          state.circleEl.addEventListener('pointerdown', state.startDrag);
          state.circleEl.addEventListener('pointerup', state.applyDrag);
        }
      }}
    >
      {props.icon && (
        (props.icon === 'eye' &&
          <image
            href="/icon/Simple_Icon_Eye.svg"
            width="30" height="30" x={state.position.x - 15} y={state.position.y - 15} 
          />
        )
        ||
        (props.icon === 'down' &&
          <image
            href="/icon/solid_arrow-circle-down.svg"
            width="30" height="30" x={state.position.x - 15} y={state.position.y - 15} 
          />)
        ||
        (props.icon === 'right' &&
          <image
            href="/icon/solid_arrow-circle-right.svg"
            width="30" height="30" x={state.position.x - 15} y={state.position.y - 15} 
          />)
      ) || (
        <circle
          className="inner-node"
          cx={state.position.x}
          cy={state.position.y}
          r={radius}
        />
      )}
      <circle
        className="node"
        cx={state.position.x}
        cy={state.position.y}
        r={radius + 20}
      />
      <line
        className="drag-indicator"
        stroke={props.stroke || 'blue'}
      />
    </g>
  );
}

const rootCss = css`
  > circle.node {
    fill: rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
  > circle.inner-node {
    stroke: black;
    cursor: pointer;
    stroke-width: 0.5;
  }
  > line.drag-indicator {
    display: none;
    stroke-width: 2.5;
    user-select: none;
    pointer-events: none;
  }
`;

/**
 * @typedef Props @type {object}
 * @property {Geom.VectJson} initial
 * @property {(position: Geom.Vect) => void} [onStop]
 * @property {() => void} [onStart]
 * @property {number} [radius]
 * @property {'eye' | 'down' | 'right'} [icon]
 * @property {string} [stroke]
 */
