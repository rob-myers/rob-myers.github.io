import React from "react";
import { css } from "goober";
import { filter } from "rxjs/operators";

import { testNever, visibleUnicodeLength } from "../service/generic";
import { geom } from "../service/geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Vect } from "../geom";
import { ansiColor } from "../sh/sh.util";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import useSessionStore from "../sh/session.store";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";
import Floor from "projects/version-1/Floor";

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

  /**
   * TODO 🚧 work towards <World/>
   * - floor goes into <Floor/> ✅
   * - lights go into <FOV/> 🚧
   * - <FOV/> support multiple roots (as in <LightsTest/>)
   * - npcsApi provided to <Doors/>
   * - move playerNearDoor, safeToCloseDoor, updateVisibleDoors into <Doors/>
   */

  const state = useStateRef(() => ({
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
    npcsApi: /** @type {NPC.NPCs} */  ({ ready: false }),

    /** @param {Extract<NPC.NPCsEvent, { key: 'way-point' }>} e */
    handleCollisions(e) {
      switch (e.meta.key) {
        case 'pre-collide': {
          const npc = state.npcsApi.getNpc(e.npcKey);
          const other = state.npcsApi.getNpc(e.meta.otherNpcKey);
          npc.cancel();
          other.cancel();
          break;
        }
        case 'start-seg': {
          const npc = state.npcsApi.getNpc(e.npcKey);
          const others = Object.values(state.npcsApi.npc).filter(x => x !== npc);

          // TODO efficiency
          for (const other of others) {
            const collision = state.npcsApi.detectCollision(npc, other);

            if (collision) {// Add wayMeta cancelling motion
              console.warn(`${npc.key} will collide with ${other.key}`, collision);
              const length = e.meta.length + collision.distA;
              const insertIndex = npc.anim.wayMetas.findIndex(x => x.length >= length);
              npc.anim.wayMetas.splice(insertIndex, 0, {
                key: 'pre-collide',
                index: e.meta.index,
                otherNpcKey: other.key,
                gmId: e.meta.gmId,
                length,
              });
            }
          }
          break;
        }
      }
    },
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
        case 'pre-near-door':
          // If upcoming door is closed, stop player
          if (!state.doorsApi.open[e.meta.gmId][e.meta.doorId]) {
            const player = state.npcsApi.getNpc(e.npcKey);
            await player.cancel();
          }
          break;
        case 'start-seg':
        case 'pre-collide':
          break;
        default:
          throw testNever(e.meta);
      }
    },
    /**
     * @param {number} gmId 
     * @param {number} doorId 
     */
    playerNearDoor(gmId, doorId) {
      const player = state.npcsApi.getPlayer();
      if (!player) { // If no player, we are "everywhere"
        return true;
      }
      const center = player.getPosition();
      const radius = state.npcsApi.getNpcInteractRadius();
      const door = gms[gmId].doors[doorId];
      const convexPoly = door.poly.clone().applyMatrix(gms[gmId].matrix);
      return geom.circleIntersectsConvexPolygon(center, radius, convexPoly);
    },
    /**
     * @param {number} gmId 
     * @param {number} doorId 
     */
    safeToCloseDoor(gmId, doorId) {
      const door = gms[gmId].doors[doorId];
      const convexPoly = door.poly.clone().applyMatrix(gms[gmId].matrix);
      const closeNpcs = state.npcsApi.getNpcsIntersecting(convexPoly);
      return closeNpcs.length === 0;
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

      /** Visible doors in current geomorph and possibly hull doors from other geomorphs */
      const nextVis = /** @type {number[][]} */ (gms.map(_ => []));
      nextVis[state.gmId] = gm.roomGraph.getAdjacentDoors(state.roomId).map(x => x.doorId);
      gm.roomGraph.getAdjacentHullDoorIds(gm, state.roomId).flatMap(({ hullDoorIndex }) =>
        gmGraph.getAdjacentRoomCtxt(state.gmId, hullDoorIndex) || []
      ).forEach(({ adjGmId, adjDoorId }) => (nextVis[adjGmId] = nextVis[adjGmId] || []).push(adjDoorId));

      gms.forEach((_, gmId) => this.doorsApi.setVisible(gmId, nextVis[gmId]));
    },
  }), {
    overwrite: { gmId: true, roomId: true },
    deps: [gms, gmGraph],
  });

  React.useEffect(() => {
    if (gms.length && state.doorsApi.ready && state.npcsApi.ready) {
      state.updateAll();

      // Update Door graphics on change
      // Saw HMR issue here when edit Doors and toggle door
      const doorsSub = state.doorsApi.events
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe(() => state.updateAll());

      // React to NPC events
      const npcsSub = state.npcsApi.events.subscribe((e) => {
        switch (e.key) {
          case 'decor':
            state.npcsApi.setDecor(e.meta.key, e.meta);
            break;
          case 'set-player':
            state.npcsApi.playerKey = e.npcKey || null;
            e.npcKey && state.setRoomByNpc(e.npcKey)
            break;
          case 'spawned-npc':
            if (state.npcsApi.playerKey === e.npcKey) {
              state.setRoomByNpc(e.npcKey);
            }
            break;
          case 'started-walking':
          case 'stopped-walking':
            break;
          case 'way-point':
            if (e.npcKey === state.npcsApi.playerKey) {
              state.handlePlayerWayEvent(e);
            }
            if (e.meta.key === 'start-seg' || e.meta.key === 'pre-collide') {
              state.handleCollisions(e); // Player agnostic?
            }
            break;
          default:
            throw testNever(e);
        }
      });

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
      <Floor gms={gms} />

      {state.doorsApi.ready && (
        <Debug
          // outlines
          // windows
          // localNav
          // roomOutlines
          showIds
          showLabels

          doorsApi={state.doorsApi}
          gms={gms}
          gmGraph={gmGraph}
          gmId={state.gmId}
          npcsApi={state.npcsApi}
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

      {gms.map((gm, gmId) =>
        <img
          key={gmId}
          className="geomorph-dark"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            clipPath: state.clipPath[gmId],
            WebkitClipPath: state.clipPath[gmId],
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
        playerNearDoor={state.playerNearDoor}
        safeToCloseDoor={state.safeToCloseDoor}
        onLoad={api => { !state.doorsApi.ready && (state.doorsApi = api) && update(); }}
      />

    </CssPanZoom>
  ) : null;
}

const npcsKey = 'npcs-demo-1';
const debugRadius = 5;
const debugDoorOffset = 10;

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

    div.debug-door-arrow, div.debug-label-info {
      cursor: pointer;
      position: absolute;
      border-radius: ${debugRadius}px;
    }
    div.debug-door-arrow {
      background-image: url('/icon/solid_arrow-circle-right.svg');
    }
    div.debug-label-info {
      background-image: url('/icon/info-icon.svg');
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
`;

/** @param {DebugProps} props Debug current geomorph */
function Debug(props) {
  const gm = props.gms[props.gmId];
  const visDoorIds = props.doorsApi.getVisible(props.gmId);
  const roomNavPoly = gm.lazy.roomNavPoly[props.roomId];
  const roomNavAabb = roomNavPoly.rect;
  const roomAabb = gm.rooms[props.roomId].rect;
  const roomPoly = gm.rooms[props.roomId];
  const roomLabel = gm.point[props.roomId].labels.find(x => x.tags.includes('room'));

  const onClick = React.useCallback(/** @param {React.MouseEvent<HTMLDivElement>} e */ async (e) => {
    const target = (/** @type {HTMLElement} */ (e.target));

    if (target.className === 'debug-door-arrow') {
      /**
       * Manual light control.
       */
      const door = gm.doors[Number(target.getAttribute('data-debug-door-id'))];
      const hullDoorId = gm.getHullDoorId(door);
      if (hullDoorId >= 0) {
        const ctxt = props.gmGraph.getAdjacentRoomCtxt(props.gmId, hullDoorId);
        if (ctxt) props.setRoom(ctxt.adjGmId, ctxt.adjRoomId);
        else console.info('hull door is isolated', props.gmId, hullDoorId);
      } else {
        return props.setRoom(props.gmId, gm.getOtherRoomId(door, props.roomId));
      }
    }

    if (target.className === 'debug-label-info') {
      /**
       * Send our first rich message.
       */
      const label = gm.labels[Number(target.getAttribute('data-debug-label-id'))];

      const numDoors = gm.roomGraph.getAdjacentDoors(props.roomId).length;
      const line = `ℹ️  [${ansiColor.Blue}${label.text}${ansiColor.Reset
        }] with ${numDoors} door${numDoors > 1 ? 's' : ''}`;
        
      const sessionCtxts = Object.values(props.npcsApi.session).filter(x => x.receiveMsgs);
      for (const { key: sessionKey } of sessionCtxts) {
        const globalLineNumber = await useSessionStore.api.writeMsgCleanly(sessionKey, line);
        props.npcsApi.addTtyLineCtxts(sessionKey, globalLineNumber, [{
          lineNumber: globalLineNumber,
          lineText: line, 
          linkText: label.text,
          linkStartIndex: visibleUnicodeLength('ℹ️  ['),
          key: 'room', gmId: props.gmId, roomId: props.roomId,
        }]);
      }
    }

  }, [gm, props]);

  return (
    <div className="debug-parent" onClick={onClick}>
      {props.outlines && props.gms.map((gm, gmId) =>
        <div
          key={gmId}
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
          return [
            <div
              key={doorId}
              data-debug-door-id={doorId}
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
            ,
            props.showIds && (
              <div
                key={"icon" + doorId}
                className="debug-door-id-icon"
                style={{ left: idIconPos.x, top: idIconPos.y - 4 }}
              >
                {doorId}
              </div>
            )
          ];
        })}

        {props.showIds && (
          <div
            className="debug-room-id-icon"
            style={{ left: roomNavAabb.x + roomNavAabb.width - 35, top: roomNavAabb.y + 25 }}
          >
            {props.roomId}
          </div>
        )}

        {props.showLabels && roomLabel && (
          <div
            key={roomLabel.index}
            data-debug-label-id={roomLabel.index}
            data-tags="debug label-icon"
            className="debug-label-info"
            title={roomLabel.text}
            style={{
              left: roomLabel.center.x - debugRadius,
              top: roomLabel.center.y - debugRadius,
              width: debugRadius * 2,
              height: debugRadius * 2,
              filter: 'invert(100%)',
            }}
          />
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
 * @property {NPC.DoorsApi} doorsApi
 * @property {Graph.GmGraph} gmGraph
 * @property {number} gmId
 * @property {NPC.NPCs} npcsApi
 * @property {number} roomId
 * @property {(gmId: number, roomId: number) => void} setRoom
 * @property {boolean} [outlines]
 * @property {boolean} [windows]
 * @property {boolean} [localNav]
 * @property {boolean} [showIds]
 * @property {boolean} [showLabels]
 * @property {boolean} [roomOutlines]
 */
