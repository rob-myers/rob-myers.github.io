import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { merge, of, Subject } from "rxjs";
import { filter, first, map, take } from "rxjs/operators";
import { testNever } from "../service/generic";
import { removeCached, setCached } from "../service/query-client";
import { otag } from "../service/rxjs";
import { geom } from "../service/geom";
import { verifyGlobalNavPath, verifyDecor } from "../service/npc";
import { cssName } from "../service/const";
import { getNumericCssVar } from "../service/dom";
import { Poly, Rect, Vect } from "../geom";
import createNpc, { defaultNpcInteractRadius, npcAnimScaleFactor } from "./create-npc";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";
import NPC from "./NPC";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const nav = useGeomorphsNav(props.gmGraph, props.disabled);

  const state = useStateRef(/** @type {() => NPC.NPCs} */ () => ({
    decor: {},
    events: new Subject,
    npc: {},
    playerKey: /** @type {null | string} */ (null),
    rootEl: /** @type {HTMLDivElement} */ ({}),
    ready: true,
    session: {},

    class: { Vect },
    rxjs: { filter, first, map, take, otag },

    addTtyCtxt(sessionKey, ctxt) {
      state.session[sessionKey].tty[ctxt.lineNumber] = ctxt;
    },
    getGmGraph() {
      return props.gmGraph;
    },

    getGlobalNavPath(src, dst) {
      const {gms} = props.gmGraph
      const srcGmId = gms.findIndex(x => x.gridRect.contains(src));
      const dstGmId = gms.findIndex(x => x.gridRect.contains(dst));

      if (srcGmId === -1 || dstGmId === -1) {
        throw Error(`getGlobalNavPath: src/dst must be inside some geomorph's aabb`)
      } else if (srcGmId === dstGmId) {
        const localNavPath = state.getLocalNavPath(srcGmId, src, dst);
        console.log('localNavPath (single)', localNavPath);
        return {
          key: 'global-nav',
          fullPath: localNavPath.fullPath.slice(),
          navMetas: localNavPath.navMetas.map(x => ({ ...x, gmId: localNavPath.gmId })),
        };
      } else {

        // Compute global strategy i.e. edges in gmGraph
        const gmEdges = props.gmGraph.findPath(src, dst);
        if (!gmEdges) {
          throw Error(`getGlobalNavPath: gmGraph.findPath not found: ${JSON.stringify(src)} -> ${JSON.stringify(dst)}`);
        }
        console.log('gmEdges', gmEdges); // DEBUG

        const fullPath = /** @type {Geom.Vect[]} */ ([]);
        const navMetas = /** @type {NPC.GlobalNavMeta[]} */ ([]);

        for (let k = 0; k < gmEdges.length + 1; k++) {
          const localNavPath = k === 0
            // Initial
            ? state.getLocalNavPath(srcGmId, src, gmEdges[0].srcDoorEntry)
            : k < gmEdges.length
              // Intermediate
              ? state.getLocalNavPath(gmEdges[k - 1].dstGmId, gmEdges[k - 1].dstDoorEntry, gmEdges[k].srcDoorEntry)
              // Final
              : state.getLocalNavPath(dstGmId, gmEdges[k - 1].dstDoorEntry, dst);

          console.log('localNavPath', k, localNavPath);

          const gmEdge = gmEdges[k];
          
          if (k === 0 && localNavPath.doorIds[0] >= 0) {
            // Started in hull door, so ignore `localNavPath`
            fullPath.push(Vect.from(src));
          } else if (k === gmEdges.length && localNavPath.doorIds[1] >= 0) {
            // Ended in hull door, so ignore `localNavPath`
            fullPath.push(Vect.from(dst));
          } else {
            const indexOffset = fullPath.length;
            fullPath.push(...localNavPath.fullPath);
            // Remove final 'start-seg'
            const finalStartSegIndex = navMetas.findIndex(x => x.key === 'start-seg' && x.index === localNavPath.fullPath.length - 1)
            navMetas.splice(finalStartSegIndex, 1);
            // Globalise local navMetas
            navMetas.push(
              ...localNavPath.navMetas.map(x => ({
                ...x,
                index: indexOffset + x.index,
                gmId: localNavPath.gmId,
              })),
            );
          }

          if (gmEdge) {
            const baseMeta = {
              gmId: gmEdge.srcGmId,
              doorId: gmEdge.srcDoorId,
              hullDoorId: gmEdge.srcHullDoorId,
              index: fullPath.length - 1,
              otherRoomId: null,
            };
            navMetas.push({ key: 'pre-exit-room', willExitRoomId: gmEdge.srcRoomId, ...baseMeta });
            navMetas.push({ key: 'exit-room', exitedRoomId: gmEdge.srcRoomId, ...baseMeta });
          }
        }
        
        return {
          key: 'global-nav',
          fullPath,
          navMetas,
        };
      }
    },

    /**
     * Wraps floorGraphClass.findPath
     */
    getLocalNavPath(gmId, src, dst) {
      const gm = props.gmGraph.gms[gmId];
      const localSrc = gm.inverseMatrix.transformPoint(Vect.from(src));
      const localDst = gm.inverseMatrix.transformPoint(Vect.from(dst));
      const pf = nav.pfs[gmId];
      const result = pf.graph.findPath(localSrc, localDst);

      if (result) {
        return {
          key: 'local-nav',
          gmId,
          ...result,
          // Avoid geom.removePathReps because navMetas would have to be adjusted
          fullPath: result.fullPath.map(p => gm.matrix.transformPoint(Vect.from(p)).precision(3)),
        };
      } else {
        return { key: 'local-nav', gmId, fullPath: [], navMetas: [], doorIds: [-1, -1] };
      }
    },
    /**
     * Used by shell function `nav`.
     * Wraps `state.getGlobalNavPath`.
     */
    getNpcGlobalNav(e) {
      const npc = state.npc[e.npcKey];
      if (!npc) {
        throw Error(`npcKey "${e.npcKey}" does not exist`);
      } else if (!(Vect.isVectJson(e.point))) {
        throw Error(`invalid point: ${JSON.stringify(e.point)}`);
      } else if (!state.isPointLegal(e.point)) {
        throw Error(`outside navPoly: ${JSON.stringify(e.point)}`);
      }
      const result = state.getGlobalNavPath(npc.getPosition(), e.point);
      if (e.debug) {
        state.setDecor(e.npcKey, { key: e.npcKey, type: 'path', path: result.fullPath });
      }
      return result;
    },
    getNpcInteractRadius() {
      return getNumericCssVar(state.rootEl, cssName.npcsInteractRadius);
    },
    getNpc(npcKey) {
      const npc = state.npc[npcKey];
      if (!npc) {
        throw Error(`npc "${npcKey}" does not exist`);
      }
      return npc;
    },
    getNpcsIntersecting(convexPoly) {
      return Object.values(state.npc)
        .filter(x => geom.rectIntersectsConvexPoly(x.getBounds(), convexPoly.outline));
    },
    getPanZoomApi() {
      return props.panZoomApi;
    },
    getPlayer() {
      return state.playerKey ? state.getNpc(state.playerKey) : null;
    },
    getPointTags(point) {
      const tags = /** @type {string[]} */ ([]);
      if (state.isPointLegal(point)) tags.push('nav');
      /**
       * TODO e.g. table, chair, door, npc etc.
       */
      return tags;
    },
    isPointLegal(p) {
      const gmId = props.gmGraph.gms.findIndex(x => x.gridRect.contains(p));
      if (gmId === -1) return false;
      const { navPoly, inverseMatrix } = props.gmGraph.gms[gmId];
      const localPoint = inverseMatrix.transformPoint(Vect.from(p));
      return navPoly.some(poly => poly.contains(localPoint));
    },
    async npcAct(e) {
      switch (e.action) {
        case 'add-decor':
          state.setDecor(e.key, e);
          break;
        case 'cancel':// Cancel current animation
          await state.getNpc(e.npcKey).cancel();
          break;
        case 'config':
          if (typeof e.interactRadius === 'number') {
            state.rootEl.style.setProperty(cssName.npcsInteractRadius, `${e.interactRadius}px`);
          }
          if (e.debug !== undefined) {
            state.rootEl.style.setProperty(cssName.npcsDebugDisplay, e.debug ? 'initial' : 'none');
          }
          break;
        case 'get':
          return state.getNpc(e.npcKey);
        case 'look-at': {
          const npc = state.getNpc(e.npcKey);
          if (!Vect.isVectJson(e.point)) {
            throw Error(`invalid point: ${JSON.stringify(e.point)}`);
          }
          await npc.lookAt(e.point);
          break;
        }
        case 'pause':// Pause current animation
          await state.getNpc(e.npcKey).pause();
          break;
        case 'play':// Resume current animation
          await state.getNpc(e.npcKey).play();
          break;
        case 'remove-decor':
          state.setDecor(e.decorKey, null);
          break;
        case 'set-player':
          state.events.next({ key: 'set-player', npcKey: e.npcKey??null });
          break;
        default:
          throw Error(testNever(e, `unrecognised action: "${JSON.stringify(e)}"`));
      }
    },
    onTtyLink(lineNumber, lineText, linkText, linkStartIndex) {
      /**
       * TODO
       */
      // state.session
      console.log({ lineNumber, lineText, linkText, linkStartIndex });
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
    rootRef(el) {
      if (el) {
        state.rootEl = el;
        el.style.setProperty(cssName.npcsInteractRadius, `${defaultNpcInteractRadius}px`);
        el.style.setProperty(cssName.npcsDebugDisplay, 'none');
      }
    },
    setDecor(decorKey, decor) {
      if (decor) {
        if (!verifyDecor(decor)) {
          throw Error('invalid decor');
        }
        state.decor[decorKey] = decor;
      } else {
        delete state.decor[decorKey];
      }
      update();
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
              await props.panZoomApi.followPath(path, { animScaleFactor: npcAnimScaleFactor });
            } catch {} // Ignore Error('cancelled')
          }
        },
      });
      
      return subscription;
    },
    async walkNpc(e) {
      const npc = state.getNpc(e.npcKey);
      if (!verifyGlobalNavPath(e)) {
        throw Error(`invalid global navpath: ${JSON.stringify(e)}`);
      }

      try {// Walk along a global navpath
        const globalNavPath = e;
        const allPoints = globalNavPath.fullPath;
        console.log('global navMetas', globalNavPath.navMetas); // DEBUG
        await npc.followNavPath(allPoints, { globalNavMetas: globalNavPath.navMetas });

      } catch (err) {
        if (err instanceof Error && err.message === 'cancelled') {
          console.info(`${e.npcKey}: walkNpc cancelled`);
        } else {
          throw err;
        }
      }
    },
  }), { deps: [nav, props.doorsApi] });
  
  React.useEffect(() => {
    setCached(props.npcsKey, state);
    props.onLoad(state);
    return () => removeCached(props.npcsKey);
  }, []);

  return (
    <div
      className={classNames('npcs', rootCss)}
      ref={state.rootRef}
    >

      {Object.entries(state.decor).map(([key, item]) =>
        <DecorItem key={key} item={item} />
      )}

      {Object.values(state.npc).map(npc => (
        <NPC // Respawn remounts
          key={`${npc.key}@${npc.epochMs}`}
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
  div.debug-npc {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 30px;
    border: 1px solid red;
    transform: translate(-15px, -15px);
  }
  svg {
    position: absolute;
    pointer-events: none;

    .debug-circle {
      fill: #ff000035;
    }
  }
`;

/** @param {{ item: NPC.Decor }} props  */
function DecorItem({ item }) {
  /** @type {Rect} */ let aabb;
  /** @type {React.ReactNode} */ let child;

  switch (item.type) {
    case 'path':
      aabb = Rect.fromPoints(...item.path).outset(10);
      child = (
        <g className="debug-path">
          <polyline
            fill="none" stroke="#88f" strokeDasharray="2 2" strokeWidth={1}
            points={item.path.map(p => `${p.x},${p.y}`).join(' ')}
          />
          {item.path.map((p, i) => (
            <circle key={i} fill="none" stroke="#ff444488" r={2} cx={p.x} cy={p.y} />
          ))}
        </g>
      );
      break;
    case 'circle':
      aabb = new Rect(item.center.x - item.radius, item.center.y - item.radius, item.radius * 2, item.radius * 2);
      child = (
        <circle
          className="debug-circle"
          cx={item.center.x}
          cy={item.center.y}
          r={item.radius}
        />
      );
      break;
    default:
      console.error(`unexpected decor`, item);
      // throw testNever(item);
      return null;
  }

  return (
    <svg width={aabb.width} height={aabb.height} style={{ left: aabb.x, top: aabb.y }}>
      <g style={{ transform: `translate(${-aabb.x}px, ${-aabb.y}px)` }}>
        {child}
      </g>
    </svg>
  );
}

/**
 * @typedef Props @type {object}
 * @property {Record<string, { path: Geom.Vect[]; aabb: Rect; }>} debugPath 
 */
