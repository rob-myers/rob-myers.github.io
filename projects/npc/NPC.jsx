import React from "react";
import { css } from "goober";
import { Vect } from "../geom/vect";
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from "./DraggableNode";

/** @param {NPC.Props} props */
export default function NPC(props) {

  const [state] = React.useState(() => {

    /** @type {NPC.Api} */
    const api = {
      anim: /** @type {Animation} */ ({}),
      geom: { animPath: [], navPath: [], },
      aux: { count: 0, edges: [], elens: [], sofars: [], total: 0 },
      getPosition: () => {
        // https://stackoverflow.com/a/4976554/2917822
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.el.npc).transform);
        return new Vect(matrix.m41, matrix.m42);
      },
    };

    return {
      el: {
        npc: /** @type {SVGGElement} */ ({}),
        navpath: /** @type {SVGPolylineElement} */ ({}),
      },
      mounted: false,
      srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      api,

      onDraggedDstNode: () => {

      },
      onDraggedSrcNode: () => {

      },
      /** @param {SVGGElement} el */
      rootRef: (el) => {
        if (el && !state.mounted) {
          state.el.npc = /** @type {*} */ (el.querySelector('g.npc'));
          state.el.npc.animate([
            { transform: `translate(0px, 0px)` }, // Extra frame for polyfill
            { transform: `translate(${props.init.src.x}px, ${props.init.src.y}px)` },
          ], { fill: 'forwards' });
          state.el.navpath = /** @type {*} */ (el.querySelector('polyline.navpath'));
          state.mounted = true;
        }
      },
      /**
       * Should we cancel drag of node?
       * @param {Geom.Vect} curr 
       * @param {Geom.Vect} next 
       * @param {'src' | 'dst'} type 
       */
      cancelDrag: (curr, next, type) => {
        if (pathfinding.getGroup(props.init.zoneKey, next) === null) {
          return true; // TODO test
        }
        const dragging = curr.distanceTo(next) >= 20;
        const npcPos = state.api.getPosition();
        const otherNode = type === 'src' ? state.dstApi.getPosition() : state.srcApi.getPosition();

        return dragging && (
          next.distanceTo(npcPos) <= 2 * nodeRadius // Near NPC
          || next.distanceTo(otherNode) <= 2 * nodeRadius // Near other node
        );
      },
    };
  });

  return (
    <g className={rootCss} ref={state.rootRef}>

      <g>
        <polyline className="navpath" />
        <DraggableNode
          initial={props.init.src}
          radius={nodeRadius}
          onLoad={api => state.srcApi = api}
          onStop={state.onDraggedSrcNode}
          shouldCancel={(curr, next) => state.cancelDrag(curr, next, 'src')}
          onClick={() => {
            /**
             * TODO
             */
          }}
        />

        <DraggableNode
          initial={props.init.dst}
          radius={nodeRadius}
          onLoad={api => state.dstApi = api}
          onStop={state.onDraggedDstNode}
          shouldCancel={(curr, next) => state.cancelDrag(curr, next, 'dst')}
          onClick={() => {
            /**
             * TODO
             */
          }}
        />

      </g>

      <g className="npc">
        <circle fill="yellow" stroke="black" strokeWidth={2} r={10} />
        <line stroke="black" strokeWidth={2} x2={10} />
      </g>

    </g>
  );
}

const nodeRadius = 24;

const rootCss = css`
  polyline.navpath {
    fill: none;
    stroke: #777;
    stroke-width: 2;
    stroke-dasharray: 8px;
    stroke-dashoffset: 16px;
  }

  g.npc {
    pointer-events: none;
  }
`;
