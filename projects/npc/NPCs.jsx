import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { filter, first } from "rxjs/operators";
import { keys } from "../service/generic";
import { ensureWire } from "../service/wire";
import { error } from "../service/log";
import { Poly, Rect, Vect } from "../geom";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";

import { createNpc } from "projects/service/npc";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const nav = useGeomorphsNav(props.gmGraph, props.disabled);
  // console.log(nav);

  const state = useStateRef(() => {
    return {
      /** @type {Record<string, NPC.NPC>} */
      npc: {},
      /** @type {Record<string, { path: Geom.Vect[]; aabb: Rect; }>} */
      debugPath: {},
      async awaitPanzoomIdle() {
        if (!props.panZoomApi.isIdle()) {
          await firstValueFrom(props.panZoomApi.events.pipe(
            filter(x => x.key === 'ui-idle'),
            first(),
          ));
        }
      },
      /**
       * @param {Geom.VectJson} src
       * @param {Geom.VectJson} dst
       * @returns {null | { paths: Geom.Vect[][]; edges: NPC.NavGmTransition[] }}
       */
      getGlobalNavPath(src, dst) {
        const {gms} = props.gmGraph
        const srcGmId = gms.findIndex(x => x.gridRect.contains(src));
        const dstGmId = gms.findIndex(x => x.gridRect.contains(dst));
        if (srcGmId === -1 || dstGmId === -1) {
          error(`getGlobalNavPath: src/dst must be inside some geomorph's aabb`);
          return null;
        } else if (srcGmId === dstGmId) {
          return {
            paths: [state.getLocalNavPath(srcGmId, src, dst)],
            edges: [],
          };
        } else {
          // Compute global strategy
          const gmEdges = props.gmGraph.findPath(src, dst);
          if (!gmEdges) {
            error(`getGlobalNavPath: gmGraph.findPath not found: ${JSON.stringify(src)} -> ${JSON.stringify(dst)}`);
            return null;
          }
          // console.log({gmEdges});

          const paths = /** @type {Geom.Vect[][]} */ ([]);
          for (let k = 0; k < gmEdges.length + 1; k++) {
            if (k === 0) {
              paths[k] = state.getLocalNavPath(srcGmId, src, gmEdges[0].src.exit);
            } else if (k === gmEdges.length) {
              paths[k] = state.getLocalNavPath(dstGmId, gmEdges[k - 1].dst.entry, dst);
            } else {
              paths[k] = state.getLocalNavPath(gmEdges[k - 1].dst.gmId, gmEdges[k - 1].dst.entry, gmEdges[k].src.exit);
            }
          }
          return {
            paths,
            edges: gmEdges,
          };
        }
      },
      /**
       * Must transform to local coords and then back.
       * @param {number} gmId 
       * @param {Geom.VectJson} src World coords
       * @param {Geom.VectJson} dst World coords
       */
      getLocalNavPath(gmId, src, dst) {
        const gm = props.gmGraph.gms[gmId];
        const pf = nav.pfs[gmId];
        const localSrc = gm.inverseMatrix.transformPoint(Vect.from(src));
        const localDst = gm.inverseMatrix.transformPoint(Vect.from(dst));

        const result = pf.graph.findPath(localSrc, localDst);

        if (result) {
          // Just join them together for the moment...
          return [Vect.from(localSrc)]
            .concat(result.normalisedPaths.flatMap(x => x))
            .map(p => gm.matrix.transformPoint(p).precision(2));
        } else {
          return [];
        }
      },
      /**
       * 
       * @param {{ npcKey: string; dst: Geom.VectJson }} e 
       */
      getNpcGlobalNav(e) {
        if (!state.isPointLegal(e.dst)) {
          throw Error(`${JSON.stringify(e.dst)}: cannot navigate outside navPoly`);
        }
        const npc = state.npc[e.npcKey];
        if (!npc) {
          throw Error(`npc "${e.npcKey}" does not exist`);
        }
        return state.getGlobalNavPath(npc.getPosition(), e.dst);
      },
      /**
       * @param {{ npcKey: string }} e 
       */
      getNpc(e) {
        const npc = state.npc[e.npcKey];
        if (!npc) {
          throw Error(`npc "${e.npcKey}" does not exist`);
        }
        return npc;
      },
      getPanzoomFocus() {
        return props.panZoomApi.getWorldAtCenter();
      },
      /**
       * Does `p` lie inside some geomorph's navmesh?
       * @param {Geom.VectJson} p
       */
      isPointLegal(p) {
        const gmId = props.gmGraph.gms.findIndex(x => x.gridRect.contains(p));
        if (gmId === -1) return false;
        const { navPoly, inverseMatrix } = props.gmGraph.gms[gmId];
        const localPoint = inverseMatrix.transformPoint(Vect.from(p));
        return navPoly.some(poly => poly.contains(localPoint));
      },
      /**
       * @param {NPC.NPC} npc 
       * @param {Geom.VectJson[]} path 
       */
      moveNpcAlongPath(npc, path) {
        npc.origPath = path.map(Vect.from);
        npc.animPath = npc.origPath.slice();
        npc.updateAnimAux();
        npc.followNavPath();
        update();
        return npc.anim.root;
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
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
      /**
       * @param {{ npcKey: string; at: Geom.VectJson }} e 
       */
      spawn(e) {
        if (!state.isPointLegal(e.at)) {
          throw Error(`${JSON.stringify(e.at)}: cannot spawn outside navPoly`);
        }
        state.npc[e.npcKey] = createNpc(e.npcKey, e.at, {
          panZoomApi: props.panZoomApi, update, disabled: props.disabled
        });
        update();
      },
      /**
       * @param {{ pathKey: string; path?: Geom.VectJson[] }} e 
       */
      toggleDebugPath(e) {
        if (e.path) {
          const path = e.path.map(Vect.from);
          state.debugPath[e.pathKey] = { path, aabb: Rect.from(...path).outset(10) };
        } else {
          delete state.debugPath[e.pathKey];
        }
        update();
      },
      /**
       * @param {{ zoom?: number; to?: Geom.VectJson; ms?: number }} e 
       */
      async panzoomTo(e) {
        // TODO 🚧 remove 2000 hard-coding
        props.panZoomApi.tweenTo(e.zoom, e.to, e.ms??2000);
        
        const result = /** @type {PanZoom.CssInternalTransitionEvent} */ (
          await firstValueFrom(props.panZoomApi.events.pipe(
            // TODO 🚧 { key: 'cancelled-panzoom', type: 'translate' | 'scale' }
            filter(x => x.key === 'cancelled-transition' || x.key === 'completed-transition'),
          ))
        );

        return result.key === 'cancelled-transition' ? 'cancelled' : 'completed';
      },
      /**
       * @param {{ npcKey: string; path: Geom.VectJson[] }} e 
       */
      async walkNpc(e) {
        const npc = state.npc[e.npcKey];
        if (!npc) {
          throw Error(`npc "${e.npcKey}" does not exist`);
        }
        const anim = state.moveNpcAlongPath(npc, e.path);
        // Wait until walk finished or cancelled
        await new Promise((resolve, reject) => {
          anim.addEventListener("finish", resolve);
          anim.addEventListener("cancel", reject);
        });
      },
    };
  }, { deps: [nav, props.doorsApi] });
  
  /**
   * TODO
   * - single npcs object
   * - subsumes NavDemo1 state.wire
   */
  React.useEffect(() => {
    const wire = ensureWire(props.wireKey);

    const sub = wire.subscribe((e) => {
      if (e.key === 'spawn') {
        if (!state.isPointLegal(e.at))
          throw Error(`${JSON.stringify(e.at)}: cannot spawn outside navPoly`);

        state.npc[e.npcKey] = createNpc(
          e.npcKey,
          e.at,
          { panZoomApi: props.panZoomApi, update, disabled: props.disabled },
        );
        update();
      } else if (e.key === 'npc-req') {
        const npc = state.npc[e.npcKey];
        if (!npc)
          throw Error(`npc "${e.npcKey}" does not exist`);
        wire.next({ key: 'npc-res', req: e, res: npc });
      } else if (e.key === 'nav-req') {
        if (!state.isPointLegal(e.dst))
          throw Error(`${JSON.stringify(e.dst)}: cannot navigate outside navPoly`);
        const npc = state.npc[e.npcKey];
        if (!npc)
          throw Error(`npc "${e.npcKey}" does not exist`);
        const result = state.getGlobalNavPath(npc.getPosition(), e.dst);
        wire.next({ key: 'nav-res', req: e, res: result });
      } else if (e.key === 'walk-req') {
        const npc = state.npc[e.npcKey];
        if (!npc)
          throw Error(`npc "${e.npcKey}" does not exist`);
        const anim = state.moveNpcAlongPath(npc, e.path);
        wire.next({ key: 'walk-res', req: e, res: anim });
      } else if (e.key === 'debug-path') {
        const path = e.path.map(Vect.from);
        state.debugPath[e.pathName] = { path, aabb: Rect.from(...path).outset(10) };
        update();
      } else if (e.key === 'view-req') {
        props.panZoomApi.tweenTo(e.zoom, e.to, e.ms??2000);
        
        props.panZoomApi.events.pipe(
          filter(x => x.key === 'cancelled-transition' || x.key === 'completed-transition'),
          first(),
        ).subscribe({ next: (x) => {
          x.key === 'cancelled-transition' && wire.next({ key: 'view-res', req: e, res: 'cancelled' });
          x.key === 'completed-transition' && wire.next({ key: 'view-res', req: e, res: 'completed' });
        }});
      } else if (e.key === 'panzoom-idle-req') {
        if (props.panZoomApi.isIdle()) {
          wire.next({ key: 'panzoom-idle-res', req: e, res: true });
        } else {
          props.panZoomApi.events.pipe(
            filter(x => x.key === 'ui-idle'),
            first(),
          ).subscribe({
            complete: () => wire.next({ key: 'panzoom-idle-res', req: e, res: true }),
          });
        }
      } else if (e.key === 'panzoom-focus-req') {
        wire.next({ key: 'panzoom-focus-res', req: e, res: props.panZoomApi.getWorldAtCenter() });
      } else if (e.key === 'ping') {
        wire.next({ key: 'pong' });
      } else if (e.key === 'classes-req') {
        wire.next({ key: 'classes-res', req: e, res: {
          Vect,
        } });
      }
    });

    // On HMR, refresh each npc via remount
    Object.values(state.npc).forEach(npc => {
      delete state.npc[npc.key];
      wire.next({ key: 'spawn', npcKey: npc.key, at: npc.getPosition() });
    });

    return () => sub.unsubscribe();
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
          className={classNames('npc', npc.key, npc.spriteSheet, npcCss)}
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
import { firstValueFrom } from "rxjs";
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
        style={{

          left: aabb.x,
          top: aabb.y,
        }}
      >
        <g style={{ transform: `translate(${-aabb.x}px, ${-aabb.y}px)` }}>
          <polyline fill="none" stroke="blue" strokeWidth={2} points={`${path}`} />
          {path.map(p => (
            <circle fill="none" stroke="red" r={2.5} cx={p.x} cy={p.y} />
          ))}
        </g>
      </svg>
    ))}  
  </>
}
