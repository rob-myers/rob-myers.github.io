import { zoneKeyToQueryKey } from "projects/hooks/use-pathfinding";
import { getCached } from "projects/service/query-client";
import { Poly, Vect } from "../../geom";

/**
 * @param {NPCTest.NPCApi} api
 */
export function getInternalNpcApi(api) {
  const { def } = api;

  /** @type {NPCTest.InternalNpcApi} */
  const internal = {

    followNavPath() {
      const { geom: { animPath }, aux } = api;
      if (animPath.length <= 1 || aux.total === 0) {// Already finished
        api.rayApi.enable(api.getPosition(), api.getNPCAngle());
        return;
      }
      
      const wasPaused = api.move.playState === 'paused';
      api.move = api.el.npc.animate(// NOTE need ≥ 2 frames for polyfill
        animPath.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad)`,
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`,
          },
        ]),
        { duration: aux.total * 15, direction: 'normal', fill: 'forwards' },
      );
      api.move.addEventListener('finish', internal.onFinishMove);

      api.rayApi.disable();
      if (wasPaused || (aux.count === 0 && def.paused)) {
        api.pause();
        api.rayApi.enable(api.getPosition(), api.getNPCAngle());
      }
      api.aux.count++;
    },

    /** @param {SVGGElement} rootGrp */
    initialize(rootGrp) {
      api.el.npc = /** @type {*} */ (rootGrp.querySelector(`g.npc.${def.key}`));
      api.el.look = /** @type {*} */ (api.el.npc.querySelector('g.look'));
      api.el.path = /** @type {*} */ (rootGrp.querySelector(`polyline.navpath.${def.key}`));
      api.el.dots = /** @type {*} */ (rootGrp.querySelector(`g.navdots.${def.key}`));

      api.move = new Animation;
      api.el.npc.style.transform = `translate(${def.src.x}px, ${def.src.y}px)`;
      api.look = new Animation;
      api.el.look.style.transform = `rotateZ(${def.angle}rad)`;
    },

    onDraggedSrcNode() {
      internal.resetLook();
      internal.updateNavPath(api.srcApi.getPosition());
      internal.followNavPath();
    },

    onClickedSrcNode() {
      if (api.move.playState === 'finished') {
        internal.reverseNavPath();
        api.geom.animPath = api.geom.navPath.slice();
        internal.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
        internal.followNavPath();
      } else if (api.move.playState === 'paused') {
        const position = api.getPosition();
        const found = api.geom.navPathPolys.findIndex(p => p.contains(position));
        if (found === -1) {
          return console.warn(`onClickedSrcNode: failed to find npc on its navPath`);
        }
        api.geom.animPath = (api.geom.navPath.slice(0, found + 1).concat(position)).reverse();
        internal.reverseNavPath();
        internal.updateAnimAux(); // Or could reverse {edges, elens, sofars, angs}
        internal.followNavPath();
      } else {
        internal.togglePaused();
      }
    },
      
    onDraggedDstNode() {
      internal.resetLook();
      internal.updateNavPath(api.dstApi.getPosition());
      internal.followNavPath();
    },

    onClickedDstNode() {
      internal.togglePaused();
    },

    onDragLookRay(target) {
      const srcAngle = api.getLookAngle();
      const delta = target.clone().sub(api.getPosition());
      // Must take NPC angle into account
      let dstAngle = Math.atan2(delta.y, delta.x) - api.getNPCAngle();
      // Ensure shortest turn is taken
      if (dstAngle - srcAngle > Math.PI) {
        dstAngle -= 2 * Math.PI;
      } else if (dstAngle - srcAngle < -Math.PI) {
        dstAngle += 2 * Math.PI;
      }
      
      api.look.cancel();
      api.el.look.style.transform = `rotateZ(${dstAngle}rad)`;
      api.look = api.el.look.animate(
        [
          { transform: `rotateZ(${srcAngle.toFixed(2)}rad)` },
          { transform: `rotateZ(${dstAngle.toFixed(2)}rad)` },
        ],
        { duration: 150, direction: 'normal' },
      );
    },

    onFinishMove() {
      api.rayApi.enable(api.getPosition(), api.getNPCAngle());
    },

    resetLook() {
      api.el.look.style.transform = `rotateZ(0rad)`;
    },

    renderNavPath() {
      api.el.path.setAttribute('points', `${api.geom.navPath}`);
      Array.from(api.el.dots.childNodes).forEach(node => node.remove());
      api.geom.navPath.forEach(p => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', `${p.x}`), dot.setAttribute('cy', `${p.y}`);
        dot.setAttribute('r', `2`);
        api.el.dots.appendChild(dot);
      })
    },

    reverseNavPath() {
      api.geom.navPath.reverse();
      api.geom.navPathPolys.reverse();
      internal.renderNavPath();
      internal.swapNavNodes();
      internal.resetLook(); // Possibly don't reset?
    },

    shouldCancelNavDrag(curr, next, type) {
      const dragging = curr.distanceTo(next) >= 20;
      const npcPos = api.getPosition();
      const other = type === 'src' ? api.dstApi.getPosition() : api.srcApi.getPosition();

      return dragging && (
        next.distanceTo(npcPos) <= 2 * navNodeRadius // Near NPC
        || next.distanceTo(other) <= 2 * navNodeRadius // Near other end
      );
    },

    swapNavNodes() {
      const [src, dst] = [api.srcApi.getPosition(), api.dstApi.getPosition()];
      api.srcApi.moveTo(dst), api.dstApi.moveTo(src);
    },

    togglePaused: () => {
      if (api.move.playState === 'finished') {
        return;
      } else if (api.move.playState === 'paused') {
        api.rayApi.disable();
        api.play();
      } else {
        api.rayApi.enable(api.getPosition(), api.getNPCAngle());
        api.pause();
      }
    },

    updateAnimAux() {
      const { geom: { animPath }, aux } = api;
      aux.edges = animPath.map((p, i) => ({ p, q: animPath[i + 1] })).slice(0, -1);
      aux.elens = aux.edges.map(({ p, q }) => Number(p.distanceTo(q).toFixed(2)));
      const reduced = aux.elens.reduce((agg, length) => {
        agg.total += length;
        agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
        return agg;
      }, { sofars: [0], total: 0 });
      [aux.sofars, aux.total] = [reduced.sofars, reduced.total];
      aux.angs = aux.edges.map(e => Number(Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x).toFixed(2)));
    },

    updateNavPath(dst) {
      const npcPos = api.getPosition();
      /** @type {NPC.PfData} */
      const pf = (getCached(zoneKeyToQueryKey(def.zoneKey)));
      const computedPath = pf?.graph.findPath(npcPos, dst)?.path || [];
      computedPath.forEach(p => p.precision(2));
      api.geom.navPath = ([Vect.from(npcPos)].concat(computedPath));
      api.geom.animPath = api.geom.navPath.slice(); // Same initially
      // Move src node to current NPC position
      api.srcApi.moveTo(npcPos), api.dstApi.moveTo(dst);
      internal.renderNavPath();
      internal.updateAnimAux();
      // Approximate navpath using a bunch of thin rects
      api.geom.navPathPolys = api.aux.edges.map(e => {
        const normal = e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(0.01);
        return new Poly([e.p.clone().add(normal), e.q.clone().add(normal), e.q.clone().sub(normal), e.p.clone().sub(normal)]);
      })
    },
  };
  return internal;
}

export const navNodeRadius = 24
