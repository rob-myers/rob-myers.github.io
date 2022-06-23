import React from "react";
import { css } from "goober";
import { filter } from "rxjs/operators";

import { assertNonNull, testNever } from "../service/generic";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Vect } from "../geom";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

/** @param {{ disabled?: boolean }} props */
export default function NavDemo1(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [1, 0, 0, 1, -1200, 600] },
    { layoutKey: 'g-303--passenger-deck', transform: [1, 0, 0, -1, -1200, 1200 + 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [-1, 0, 0, 1, 1200 + 1200, 600] },
    { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 1200 + 600], },
  ]);

  const state = useStateRef(() => {
    return {
      gmId: 0, roomId: 9,
      // gmId: 0, roomId: 2,
      // gmId: 0, roomId: 15, // ISSUE
      // gmId: 1, roomId: 5,
      // gmId: 1, roomId: 22,
      // gmId: 2, roomId: 2,
      // gmId: 3, roomId: 26,

      initOpen: { 0: [24] },
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      panZoomApi: /** @type {PanZoom.CssApi} */ ({ ready: false }),
      npcsApi: /** @type {NPC.FullApi} */  ({ ready: false }),
      /** Container for HTML attached via terminal */
      hud: /** @type {HTMLDivElement} */ ({}),

      /** @param {Extract<NPC.NPCsEvent, { key: 'way-point' }>} e */
      async handlePlayerWayEvent(e) {
        // console.log('player way event', e);

        switch (e.meta.key) {
          case 'exit-room':
            // Player left a room
            if (e.meta.otherRoomId !== null) {
              [state.gmId, state.roomId] = [e.meta.gmId, e.meta.otherRoomId];
            } else {// Handle hull doors
              const adjCtxt = gmGraph.getAdjacentRoomCtxt(e.meta.gmId, e.meta.hullDoorId);
              if (adjCtxt) {
                [state.gmId, state.roomId] = [adjCtxt.adjGmId, adjCtxt.adjRoomId];
              }
            }
            state.updateAll();
            break;
          case 'enter-room':
            // Player can re-enter room from doorway without entering/exiting other
            if (!(state.gmId === e.meta.gmId && state.roomId === e.meta.enteredRoomId)) {
              state.gmId = e.meta.gmId;
              state.roomId = e.meta.enteredRoomId;
              state.updateAll();
            }
            break;
          case 'pre-exit-room':
            // If upcoming door closed stop player
            if (!(e.meta.doorId in state.doorsApi.open[e.meta.gmId])) {
              const player = state.npcsApi.getNpc(e.npcKey);
              await player.cancel();
            }
            break;
          default:
            throw testNever(e.meta);
        }
      },
      /** @param {string} npcKey */
      setRoomByNpc(npcKey) {
        const npc = state.npcsApi.getNpc(npcKey);
        const position = npc.getPosition();
        const found = gmGraph.findRoomContaining(position);
        if (found) {
          [state.gmId, state.roomId] = [found.gmId, found.roomId];
          state.updateAll();
        } else {// TODO error in terminal?
          console.error(`set-player ${npcKey}: no room contains ${JSON.stringify(position)}`)
        }
      },
      updateAll() {
        state.updateClipPath();
        state.updateVisibleDoors();
        update();
      },
      updateClipPath() {
        const gm = gms[state.gmId]
        const maskPolys = /** @type {Poly[][]} */ (gms.map(_ => []));
        const openDoorsIds = state.doorsApi.getOpen(state.gmId);

        // Compute light polygons for current geomorph and possibly adjacent ones
        const lightPolys = gmGraph.computeLightPolygons(state.gmId, state.roomId, openDoorsIds);
        // Compute respective maskPolys
        gms.forEach((otherGm, otherGmId) => {
          const polys = lightPolys.filter(x => otherGmId === x.gmIndex).map(x => x.poly.precision(2));
          if (otherGm === gm) {// Lights for current geomorph includes _current room_
            const roomWithDoors = gm.roomsWithDoors[state.roomId]
            // Cut one-by-one prevents Error like https://github.com/mfogel/polygon-clipping/issues/115
            maskPolys[otherGmId] = polys.concat(roomWithDoors).reduce((agg, cutPoly) => Poly.cutOut([cutPoly], agg), [otherGm.hullOutline])
            // maskPolys[otherGmId] = Poly.cutOut(polys.concat(roomWithDoors), [otherGm.hullOutline]);
          } else {
            maskPolys[otherGmId] = Poly.cutOut(polys, [otherGm.hullOutline]);
          }
        });
        // Set the clip-paths
        maskPolys.forEach((maskPoly, gmId) => {// <img> top-left needn't be at world origin
          maskPoly.forEach(poly => poly.translate(-gms[gmId].pngRect.x, -gms[gmId].pngRect.y));
          const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
          state.clipPath[gmId] = svgPaths.length ? `path('${svgPaths}')` : 'none';
        });
      },
      updateVisibleDoors() {
        const gm = gms[state.gmId]
        const roomNode = gm.roomGraph.nodesArray[state.roomId];

        /** Visible doors in current geomorph and possibly hull doors from other geomorphs */
        const nextVis = /** @type {number[][]} */ (gms.map(_ => []));
        nextVis[state.gmId] = gm.roomGraph.getAdjacentDoors(roomNode).map(x => x.doorId);
        gm.roomGraph.getAdjacentHullDoorIds(gm, roomNode).flatMap(({ hullDoorIndex }) =>
          gmGraph.getAdjacentRoomCtxt(state.gmId, hullDoorIndex) || []
        ).forEach(({ adjGmId, adjDoorId }) => (nextVis[adjGmId] = nextVis[adjGmId] || []).push(adjDoorId));

        gms.forEach((_, gmId) => this.doorsApi.setVisible(gmId, nextVis[gmId]));
      },
    };
  }, {
    overwrite: { gmId: true, roomId: true },
    deps: [gms, gmGraph],
  });

  React.useEffect(() => {
    if (gms.length && state.doorsApi.ready && state.npcsApi.ready) {
      state.updateAll();

      // Update Door graphics on change
      const doorsSub = state.doorsApi.events
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe(() => state.updateAll());

      // React to NPC events
      const npcsSub = state.npcsApi.events.subscribe((e) => {
        if (e.key === 'set-player') {
          state.npcsApi.playerKey = e.npcKey || null;
          e.npcKey && state.setRoomByNpc(e.npcKey)
        }
        if (e.key === 'way-point' && e.npcKey === state.npcsApi.playerKey) {
          state.handlePlayerWayEvent(e);
        }
        if (e.key === 'html') {
          if (e.html) {
            state.hud.innerHTML += e.html;
            const el = /** @type {HTMLElement} */ (state.hud.lastChild);
            e.className.split(' ').map(x => el.classList.add(x));
            el.style.position = 'absolute';
            el.style.transform = `translate(${e.point.x}px, ${e.point.y}px)`;
          } else {
            state.hud.querySelectorAll(`:scope > .${e.className.split(' ').join('.')}`).forEach(x => x.remove());
          }
        }
      });

      // TODO remove, use terminal for messaging instead
      state.hud = assertNonNull(state.panZoomApi.parent.querySelector('div.HUD'));

      return () => {
        doorsSub.unsubscribe();
        npcsSub.unsubscribe();
      };
    }
  }, [gms, state.doorsApi.ready, state.npcsApi.ready]);

  return gms.length ? (
    <CssPanZoom
      className={rootCss}
      initZoom={1.5}
      initCenter={{ x: 300, y: 300 }}
      dark
      // grid
      onLoad={api => {state.panZoomApi = api; update(); }}
    >
      {gms.map(gm =>
        <img
          className="geomorph"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            transform: gm.transformStyle,
            transformOrigin: gm.transformOrigin,
          }}
        />
      )}

      {state.doorsApi.ready && (
        <Debug
          // outlines
          // windows
          // localNav
          // roomOutlines
          showIds
          gms={gms}
          gmGraph={gmGraph}
          doorsApi={state.doorsApi}
          gmId={state.gmId}
          roomId={state.roomId}
          setRoom={(gmId, roomId) => {
            [state.gmId, state.roomId] = [gmId, roomId];
            state.updateAll();
          }}
        />
      )}

      {state.panZoomApi.ready && (
        <NPCs
          disabled={props.disabled}
          doorsApi={state.doorsApi}
          gmGraph={gmGraph}
          npcsKey={npcsKey}
          panZoomApi={state.panZoomApi}
          // Prevent reinvoke update() or HMR breaks
          onLoad={api => { !state.npcsApi.ready && (state.npcsApi = api) && update(); }}
        />
      )}

      {gms.map((gm, gmIndex) =>
        <img
          key={gmIndex}
          className="geomorph-dark"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            clipPath: state.clipPath[gmIndex],
            WebkitClipPath: state.clipPath[gmIndex],
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            transform: gm.transformStyle,
            transformOrigin: gm.transformOrigin,
          }}
        />
      )}

      <Doors
        gms={gms}
        gmGraph={gmGraph}
        initOpen={state.initOpen}
        npcsKey={npcsKey}
        onLoad={api => { state.doorsApi = api; update(); }}
      />

      <div className="HUD" />
      
    </CssPanZoom>
  ) : null;
}

const npcsKey = 'npcs-demo-1';
const debugRadius = 5;
const debugDoorOffset = 18;

/** @param {Geomorph.GeomorphData} gm */
const rootCss = css`
  img {
    position: absolute;
    transform-origin: top left;
    pointer-events: none;
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(34%);
    /* filter: invert(100%) brightness(55%) contrast(200%) brightness(60%); */
  }

  div.debug {
    position: absolute;
    div.debug-door-arrow {
      cursor: pointer;
      position: absolute;
      background-image: url('/icon/solid_arrow-circle-right.svg');
      border-radius: ${debugRadius}px;
    }
    div.debug-door-id-icon, div.debug-room-id-icon {
      position: absolute;
      background: black;
      color: white;
      font-size: 8px;
      line-height: 1;
      border: 1px solid black;
    }
    div.debug-room-id-icon {
      color: #4f4;
    }
    div.debug-window {
      position: absolute;
      background: #0000ff40;
      border: 1px solid white;
      pointer-events: none;
      transform-origin: top left;
    }
    svg.debug-room-nav, svg.debug-room-outline {
      position: absolute;
      pointer-events: none;
      path.nav-poly {
        pointer-events: none;
        fill: rgba(255, 0, 0, 0.1);
        stroke: blue;
      }
      path.room-outline {
        pointer-events: none;
        fill: rgba(0, 0, 255, 0.1);
        stroke: red;
      }
    }
  }

  div.HUD {
    position: relative;
  }
`;

/** @param {DebugProps} props Debug current geomorph */
function Debug(props) {
  const gm = props.gms[props.gmId];
  const visDoorIds = props.doorsApi.getVisible(props.gmId);
  const roomNavPoly = gm.lazy.roomNavPoly[props.roomId];
  const roomNavAabb = roomNavPoly.rect;
  const roomAabb = gm.rooms[props.roomId].rect;
  const roomPoly = gm.rooms[props.roomId];

  return (
    <div
      className="debug-parent"
      onClick={(e) => {
        const target = (/** @type {HTMLElement} */ (e.target));
        if (!target.hasAttribute('data-debug-door-index')) {
          return;
        }

        const door = gm.doors[Number(target.getAttribute('data-debug-door-index'))];

        const [otherRoomId] = door.roomIds.filter(id => id !== props.roomId);
        if (otherRoomId !== null) {// `door` is not a hull door
          return props.setRoom(props.gmId, otherRoomId);
        } else {
          const hullDoorId = gm.hullDoors.indexOf(door);
          const ctxt = props.gmGraph.getAdjacentRoomCtxt(props.gmId, hullDoorId);
          if (ctxt) {
            props.setRoom(ctxt.adjGmId, ctxt.adjRoomId);
          } else {
            console.info('hull door is isolated', props.gmId, hullDoorId);
          }
        }

      }}
    >
      {props.outlines && props.gms.map((gm, gmIndex) =>
        <div
          key={gmIndex}
          style={{
            position: 'absolute',
            left: gm.gridRect.x,
            top: gm.gridRect.y,
            width: gm.gridRect.width,
            height: gm.gridRect.height,
            border: '2px red solid',
          }}
        />  
      )}

      <div
        key={gm.itemKey}
        className="debug"
        /** Must transform local ordinates */
        style={{ transform: gm.transformStyle }}
      >

        {props.localNav && (
          <svg
            className="debug-room-nav"
            width={roomNavAabb.width}
            height={roomNavAabb.height}
            style={{
              left: roomNavAabb.x,
              top: roomNavAabb.y,
            }}
          >
            <g style={{ transform: `translate(${-roomNavAabb.x}px, ${-roomNavAabb.y}px)` }}>
              <path className="nav-poly" d={roomNavPoly.svgPath} />
              {visDoorIds.map(doorId => {
                const { seg: [src, dst] } = gm.doors[doorId];
                return <line key={doorId} stroke="red" x1={src.x} y1={src.y} x2={dst.x} y2={dst.y} />
              })}
            </g>
          </svg>
        )}

        {props.roomOutlines && (
          <svg
            className="debug-room-outline"
            width={roomAabb.width}
            height={roomAabb.height}
            style={{
              left: roomAabb.x,
              top: roomAabb.y,
            }}
          >
            <g style={{ transform: `translate(${-roomAabb.x}px, ${-roomAabb.y}px)` }}>
              <path className="room-outline" d={roomPoly.svgPath} />
            </g>
          </svg>
        )}

        {visDoorIds.map(doorId => {
          const { poly, normal, roomIds } = gm.doors[doorId];
          const sign = roomIds[0] === props.roomId ? 1 : -1;
          const angle = Vect.from(normal).scale(-sign).angle;
          const arrowPos = poly.center.addScaledVector(normal, sign * debugDoorOffset);
          const idIconPos = poly.center.addScaledVector(normal, -sign * debugDoorOffset);
          return <>
            <div
              key={doorId}
              data-debug-door-index={doorId}
              data-tags="debug door-arrow"
              className="debug-door-arrow"
              style={{
                left: arrowPos.x - debugRadius,
                top: arrowPos.y - debugRadius,
                width: debugRadius * 2,
                height: debugRadius * 2,
                transform: `rotate(${angle}rad)`,
                // filter: 'invert(100%)',
              }}
            />
            {props.showIds && (
              <div
                key="icon"
                className="debug-door-id-icon"
                style={{ left: idIconPos.x, top: idIconPos.y - 4 }}
              >
                {doorId}
              </div>
            )}
          </>;
        })}

        {props.showIds && (
          <div
            className="debug-room-id-icon"
            style={{ left: roomNavAabb.x + roomNavAabb.width - 35, top: roomNavAabb.y + 25 }}
          >
            {props.roomId}
          </div>
        )}

        {props.windows && gm.windows.map(({ baseRect, angle }, i) => {
          return (
            <div
              key={`window-${i}`}
              className="debug-window"
              style={{
                left: baseRect.x,
                top: baseRect.y,
                width: baseRect.width,
                height: baseRect.height,
                transform: `rotate(${angle}rad)`,
              }}
            />
          );
        })}

      </div>
    </div>
  );
}

/**
 * @typedef DebugProps @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 * @property {Graph.GmGraph} gmGraph
 * @property {NPC.DoorsApi} doorsApi
 * @property {number} gmId
 * @property {number} roomId
 * @property {(gmId: number, roomId: number) => void} setRoom
 * @property {boolean} [outlines]
 * @property {boolean} [windows]
 * @property {boolean} [localNav]
 * @property {boolean} [showIds]
 * @property {boolean} [roomOutlines]
 */
