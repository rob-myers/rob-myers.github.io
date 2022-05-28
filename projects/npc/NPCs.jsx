import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { firstValueFrom, merge, Subject } from "rxjs";
import { filter, first, map, take } from "rxjs/operators";
import { removeCached, setCached } from "../service/query-client";
import { otag } from "../sh/rxjs";
import { Poly, Rect, Vect } from "../geom";
import { isGlobalNavPath, isLocalNavPath, isNpcActionKey } from "../service/npc";
import createNpc from "./create-npc";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";



/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const nav = useGeomorphsNav(props.gmGraph, props.disabled);

  const state = useStateRef(() => {

    /** @type {NPC.FullApi} */
    const output = {
      npc: {},
      path: {}, 
      events: new Subject,
      
      ready: true,
      class: { Vect },
      rxjs: { filter, first, map, take, otag }, // TODO remove?

      async awaitPanZoomIdle() {
        if (!props.panZoomApi.isIdle()) {
          await firstValueFrom(props.panZoomApi.events.pipe(
            filter(x => x.key === 'ui-idle'),
            first(),
          ));
        }
      },
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
          // console.log({gmEdges});

          const paths = /** @type {NPC.LocalNavPath[]} */ ([]);
          for (let k = 0; k < gmEdges.length + 1; k++) {
            if (k === 0) {
              paths[k] = state.getLocalNavPath(srcGmId, src, gmEdges[0].srcExit);
            } else if (k === gmEdges.length) {
              paths[k] = state.getLocalNavPath(dstGmId, gmEdges[k - 1].dstEntry, dst);
            } else {
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
            paths: result.paths.map(path => path.map(p => gm.matrix.transformPoint(p).precision(2))),
            edges: result.edges,
          };
        } else {
          return { key: 'local-nav', gmId, paths: [], edges: [] };
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
          const points = (result?.paths??[]).reduce((agg, item) => agg.concat(...item.paths), /** @type {Geom.Vect[]} */ ([]));
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
      npcRef(rootEl) {
        if (rootEl) {// NPC mounted
          const npcKey = /** @type {string} */ (rootEl.getAttribute('data-npc-key'));
          const npc = state.npc[npcKey];
          npc.el.root = rootEl;
          npc.el.body = /** @type {HTMLDivElement} */ (rootEl.childNodes[0]);
          npc.el.root.style.transform = `translate(${npc.def.position.x}px, ${npc.def.position.y}px)`;
          npc.el.body.style.transform = `scale(${npcScale}) rotate(${npcOffsetAngleDeg}deg)`;
          npc.startAnimation(); // Start idle animation
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
        state.npc[e.npcKey] = createNpc(e.npcKey, e.point, {
          disabled: props.disabled,
          panZoomApi: props.panZoomApi,
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
      // /**
      //  * TODO 🚧 probably total rewrite
      //  * - better/clearer approach to `status`
      //  * - trigger tracking on tab resize
      //  * - trigger tracking initially
      //  */
      // trackNpc(opts) {
      //   let paused = false;
      //   /** Used to separate tracking types */
      //   let status = /** @type {null | 'track-walk' | 'track-idle'} */ (null);

      //   const subscription = merge(state.events, props.panZoomApi.events).pipe(
      //     filter(x => (
      //       !paused
      //       && x.key === 'ui-idle'
      //       || (x.key === 'started-walking' && x.npcKey === opts.npcKey)
      //       || (x.key === 'stopped-walking' && x.npcKey === opts.npcKey)
      //     ))
      //   ).subscribe({
      //     async next(e) {
      //       const npc = state.npc[opts.npcKey];
      //       if (!props.panZoomApi.isIdle()) {
      //         status = null; // Releases status, yet maybe dodgy
      //         return;
      //       } else if (e.key === 'started-walking' || npc.anim.spriteSheet === 'walk') {
      //         // props.panZoomApi.cancelAnimations();
      //         while (npc.anim.spriteSheet === 'walk') {
      //           console.log(status = 'track-walk')
      //           for (const target of npc.getTargets()) {
      //             await props.panZoomApi.panZoomTo(2, target.point, 2 * target.arriveMs, 'linear');
      //           }
      //         }
      //         status = null;

      //       } else if (
      //         (e.key === 'stopped-walking' || npc.anim.spriteSheet === 'idle')
      //         && status === null
      //       ) {
      //         console.log(status = 'track-idle')
      //         try {
      //           const npcPosition = npc.getPosition();
      //           await props.panZoomApi.panZoomTo(2, npcPosition, 2000);
      //         } catch (e) {
      //           console.error(e)
      //         }
      //         status = null;
      //       }
      //     }
      //   });
      //   return {
      //     subscription,
      //     /** @param {boolean} next */
      //     setPaused(next) {
      //       paused = next;
      //       // TODO cancel ongoing animation on pause
      //     }
      //   };
      // },
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
            state.events.next({ key: 'started-walking', npcKey: e.npcKey });
            await npc.followNavPath(e.points);
            state.events.next({ key: 'stopped-walking', npcKey: e.npcKey });

          } else if (e.key === 'global-nav') {
            /**
             * TODO
             * - one big animation ✅
             * - detect when moves through door 🚧
             * - wrap animation creation with "events" 🚧
             */

            // Walk along a global navpath
            state.events.next({ key: 'started-walking', npcKey: e.npcKey });
            // npc.anim.keepWalking = true;

            const allPoints = e.paths.reduce((agg, item) => agg.concat(...item.paths), /** @type {Geom.Vect[]} */ ([]));
            await npc.followNavPath(allPoints);

            // for (const [i, localNavPath] of e.paths.entries()) {
            //   for (const [i, vectPath] of localNavPath.paths.entries()) {
            //     await state.moveNpcAlongPath(npc, vectPath);
            //     const roomEdge = localNavPath.edges[i];

            //     // In case of final `vectPath` don't traverse edge
            //     // - either roomEdge does not exist
            //     // - or leaving geomorph and edge is self-loop (by construction)
            //     if (roomEdge && (roomEdge.srcRoomId !== roomEdge.dstRoomId)) {
            //       /** @type {NPC.TraverseDoorCtxt} */
            //       const ctxt = {
            //         srcGmId: localNavPath.gmId, srcDoorId: roomEdge.doorId, srcRoomId: roomEdge.srcRoomId,
            //         dstGmId: localNavPath.gmId, dstDoorId: roomEdge.doorId, dstRoomId: roomEdge.dstRoomId,
            //       };
            //       console.log(`enter door: ${JSON.stringify(ctxt)}`);
            //       state.events.next({ key: 'exited-room', npcKey: e.npcKey, ctxt });
                  
            //       const gm = props.gmGraph.gms[localNavPath.gmId];
            //       await state.moveNpcAlongPath(npc, [
            //         gm.matrix.transformPoint(roomEdge.entry.clone()).precision(2),
            //         gm.matrix.transformPoint(roomEdge.exit.clone()).precision(2),
            //       ]);
                  
            //       console.log(`exit door: ${JSON.stringify(ctxt)}`);
            //       state.events.next({ key: 'entered-room', npcKey: e.npcKey, ctxt });
            //     }
            //   }
            //   // Undefined iff final localNavPath
            //   const gmEdge = e.edges[i];
            //   if (gmEdge) {
            //     /** @type {NPC.TraverseDoorCtxt} */
            //     const ctxt = gmEdge;
            //     console.log(`enter hull door: ${JSON.stringify(ctxt)}`);
            //     state.events.next({ key: 'exited-room', npcKey: e.npcKey, ctxt });
                
            //     await state.moveNpcAlongPath(npc, [gmEdge.srcExit, gmEdge.dstEntry]);
                
            //     console.log(`exit hull door: ${JSON.stringify(ctxt)}`);
            //     state.events.next({ key: 'entered-room', npcKey: e.npcKey, ctxt });
            //   }
            // }

            // // Become idle
            // npc.anim.body.cancel();
            // npc.setSpritesheet('idle');
            // npc.startAnimation();
            state.events.next({ key: 'stopped-walking', npcKey: e.npcKey });

          } else if (e.key === 'local-nav') {
            for (const [i, vectPath] of e.paths.entries()) {
              // TODO
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
    };

    return output;
  }, { deps: [nav, props.doorsApi] });
  
  
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
        <div
          key={`${npc.key}@${npc.spawnedAt}`} // So, respawn remounts
          ref={state.npcRef}
          className={classNames('npc', npc.key, npc.anim.spriteSheet, npcCss)}
          data-npc-key={npc.key}
        >
          <div
            className={classNames('body', npc.key, 'no-select')}
            data-npc-key={npc.key}
          />
        </div>
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

// TODO modularise
import npcJson from '../../public/npc/first-npc.json'
const { animLookup, zoom } = npcJson;

/** Scale the sprites */
const npcScale = 0.17;
/** Ensure NPC faces along positive x-axis */
const npcOffsetAngleDeg = 0;

const npcCss = css`
  .body {
    /* cursor: pointer; */
    position: absolute;
    filter: grayscale(100%) brightness(140%);
    /* transform: scale(0.18) rotate(90deg); */
  }
  
  &.walk .body {
    width: ${animLookup.walk.aabb.width * zoom}px;
    height: ${animLookup.walk.aabb.height * zoom}px;
    left: ${-animLookup.walk.aabb.width * zoom * 0.5}px;
    top: ${-animLookup.walk.aabb.height * zoom * 0.5}px;
    background: url('/npc/first-npc--walk.png');
  }

  &.idle .body {
    width: ${animLookup.idle.aabb.width * zoom}px;
    height: ${animLookup.idle.aabb.height * zoom}px;
    left: ${-animLookup.idle.aabb.width * zoom * 0.5}px;
    top: ${-animLookup.idle.aabb.height * zoom * 0.5}px;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
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
