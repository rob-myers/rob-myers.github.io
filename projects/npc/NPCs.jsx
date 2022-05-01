import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { ensureWire } from "../service/wire";
import { error } from "../service/log";
import { Rect, Vect } from "../geom";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";

// TODO further modularisation
import npcJson from '../../public/npc/first-npc.json'

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
       * @param {NPC.NPC} npc 
       * @param {Geom.VectJson[]} path 
       */
      moveNpcAlongPath(npc, path) {
        /**
         * TODO 🚧
         */
      },
      /** @type {React.RefCallback<HTMLDivElement>} */
      npcRef(rootEl) {
        if (rootEl) {
          const npcKey = /** @type {string} */ (rootEl.getAttribute('data-npc-key'));
          const npc = state.npc[npcKey];
          npc.el.root = rootEl;
          npc.el.body = /** @type {HTMLDivElement} */ (rootEl.childNodes[0]);
          npc.el.root.style.transform = `translate(${npc.def.position.x}px, ${npc.def.position.y}px)`;
          npc.el.body.style.transform = `rotate(${npc.def.angle}rad) scale(${npcScale})`;
        }
      },
    };
  }, { deps: [nav, props.doorsApi] });
  
  React.useEffect(() => {
    const wire = ensureWire(props.wireKey);
    const sub = wire.subscribe((e) => {
      if (e.key === 'spawn') {
        state.npc[e.npcKey] = {
          key: e.npcKey,
          uid: `${e.npcKey}-${++spawnCount}`,
          def: {
            key: e.npcKey,
            position: e.at,
            angle: Math.PI/4, // TEMP
          },
          spriteSheetState: 'idle',
          el: {
            root: /** @type {HTMLDivElement} */ ({}),
            body: /** @type {HTMLDivElement} */ ({}),
          },
          anim: {
            root: new Animation,
            body: new Animation,
          },
          getAngle() {
            const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this.el.root).transform);
            return Math.atan2(matrix.m12, matrix.m11);
          },
          getPosition() {
            const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect());
            return Vect.from(props.panZoomApi.getWorld({ clientX, clientY }));
          },
        };
        update();
      } else if (e.key === 'nav-req') {
        const npc = state.npc[e.npcKey];
        const result = state.getGlobalNavPath(npc.getPosition(), e.dst);
        wire.next({ key: 'nav-res', req: e, res: result });
      } else if (e.key === 'move-req') {
        const npc = state.npc[e.npcKey];
        const result = state.moveNpcAlongPath(npc, e.path);
        wire.next({ key: 'move-res', req: e, res: result });
      } else if (e.key === 'debug-path') {
        const path = e.path.map(Vect.from);
        state.debugPath[e.pathName] = { path, aabb: Rect.from(...path).outset(10) };
        update();
      }
    });
    return () => sub.unsubscribe();
  }, [props.panZoomApi]);

  return <>
    <div className={classNames('npcs', rootCss)}>
      {Object.values(state.npc).map(npc => (
        <div
          key={npc.uid} // So respawn remounts
          data-npc-key={npc.key}
          className={classNames('npc', npc.key, npc.spriteSheetState, npcCss)}
          ref={state.npcRef}            
        >
          <div className={classNames('body', npc.key, 'no-select')} />
        </div>
      ))}
    </div>
    <Debug debugPath={state.debugPath} />
  </>;
}

let spawnCount = 0;

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
    pointer-events: none;
  }
  .npc {
    position: absolute;
  }
`;

const { animLookup: anim, zoom } = npcJson;
const npcScale = 0.18;

const npcCss = css`
  .body {
    cursor: pointer;
    position: absolute;
    transform: scale(0.18);
    pointer-events: all;
    filter: grayscale(100%);
  }
  
  &.walk .body {
    width: ${anim.walk.aabb.width * zoom}px;
    height: ${anim.walk.aabb.height * zoom}px;
    left: ${-anim.walk.aabb.width * zoom * 0.5}px;
    top: ${-anim.walk.aabb.height * zoom * 0.5}px;
    animation: walk 300ms steps(${anim.walk.frames.length}) infinite;
    background: url('/npc/first-npc--walk.png');
  }
  &.idle .body {
    width: ${anim.idle.aabb.width * zoom}px;
    height: ${anim.idle.aabb.height * zoom}px;
    left: ${-anim.idle.aabb.width * zoom * 0.5}px;
    top: ${-anim.idle.aabb.height * zoom * 0.5}px;
    animation: idle 2s steps(${anim.idle.frames.length}) infinite;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-anim.walk.frames.length * anim.walk.aabb.width * zoom}px; }
  }
  @keyframes idle {
    from { background-position: 0px; }
    to { background-position: ${-anim.idle.frames.length * anim.idle.aabb.width * zoom}px; }
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
          position: 'absolute',
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
