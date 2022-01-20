import React from "react";
import { css } from "goober";
import { Poly, Vect } from "../geom";
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from "./DraggableNode";

// TODO ensure exactly one group in each zone
// TODO listen for changes to props.npcs

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const [state] = React.useState(() => {
    
    const { defs } = props;
    const groupIds = defs.map(def => pathfinding.getGroup(def.zoneKey, def.src)); // Assume zones exist
    groupIds.forEach((x, i) => x === null && console.warn(`NPC: ${defs[i].key}: init.src: ${defs[i].src.x}, ${defs[i].src.y}: no group found`));

    const apis = defs.map((def, i) => {
      /** @type {NPC.NPCApi} */
      const api = {
        key: def.key,
        def,
        el: {
          npc: /** @type {SVGGElement} */ ({}),
          dir: /** @type {SVGLineElement} */ ({}),
          path: /** @type {SVGPolylineElement} */ ({}),
        },
        srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
        dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),

        move: /** @type {Animation} */ ({}),
        look: /** @type {Animation} */ ({}),
        geom: { animPath: [], navPath: [], navPathPolys: [] },
        aux: { groupId: groupIds[i], count: 0, edges: [], elens: [], sofars: [], total: 0, angs: [] },

        getPosition() {
          // https://stackoverflow.com/a/4976554/2917822
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(api.el.npc).transform);
          return new Vect(matrix.m41, matrix.m42);
        },
        /** @param {AnimationPlayState} ps */
        is: (ps) => api.move.playState === ps,
        pause: () => {
          if (api.is('running')) {
            api.move.pause(), api.look.pause();
          }
        },
        play: () => {
          api.move.play(); api.look.play();
        },

        _:  {
          shouldCancelDrag(curr, next, type) {
            if (pathfinding.getGroup(def.zoneKey, next) === null) {
              return true; // NOTE currently permit ends to lie in distinct groups
            }
            const dragging = curr.distanceTo(next) >= 20;
            const npcPos = api.getPosition();
            const other = type === 'src' ? api.dstApi.getPosition() : api.srcApi.getPosition();

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
            api.move = api.el.npc.animate(
              // NOTE need ≥ 2 frames for polyfill
              animPath.map((p, i) => ({
                offset: aux.total ? aux.sofars[i] / aux.total : 0,
                transform: `translate(${p.x}px, ${p.y}px)`,
              })),
              { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
            );
    
            api.look.cancel();
            api.look = api.el.dir.animate(
              animPath.flatMap((p, i) => [{
                offset: aux.total ? aux.sofars[i] / aux.total : 0,
                transform: `rotateZ(${aux.angs[i - 1] || 0}rad)`,
              }, {
                offset: aux.total ? aux.sofars[i] / aux.total : 0,
                transform: `rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`,
              }]),
              { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
            );
    
            if (wasPaused || (aux.count === 0 && def.paused)) {
              api.pause();
            }
            api.aux.count++;
          },
          /** @param {SVGGElement} rootGrp */
          initialize(rootGrp) {
            api.el.npc = /** @type {*} */ (rootGrp.querySelector(`g.npc.${def.key}`));
            api.el.dir = /** @type {*} */ (api.el.npc.querySelector('line'));
            api.el.path = /** @type {*} */ (rootGrp.querySelector(`polyline.navpath.${def.key}`));

            api.move = api.el.npc.animate([
              { transform: `translate(0px, 0px)` }, // Extra frame for polyfill
              { transform: `translate(${def.src.x}px, ${def.src.y}px)` },
            ], { fill: 'forwards' });
            api.look = api.el.dir.animate([
              { transform: `rotateZ(0rad)` }, // Extra frame for polyfill
              { transform: `rotateZ(${def.angle}rad)` },
            ], { fill: 'forwards' });
          },
          onDraggedSrcNode() {
            api._.updateNavPath(api.srcApi.getPosition());
            api._.followNavPath();
          },
          onClickedSrcNode() {
            if (api.is('finished')) {
              api._.reverseNavPath();
              api.geom.animPath = api.geom.navPath.slice();
              api._.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
              api._.followNavPath();
            } else if (api.is('paused')) {
              const npcPos = api.getPosition();
              const found = api.geom.navPathPolys.findIndex(p => p.contains(npcPos));
              if (found === -1) {
                return console.warn(`onClickedSrcNode: failed to find npc on its navPath`);
              }
              api.geom.animPath = (api.geom.navPath.slice(0, found + 1).concat(npcPos)).reverse();
              api._.reverseNavPath();
              api._.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
              api._.followNavPath();
            } else {
              api._.togglePaused();
            }
          },          
          onDraggedDstNode() {
            api._.updateNavPath(api.dstApi.getPosition());
            api._.followNavPath();
          },
          onClickedDstNode() {
            api._.togglePaused();
          },
          reverseNavPath() {
            api.geom.navPath.reverse();
            api.geom.navPathPolys.reverse();
            api.el.path.setAttribute('points', `${api.geom.navPath}`);
            api._.swapNodes();
          },
          swapNodes() {
            const [src, dst] = [api.srcApi.getPosition(), api.dstApi.getPosition()];
            api.srcApi.moveTo(dst), api.dstApi.moveTo(src);
          },
          togglePaused: () => {
            if (api.is('finished')) {
              return;
            } else if (api.is('paused')) {
              api.play();
            } else {
              api.pause();
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
          updateNavPath(dst) {
            const dstGroupId = pathfinding.getGroup(def.zoneKey, dst);
            if (dstGroupId === null) {
              return console.warn(`computeNavPath: dst: ${dst.x}, ${dst.y}: no group found`);
            } else if (dstGroupId !== api.aux.groupId) {
              // NOTE props.init.groupId never changes
              return console.warn(`computeNavPath: (src, dst) have different groupIds: (${api.aux.groupId}, ${dstGroupId})`);
            }
    
            const npcPos = api.getPosition();
            const computedPath = pathfinding.findPath(npcPos, dst, def.zoneKey, api.aux.groupId)?.path || [];
            api.geom.navPath = ([Vect.from(npcPos)].concat(computedPath));
            api.geom.animPath = api.geom.navPath.slice(); // Same initially
            // Move src node to current NPC position
            api.srcApi.moveTo(npcPos), api.dstApi.moveTo(dst);
            api.el.path.setAttribute('points', `${api.geom.navPath}`);
            api._.updateAnimAux();
            api.geom.navPathPolys = api.aux.edges.map(e => {
              const normal = e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(0.01);
              return new Poly([e.p.clone().add(normal), e.q.clone().add(normal), e.q.clone().sub(normal), e.p.clone().sub(normal)]);
            })
          },
        },
      };
      return api;
    });

    /** @type {NPC.NPCsApi} */
    const api = {
      apis,
      for: apis.reduce((agg, api) => ({ ...agg, [api.key]: api }), {}),
      // TODO ...
    };
    props.onLoad(api);

    return {
      apis,
      api,
      /** @type {React.RefCallback<SVGGElement>} */
      rootRef(el) {
        if (el) {
          state.apis.forEach(api => {
            api._.initialize(el);
            api._.updateNavPath(Vect.from(api.def.dst));
            api._.followNavPath();
          });
        }
      },
    };
  });

  return (
    <g
      className={rootCss}
      ref={state.rootRef}
    >

      <g className="navpaths">
        {state.apis.map(api => 
          <g key={api.key}>
            <polyline className={`navpath ${api.key}`} />
            <DraggableNode
              initial={api.def.src}
              radius={nodeRadius}
              onLoad={nodeApi => api.srcApi = nodeApi}
              onStop={api._.onDraggedSrcNode}
              shouldCancel={(curr, next) => api._.shouldCancelDrag(curr, next, 'src')}
              onClick={api._.onClickedSrcNode}
            />
            <DraggableNode
              initial={api.def.dst}
              radius={nodeRadius}
              onLoad={nodeApi => api.dstApi = nodeApi}
              onStop={api._.onDraggedDstNode}
              shouldCancel={(curr, next) => api._.shouldCancelDrag(curr, next, 'dst')}
              onClick={api._.onClickedDstNode}
            />
          </g>
        )}
      </g>

      {state.apis.map(api => 
        <g key={api.key} className={`npc ${api.key}`}>
          <circle fill="#f99" stroke="black" strokeWidth={2} r={9} />
          <line stroke="black" strokeWidth={2} x2={9} />
        </g>
      )}

    </g>
  );
}

const nodeRadius = 24;

const rootCss = css`
  g.npc {
    pointer-events: none;
  }
  polyline.navpath {
    fill: none;
    stroke: black;
    stroke-width: 1;
    stroke-dasharray: 6px 6px;
    stroke-dashoffset: 0px;
  }
`;
