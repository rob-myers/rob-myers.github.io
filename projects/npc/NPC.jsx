import React from "react";
import { css } from "goober";
import { Vect } from "../geom/vect";
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from "./DraggableNode";
import { Poly } from "projects/geom";

/** @param {NPC.Props} props */
export default function NPC(props) {

  const [state] = React.useState(() => {

    // Assume zone already exists
    const groupId = pathfinding.getGroup(props.init.zoneKey, props.init.src);
    if (groupId === null) {
      console.warn(`NPC: init.src: ${props.init.src.x}, ${props.init.src.y}: no group found`);
    }

    /** @type {NPC.Api} */
    const api = {
      move: /** @type {Animation} */ ({}),
      look: /** @type {Animation} */ ({}),
      geom: { animPath: [], navPath: [], navPathPolys: [] },
      aux: { groupId, count: 0, edges: [], elens: [], sofars: [], total: 0, angs: [] },
      getPosition() {
        // https://stackoverflow.com/a/4976554/2917822
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.el.npc).transform);
        return new Vect(matrix.m41, matrix.m42);
      },
      /** @param {AnimationPlayState} ps */
      is: (ps) => state.api.move.playState === ps,
      pause: () => { api.move.pause(); api.look.pause(); },
      play: () => { api.move.play(); api.look.play(); },
    };

    props.onLoad(api);

    return {
      el: {
        npc: /** @type {SVGGElement} */ ({}),
        dir: /** @type {SVGLineElement} */ ({}),
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
      shouldCancelDrag(curr, next, type) {
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
        const { geom: { animPath }, aux } = api;
        if (animPath.length <= 1) return;
        const wasPaused = api.is('paused');

        api.move.cancel();
        api.move = state.el.npc.animate(
          // NOTE need ≥ 2 frames for polyfill
          animPath.map((p, i) => ({
            offset: aux.total ? aux.sofars[i] / aux.total : 0,
            transform: `translate(${p.x}px, ${p.y}px)`,
          })),
          { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
        );

        api.look.cancel();
        api.look = state.el.dir.animate(
          animPath.flatMap((p, i) => [{
            offset: aux.total ? aux.sofars[i] / aux.total : 0,
            transform: `rotateZ(${aux.angs[i - 1] || 0}rad)`,
          }, {
            offset: aux.total ? aux.sofars[i] / aux.total : 0,
            transform: `rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`,
          }]),
          { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
        );

        if (wasPaused || (aux.count === 0 && props.init.paused)) {
          api.pause();
        }
        api.aux.count++;
      },
      onDraggedSrcNode() {
        state.updateNavPath(state.srcApi.getPosition());
        state.followNavPath();
      },
      onClickedSrcNode() {
        if (api.is('finished')) {
          state.reverseNavPath();
          api.geom.animPath = api.geom.navPath.slice();
          state.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
          state.followNavPath();
        } else if (api.is('paused')) {
          const npcPos = api.getPosition();
          const found = api.geom.navPathPolys.findIndex(p => p.contains(npcPos));
          if (found === -1) {
            return console.warn(`onClickedSrcNode: failed to find npc on its navPath`);
          }
          api.geom.animPath = (api.geom.navPath.slice(0, found + 1).concat(npcPos)).reverse();
          state.reverseNavPath();
          state.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
          state.followNavPath();
        } else {
          state.togglePaused();
        }
      },
      onDraggedDstNode() {
        state.updateNavPath(state.dstApi.getPosition());
        state.followNavPath();
      },
      onClickedDstNode() {
        state.togglePaused();
      },
      reverseNavPath() {
        api.geom.navPath.reverse();
        api.geom.navPathPolys.reverse();
        state.el.path.setAttribute('points', `${api.geom.navPath}`);
        state.swapNodes();
      },
      /** @param {SVGGElement} el */
      rootRef(el) {
        if (el && !state.mounted) {
          state.el.npc = /** @type {*} */ (el.querySelector('g.npc'));
          state.el.dir = /** @type {*} */ (el.querySelector('g.npc > line'));
          state.el.path = /** @type {*} */ (el.querySelector('polyline.navpath'));
          api.move = state.el.npc.animate([
            { transform: `translate(0px, 0px)` }, // Extra frame for polyfill
            { transform: `translate(${props.init.src.x}px, ${props.init.src.y}px)` },
          ], { fill: 'forwards' });
          api.look = state.el.dir.animate([
            { transform: `rotateZ(0rad)` }, // Extra frame for polyfill
            { transform: `rotateZ(${props.init.angle}rad)` },
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
          state.api.play();
        } else {
          state.api.pause();
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
       * Compute navpath from NPC's current position to `dst`.
       * @param {Geom.Vect} dst
       */
      updateNavPath(dst) {
        const dstGroupId = pathfinding.getGroup(props.init.zoneKey, dst);
        if (dstGroupId === null) {
          return console.warn(`computeNavPath: dst: ${dst.x}, ${dst.y}: no group found`);
        } else if (dstGroupId !== api.aux.groupId) {
          // NOTE props.init.groupId never changes
          return console.warn(`computeNavPath: (src, dst) have different groupIds: (${api.aux.groupId}, ${dstGroupId})`);
        }

        const npcPos = api.getPosition();
        const computedPath = pathfinding.findPath(npcPos, dst, props.init.zoneKey, api.aux.groupId)?.path || [];
        api.geom.navPath = ([Vect.from(npcPos)].concat(computedPath));
        api.geom.animPath = api.geom.navPath.slice(); // Same initially
        // Move src node to current NPC position
        state.srcApi.moveTo(npcPos), state.dstApi.moveTo(dst);
        state.el.path.setAttribute('points', `${api.geom.navPath}`);
        state.updateAnimAux();
        api.geom.navPathPolys = api.aux.edges.map(e => {
          const normal = e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(0.01);
          return new Poly([e.p.clone().add(normal), e.q.clone().add(normal), e.q.clone().sub(normal), e.p.clone().sub(normal)]);
        })
      },
    };
  });

  React.useLayoutEffect(() => {
    if (state.api.aux.count === 0) {// Guarded to prevent HMR reset
      state.updateNavPath(Vect.from(props.init.dst));
      state.followNavPath();
    }
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
          shouldCancel={(curr, next) => state.shouldCancelDrag(curr, next, 'src')}
          onClick={state.onClickedSrcNode}
        />
        <DraggableNode
          initial={props.init.dst}
          radius={nodeRadius}
          onLoad={api => state.dstApi = api}
          onStop={state.onDraggedDstNode}
          shouldCancel={(curr, next) => state.shouldCancelDrag(curr, next, 'dst')}
          onClick={state.onClickedDstNode}
        />
      </g>

      <g className="npc">
        <circle fill="#f99" stroke="black" strokeWidth={2} r={9} />
        <line stroke="black" strokeWidth={2} x2={9} />
      </g>

    </g>
  );
}

const nodeRadius = 24;

const rootCss = css`
  polyline.navpath {
    fill: none;
    stroke: #304075;
    stroke-width: 1;
    stroke-dasharray: 6px 6px;
    stroke-dashoffset: 0px;
  }

  g.npc {
    pointer-events: none;
  }
`;
