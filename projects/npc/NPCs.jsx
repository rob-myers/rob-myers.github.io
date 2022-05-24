import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { firstValueFrom } from "rxjs";
import { filter, first, map, take } from "rxjs/operators";
import { keys } from "../service/generic";
import { removeCached, setCached } from "../service/query-client";
import { otag } from "../sh/rxjs";
import { createNpc, isGlobalNavPath, isLocalNavPath } from "../service/npc";
import { Poly, Rect, Vect } from "../geom";
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
      debugPath: {},
      class: { Vect },
      rxjs: { filter, first, map, take, otag },

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
      async moveNpcAlongPath(npc, path) {
        // TODO 🚧 can cancel via `npcAct` and `kill`
        // TODO pause/resume
        npc.anim.origPath = path.map(Vect.from);
        npc.anim.animPath = npc.anim.origPath.slice();
        npc.updateAnimAux();
        await npc.followNavPath();
      },
      async npcAct(e) {
        const npc = state.npc[e.npcKey];
        if (!npc) {
          throw Error(`npc does not exist: "${e.npcKey}"`);
        } else if (!(e.action === 'cancel' || e.action === 'pause' || e.action === 'resume')) {
          throw Error(`${e.npcKey} unrecognised action: "${e.action}"`);
        }

        if (e.action === 'cancel') {
          // Cancel walking
          await npc.cancel();
        } else if (e.action === 'pause') {
          // TODO 🚧 pause walking
        } else if (e.action === 'resume') {
          // TODO 🚧 resume walking
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
          updateNpc: () => state.updateNpc(e.npcKey),
        });
        update();
      },
      toggleDebugPath(e) {
        if (e.points) {
          const path = e.points.map(Vect.from);
          state.debugPath[e.pathKey] = { path, aabb: Rect.from(...path).outset(10) };
        } else {
          delete state.debugPath[e.pathKey];
        }
        update();
      },
      /** @param {string} npcKey */
      updateNpc(npcKey) {
        const npc = state.npc[npcKey];
        npc.el.root.classList.remove('idle', 'walk');
        npc.el.root.classList.add(npc.anim.spriteSheet);
      },
      async walkNpc(e) {
        // TODO 🚧
        // - can cancel walk via `npc andros stop` or `kill`
        // - can pause/resume walk via `npc andros pause/resume` or `kill --STOP/CONT`

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
            await state.moveNpcAlongPath(npc, e.points);
          } else if (e.key === 'global-nav') {
            // Walk along a global navpath
            for (const [i, localNavPath] of e.paths.entries()) {
              for (const [i, vectPath] of localNavPath.paths.entries()) {
                await state.moveNpcAlongPath(npc, vectPath);
                const roomEdge = localNavPath.edges[i];
                // For final `vectPath` we do not need to traverse an edge
                // - either roomEdge does not exist,
                // - or we leave geomorph and edge is self-loop (by construction)
                if (roomEdge && (roomEdge.srcRoomId !== roomEdge.dstRoomId)) {
                  console.log(`gm ${localNavPath.gmId}: entering door ${roomEdge.doorId} from room ${roomEdge.srcRoomId}`);
                  const gm = props.gmGraph.gms[localNavPath.gmId];
                  await state.moveNpcAlongPath(npc, [
                    // Transform RoomGraph edge entry/exit to world coords
                    gm.matrix.transformPoint(roomEdge.entry.clone()).precision(2),
                    gm.matrix.transformPoint(roomEdge.exit.clone()).precision(2),
                  ]);
                  console.log(`gm ${localNavPath.gmId}: exiting door ${roomEdge.doorId} to room ${roomEdge.dstRoomId}`);
                }
              }
              const gmEdge = e.edges[i];
              if (gmEdge) {// Undefined for final localNavPath
                console.log(`gm ${gmEdge.srcGmId}: entering hull door ${gmEdge.srcHullDoorId} `);
                await state.moveNpcAlongPath(npc, [npc.getPosition(), gmEdge.srcExit, gmEdge.dstEntry]);
                // await state.moveNpcAlongPath(npc, [gmEdge.srcExit, gmEdge.dstEntry]);
                console.log(`gm ${gmEdge.dstGmId}: exiting hull door ${gmEdge.dstHullDoorId}`);
              }
            }
          } else if (e.key === 'local-nav') {
            for (const [i, vectPath] of e.paths.entries()) {
              // TODO
            }
          }
        } catch (err) {
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
        debugPath={state.debugPath}
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
const { animLookup: anim, zoom } = npcJson;
/** Scale the sprites */
const npcScale = 0.17;
/** Ensure NPC faces along positive x-axis */
// const npcOffsetAngleDeg = 90;
const npcOffsetAngleDeg = 0;
const spriteSheets = keys(anim);

const npcCss = css`
  .body {
    /* cursor: pointer; */
    position: absolute;
    filter: grayscale(100%) brightness(140%);
    /* transform: scale(0.18) rotate(90deg); */
  }
  
  &.walk .body {
    width: ${anim.walk.aabb.width * zoom}px;
    height: ${anim.walk.aabb.height * zoom}px;
    left: ${-anim.walk.aabb.width * zoom * 0.5}px;
    top: ${-anim.walk.aabb.height * zoom * 0.5}px;
    animation: walk 0.625s steps(${anim.walk.frames.length}) infinite;
    background: url('/npc/first-npc--walk.png');
  }
  /* &.walk .body {
    width: ${128 * 1}px;
    height: ${128 * 1}px;
    left: ${-128 * 1 * 0.5}px;
    top: ${-128 * 1 * 0.5}px;
    animation: walk 0.45s steps(${10}) infinite;
    background: url('/npc/guard1_walk.png');
  } */
  &.idle .body {
    width: ${anim.idle.aabb.width * zoom}px;
    height: ${anim.idle.aabb.height * zoom}px;
    left: ${-anim.idle.aabb.width * zoom * 0.5}px;
    top: ${-anim.idle.aabb.height * zoom * 0.5}px;
    animation: idle 2s steps(${anim.idle.frames.length}) infinite;
    background: url('/npc/first-npc--idle.png');
  }
  /* &.idle .body {
    width: ${128 * 1}px;
    height: ${128 * 1}px;
    left: ${-128 * 1 * 0.5}px;
    top: ${-128 * 1 * 0.5}px;
    background: url('/npc/guard1_walk.png');
  } */

  &.disabled .body {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-anim.walk.frames.length * anim.walk.aabb.width * zoom}px; }
  }
  /* @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-10 * 128 * 1}px; }
  } */
  @keyframes idle {
    from { background-position: 0px; }
    to { background-position: ${-anim.idle.frames.length * anim.walk.aabb.width * zoom}px; }
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
