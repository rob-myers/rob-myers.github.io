import { Poly, Vect } from "../geom";
import { pathfinding } from '../pathfinding/Pathfinding';

/**
 * @param {NPC.NPCApi} api
 * @returns {NPC.InternalNpcApi}
 */
export function getInternalNpcApi(api) {
  const { def } = api;
  return {
    shouldCancelDrag(curr, next, type) {
      if (pathfinding.getGroup(def.zoneKey, next) === null) {
        return true; // NOTE currently permit ends to lie in distinct groups
      }
      const dragging = curr.distanceTo(next) >= 20;
      const npcPos = api.getPosition();
      const other = type === 'src' ? api.dstApi.getPosition() : api.srcApi.getPosition();

      return dragging && (
        next.distanceTo(npcPos) <= 2 * navNodeRadius // Near NPC
        || next.distanceTo(other) <= 2 * navNodeRadius // Near other end
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
      api.look = api.el.look.animate(
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
      api.el.look = /** @type {*} */ (api.el.npc.querySelector('g.look'));
      api.el.path = /** @type {*} */ (rootGrp.querySelector(`polyline.navpath.${def.key}`));

      api.move = api.el.npc.animate([
        { transform: `translate(0px, 0px)` }, // Extra frame for polyfill
        { transform: `translate(${def.src.x}px, ${def.src.y}px)` },
      ], { fill: 'forwards' });
      api.look = api.el.look.animate([
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
  };
}

export const navNodeRadius = 24
