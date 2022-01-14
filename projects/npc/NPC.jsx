import React from "react";
import { css } from "goober";
import { Vect } from "../geom/vect";
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from "./DraggableNode";

/** @param {NPC.Props} props */
export default function NPC(props) {

  const [state] = React.useState(() => {

    // Assume nav zone already exists
    const groupId = pathfinding.getGroup(props.init.zoneKey, props.init.src);
    if (groupId === null) {
      console.warn(`NPC: init.src: ${props.init.src.x}, ${props.init.src.y}: no group found`);
    }

    /** @type {NPC.Api} */
    const api = {
      anim: /** @type {Animation} */ ({}),
      geom: { animPath: [], navPath: [], },
      aux: { groupId, count: 0, edges: [], elens: [], sofars: [], total: 0, angs: [] },
      getPosition() {
        // https://stackoverflow.com/a/4976554/2917822
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.el.npc).transform);
        return new Vect(matrix.m41, matrix.m42);
      },
      /** @param {AnimationPlayState} ps */
      is: (ps) => state.api.anim.playState === ps,
    };

    return {
      el: {
        npc: /** @type {SVGGElement} */ ({}),
        path: /** @type {SVGPolylineElement} */ ({}),
      },
      mounted: false,
      srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      api,

      /**
       * Should cancel drag of node?
       * @param {Geom.Vect} curr 
       * @param {Geom.Vect} next 
       * @param {'src' | 'dst'} type 
       */
      cancelDrag(curr, next, type) {
        if (pathfinding.getGroup(props.init.zoneKey, next) === null) {
          return true; // NOTE currently permit ends to lie in distinct groups
        }
        const dragging = curr.distanceTo(next) >= 20;
        const npcPos = state.api.getPosition();
        const other = type === 'src' ? state.dstApi.getPosition() : state.srcApi.getPosition();

        return dragging && (
          next.distanceTo(npcPos) <= 2 * nodeRadius // Near NPC
          || next.distanceTo(other) <= 2 * nodeRadius // Near other end
        );
      },
      followNavPath() {
        const { geom: {animPath}, aux } = api;
        if (animPath.length <= 1) return;
        state.updateAnimAux();
        const wasPaused = api.is('paused');

        api.anim.cancel();
        api.anim = state.el.npc.animate(// TODO ensure > 1 frame for polyfill
          animPath.flatMap((p, i) => [{
            offset: aux.total ? aux.sofars[i] / aux.total : 0,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i - 1] || 0}rad)`,
          }, {
            offset: aux.total ? aux.sofars[i] / aux.total : 0,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i] || 0}rad)`,
          }]),
          { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
        );

        if (wasPaused || aux.count === 0) {
          api.anim.pause();
        }
        api.aux.count++;
      },
      // TODO explain this function
      onDraggedSrcNode() {
        const animPath = api.geom.animPath;
        if (api.is('finished')) {
          // TODO test this first
          api.geom.navPath.reverse();
          state.el.path.setAttribute('points', `${api.geom.navPath}`);
          state.swapNodes();
          state.followNavPath();
        } else if (api.is('paused') && animPath.length) {
          /**
           * TODO
           */
        } else {
          state.togglePaused();
        }
      },
      onClickedSrcNode() {

      },
      onDraggedDstNode() {
        
      },
      onClickedDstNode() {

      },
      /** @param {SVGGElement} el */
      rootRef(el) {
        if (el && !state.mounted) {
          state.el.npc = /** @type {*} */ (el.querySelector('g.npc'));
          state.el.path = /** @type {*} */ (el.querySelector('polyline.navpath'));
          api.anim = state.el.npc.animate([
            { transform: `translate(0px, 0px)` }, // Extra frame for polyfill
            { transform: `translate(${props.init.src.x}px, ${props.init.src.y}px)` },
          ], { fill: 'forwards' });
          state.mounted = true;
        }
      },
      swapNodes() {
        const [src, dst] = [state.srcApi.getPosition(), state.dstApi.getPosition()];
        state.srcApi.moveTo(dst), state.dstApi.moveTo(src);
      },
      togglePaused: () => {
        if (api.is('finished')) {
          return;
        } else if (api.is('paused')) {
          state.api.anim.play();
        } else {
          state.api.anim.pause();
        }
      },
      updateAnimAux() {
        const { geom: { animPath }, aux } = api;
        aux.edges = animPath.map((p, i) => ({ p, q: animPath[i + 1] })).slice(0, -1);
        aux.elens = aux.edges.map(({ p, q }) => p.distanceTo(q));
        const reduced = aux.elens.reduce((agg, length) => {
          agg.total += length;
          agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
          return agg;
        }, { sofars: [0], total: 0 });
        [aux.sofars, aux.total] = [reduced.sofars, reduced.total];
        aux.angs = aux.edges.map(e => Number(Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x).toFixed(2)));
      },
      /**
       * Update navpath i.e. from NPC's current position to `dst`.
       * @param {Geom.Vect} dst
       */
       updateNavPath(dst) {
        const dstGroupId = pathfinding.getGroup(props.init.zoneKey, dst);
        if (dstGroupId === null) {
          return console.warn(`computeNavPath: dst: ${dst.x}, ${dst.y}: no group found`);
        } else if (dstGroupId !== api.aux.groupId) {
          // NOTE currently navpath has a fixed groupId
          return console.warn(`computeNavPath: (src, dst) have different groupIds: (${api.aux.groupId}, ${dstGroupId})`);
        }

        const npcPos = api.getPosition();
        const computedPath = pathfinding.findPath(npcPos, dst, props.init.zoneKey, api.aux.groupId)?.path || [];
        api.geom.navPath = ([Vect.from(npcPos)].concat(computedPath));
        api.geom.animPath = api.geom.navPath.slice(); // Same initially
        // Move src node to current NPC position
        state.srcApi.moveTo(npcPos), state.dstApi.moveTo(dst);
        state.el.path.setAttribute('points', `${api.geom.navPath}`);
      },
    };
  });

  React.useEffect(() => {
    state.updateNavPath(Vect.from(props.init.dst));
    state.followNavPath();
  }, []);

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
          onClick={state.onClickedSrcNode}
        />
        <DraggableNode
          initial={props.init.dst}
          radius={nodeRadius}
          onLoad={api => state.dstApi = api}
          onStop={state.onDraggedDstNode}
          shouldCancel={(curr, next) => state.cancelDrag(curr, next, 'dst')}
          onClick={state.onClickedDstNode}
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
