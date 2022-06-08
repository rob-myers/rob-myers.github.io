import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { merge, of, Subject } from "rxjs";
import { filter, first, map, take } from "rxjs/operators";
import { removeCached, setCached } from "../service/query-client";
import { otag } from "../service/rxjs";
import { Poly, Rect, Vect } from "../geom";
import { animScaleFactor, flattenLocalNavPath, isGlobalNavPath, isLocalNavPath, isNpcActionKey } from "../service/npc";
import createNpc from "./create-npc";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";
import NPC from "./NPC";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const nav = useGeomorphsNav(props.gmGraph, props.disabled);

  const state = useStateRef(/** @type {() => NPC.FullApi} */ () => ({
    npc: {},
    path: {}, 
    events: new Subject,

    ready: true,
    class: { Vect },
    rxjs: { filter, first, map, take, otag }, // TODO remove?

    getGlobalNavPath(src, dst) {
      const {gms} = props.gmGraph
      const srcGmId = gms.findIndex(x => x.gridRect.contains(src));
      const dstGmId = gms.findIndex(x => x.gridRect.contains(dst));
      if (srcGmId === -1 || dstGmId === -1) {
        throw Error(`getGlobalNavPath: src/dst must be inside some geomorph's aabb`)
      } else if (srcGmId === dstGmId) {
        return {
          key: 'global-nav',
          paths: [state.getLocalNavPath(srcGmId, src, dst)],
          edges: [],
        };
      } else {
        // Compute global strategy
        const gmEdges = props.gmGraph.findPath(src, dst);
        if (!gmEdges) {
          throw Error(`getGlobalNavPath: gmGraph.findPath not found: ${JSON.stringify(src)} -> ${JSON.stringify(dst)}`);
        }
        console.log('gmEdges', gmEdges); // DEBUG

        const paths = /** @type {NPC.LocalNavPath[]} */ ([]);
        for (let k = 0; k < gmEdges.length + 1; k++) {
          if (k === 0) {// Initial
            paths[k] = state.getLocalNavPath(srcGmId, src, gmEdges[0].srcExit);
          } else if (k === gmEdges.length) {// Final
            paths[k] = state.getLocalNavPath(dstGmId, gmEdges[k - 1].dstEntry, dst);
          } else {// Intermediate
            paths[k] = state.getLocalNavPath(gmEdges[k - 1].dstGmId, gmEdges[k - 1].dstEntry, gmEdges[k].srcExit);
          }
        }
        return {
          key: 'global-nav',
          paths,
          edges: gmEdges,
        };
      }
    },
    getLocalNavPath(gmId, src, dst) {
      const gm = props.gmGraph.gms[gmId];
      const pf = nav.pfs[gmId];
      const localSrc = gm.inverseMatrix.transformPoint(Vect.from(src));
      const localDst = gm.inverseMatrix.transformPoint(Vect.from(dst));

      const result = pf.graph.findPath(localSrc, localDst);

      if (result) {
        return {
          key: 'local-nav',
          gmId,
          // Transform into world coordinates
          seq: result.seq.map(x => 
            Array.isArray(x)
              ? x.map(p => gm.matrix.transformPoint(p).precision(2))
              : {
                  ...x,
                  start: gm.matrix.transformPoint(Vect.from(x.start)).precision(2),
                  stop: gm.matrix.transformPoint(Vect.from(x.stop)).precision(2),
                }
          )
        };
      } else {
        return { key: 'local-nav', paths: [], edges: [], gmId, seq: [] };
      }
    },
    getNpcGlobalNav(e) {
      if (!(e.npcKey && typeof e.npcKey === 'string' && e.npcKey.trim())) {
        throw Error(`invalid npc key: ${JSON.stringify(e.npcKey)}`);
      } else if (!(e.point && typeof e.point.x === 'number' && typeof e.point.y === 'number')) {
        throw Error(`invalid point: ${JSON.stringify(e.point)}`);
      } else if (!state.isPointLegal(e.point)) {
        throw Error(`outside navPoly: ${JSON.stringify(e.point)}`);
      }
      const npc = state.npc[e.npcKey];
      if (!npc) {
        throw Error(`npc "${e.npcKey}" does not exist`);
      }
      const result = state.getGlobalNavPath(npc.getPosition(), e.point);
      if (e.debug) {
        const points = (result?.paths??[]).reduce((agg, item) => agg.concat(...flattenLocalNavPath(item)), /** @type {Geom.Vect[]} */ ([]));
        state.toggleDebugPath({ pathKey: e.npcKey, points })
      }
      return result;
    },
    getNpc(e) {
      const npc = state.npc[e.npcKey];
      if (!npc) {
        throw Error(`npc "${e.npcKey}" does not exist`);
      }
      return npc;
    },
    getPanZoomApi() {
      return props.panZoomApi;
    },
    isPointLegal(p) {
      const gmId = props.gmGraph.gms.findIndex(x => x.gridRect.contains(p));
      if (gmId === -1) return false;
      const { navPoly, inverseMatrix } = props.gmGraph.gms[gmId];
      const localPoint = inverseMatrix.transformPoint(Vect.from(p));
      return navPoly.some(poly => poly.contains(localPoint));
    },
    async npcAct(e) {
      const npc = state.npc[e.npcKey];
      if (!npc) {
        throw Error(`npc does not exist: "${e.npcKey}"`);
      } else if (!isNpcActionKey(e.action)) {
        throw Error(`${e.npcKey} unrecognised action: "${e.action}"`);
      }

      if (e.action === 'cancel') {
        // Cancel current animation
        await npc.cancel();
      } else if (e.action === 'pause') {
        // Pause current animation
        await npc.pause();
      } else if (e.action === 'play') {
        // Resume current animation
        await npc.play();
      } else if (e.action === 'set-player') {
        state.events.next({ key: 'set-player', npcKey: e.npcKey });
      }
    },
    async panZoomTo(e) {
      if (!e || (e.zoom && !Number.isFinite(e.zoom)) || (e.point && !Vect.isVectJson(e.point)) || (e.ms && !Number.isFinite(e.ms))) {
        throw Error(`expected format: { zoom?: number; point?: { x: number; y: number }; ms: number; easing?: string }`);
      }
      try {
        await props.panZoomApi.panZoomTo(e.zoom, e.point, e.ms, e.easing);
        return 'completed';
      } catch (e) {
        return 'cancelled';
      }
    },
    spawn(e) {
      if (!(e.npcKey && typeof e.npcKey === 'string' && e.npcKey.trim())) {
        throw Error(`invalid npc key: ${JSON.stringify(e.npcKey)}`);
      } else if (!(e.point && typeof e.point.x === 'number' && typeof e.point.y === 'number')) {
        throw Error(`invalid point: ${JSON.stringify(e.point)}`);
      } else if (!state.isPointLegal(e.point)) {
        throw Error(`cannot spawn outside navPoly: ${JSON.stringify(e.point)}`);
      }
      state.npc[e.npcKey]= createNpc(e.npcKey, e.point, {
        disabled: props.disabled,
        panZoomApi: props.panZoomApi,
        npcs: state,
      });
      update();
    },
    toggleDebugPath(e) {
      if (e.points) {
        const path = e.points.map(Vect.from);
        state.path[e.pathKey] = { path, aabb: Rect.from(...path).outset(10) };
      } else {
        delete state.path[e.pathKey];
      }
      update();
    },
    /**
     * TODO move to shell function?
     */
    trackNpc(opts) {
      const { npcKey, process } = opts;
      if (!state.npc[npcKey]) {
        throw Error(`npc "${npcKey}" does not exist`);
      }

      let status = /** @type {'no-track' | 'follow-walk' | 'panzoom-to'} */ ('no-track');

      const subscription = merge(
        of({ key: /** @type {const} */ ('init-track') }),
        state.events,
        props.panZoomApi.events,
      ).pipe(
        filter(x => (
          process.status === 1 && (
            x.key === 'init-track'
            || x.key === 'ui-idle'
            || x.key === 'resized-bounds'
            || x.key === 'cancelled-panzoom-to'
            || x.key === 'completed-panzoom-to'
            || (x.key === 'started-walking' && x.npcKey === npcKey)
            || (x.key === 'stopped-walking' && x.npcKey === npcKey)
          )
        )),
      ).subscribe({
        async next(msg) {
          // console.log(msg); // DEBUG
          if (!props.panZoomApi.isIdle() && msg.key !== 'started-walking') {
            status = 'no-track';
            console.warn('@', status);
            return;
          }

          const npc = state.npc[npcKey];
          const npcPosition = npc.getPosition();
          
          if (// Only when: npc idle, camera not animating, camera not close
            npc.anim.spriteSheet === 'idle'
            && (props.panZoomApi.anims[0] === null || props.panZoomApi.anims[0].playState === 'finished')
            && props.panZoomApi.distanceTo(npcPosition) > 10
          ) {
            status = 'panzoom-to';
            console.warn('@', status);
            // Ignore Error('cancelled')
            try { await props.panZoomApi.panZoomTo(2, npcPosition, 2000) } catch {}
            status = 'no-track';
          }

          if (msg.key === 'started-walking') {
            status = 'follow-walk';
            console.warn('@', status);
            try {
              const path = npc.getTargets().map(x => Vect.from(x.point)); // TODO arriveMs?
              await props.panZoomApi.followPath(path, { animScaleFactor });
            } catch {} // Ignore Error('cancelled')
          }
        },
      });
      
      return subscription;
    },
    async walkNpc(e) {
      const npc = state.npc[e.npcKey];
      if (!npc) {
        throw Error(`npc "${e.npcKey}" does not exist`);
      } else if ('key' in e) {
        if (!(e.key === 'local-nav' || e.key === 'global-nav')) {
          throw Error(`invalid key: ${JSON.stringify(e)}`);
        } else if (e.key === 'local-nav' && !isLocalNavPath(e)) {
          throw Error(`invalid local navpath: ${JSON.stringify(e)}`);
        } else if (e.key === 'global-nav' && !isGlobalNavPath(e)) {
          throw Error(`invalid global navpath: ${JSON.stringify(e)}`);
        }
      } else if ('points' in e && !(e.points?.every?.(Vect.isVectJson))) {
        throw Error(`invalid points: ${JSON.stringify(e.points)}`);
      }

      try {
        if ('points' in e) {

          // Walk along path `points`, ignoring doors
          await npc.followNavPath(e.points);

        } else if (e.key === 'global-nav') {

          // Walk along a global navpath
          const globalNavPath = e;
          const allPoints = globalNavPath.paths.reduce((agg, item) => agg.concat(...flattenLocalNavPath(item)), /** @type {Geom.Vect[]} */ ([]));
          const doorMetas = props.gmGraph.computeDoorMetas(globalNavPath);
          console.log('doorMetas', doorMetas);
          // Below finishes by setting spriteSheet idle
          await npc.followNavPath(allPoints, { doorMetas });

        } else if (e.key === 'local-nav') {
          for (const [i, vectPath] of e.seq.entries()) {
            /**
             * TODO
             */
          }
        }
      } catch (err) {
        state.events.next({ key: 'stopped-walking', npcKey: e.npcKey });
        if (err instanceof Error && err.message === 'cancelled') {
          console.log(`${e.npcKey}: walkNpc cancelled`);
        } else {
          throw err;
        }
      }
    },
  }), { deps: [nav, props.doorsApi] });
  
  
  React.useEffect(() => {
    setCached(props.npcsKey, state);
    props.onLoad(state);

    // On HMR, refresh each npc via remount
    Object.values(state.npc).forEach(npc => {
      delete state.npc[npc.key];
      state.spawn({ npcKey: npc.key, point: npc.getPosition() });
    });

    return () => {
      removeCached(props.npcsKey);
    };
  }, [props.panZoomApi]);

  return (
    <div className={classNames('npcs', rootCss)}>
      <Debug
        debugPath={state.path}
      />

      {Object.values(state.npc).map(npc => (
        <NPC
          // Respawn remounts
          key={`${npc.key}@${npc.spawnedAt}`}
          npc={npc}
        />
      ))}
    </div>
  );
}

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
    pointer-events: none;
  }
  .npc {
    position: absolute;
    pointer-events: none;
  }
  svg.debug-path {
    position: absolute;
    pointer-events: none;
  }
`;

/**
 * @param {{ debugPath: Record<string, { path: Geom.Vect[]; aabb: Rect; }> }} props 
 */
function Debug(props) {
  return <>
    {Object.entries(props.debugPath).map(([key, {path, aabb}]) => (
      <svg
        key={key}
        className="debug-path"
        width={aabb.width}
        height={aabb.height}
        style={{ left: aabb.x, top: aabb.y }}
      >
        <g style={{ transform: `translate(${-aabb.x}px, ${-aabb.y}px)` }}>
          <polyline fill="none" stroke="#88f" strokeDasharray="2 2" strokeWidth={1} points={`${path}`} />
          {path.map(p => (
            <circle fill="none" stroke="#ff444488" r={2} cx={p.x} cy={p.y} />
          ))}
        </g>
      </svg>
    ))}  
  </>
}
