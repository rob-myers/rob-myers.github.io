import React from "react";
import { css } from "goober";
import { filter } from "rxjs/operators";

import { testNever, visibleUnicodeLength } from "../service/generic";
import { Poly, Vect } from "../geom";
import { ansiColor } from "../sh/sh.util";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import useSessionStore from "../sh/session.store";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors, { State as DoorsApi } from "../geomorph/Doors";
import NPCs from "../npc/NPCs";
import Floor from "../version-1/Floor";
import FOV, { State as FovApi } from "../version-1/FOV";

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

  const state = useStateRef(() => /** @type {State} */ ({

    initOpen: { 0: [24] },

    doorsApi: /** @type {DoorsApi} */  ({ ready: false }),
    panZoomApi: /** @type {PanZoom.CssApi} */ ({ ready: false }),
    npcsApi: /** @type {NPC.NPCs} */  ({ ready: false }),
    fovApi: /** @type {FovApi} */  ({ ready: false }),

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
    async handlePlayerWayEvent(e) {
      // console.log('player way event', e);

      switch (e.meta.key) {
        case 'exit-room':
          // Player left a room
          if (e.meta.otherRoomId !== null) {
            state.fovApi.setRoom(e.meta.gmId, e.meta.otherRoomId);
          } else {// Handle hull doors
            const adjCtxt = gmGraph.getAdjacentRoomCtxt(e.meta.gmId, e.meta.hullDoorId);
            adjCtxt && state.fovApi.setRoom(adjCtxt.adjGmId, adjCtxt.adjRoomId);
          }
          state.updateAll();
          break;
        case 'enter-room':
          if (state.fovApi.setRoom(e.meta.gmId, e.meta.enteredRoomId)) {
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
    updateAll() {
      state.fovApi.updateClipPath();
      state.doorsApi.updateVisibleDoors();
      update();
    },
  }), {
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
        switch (e.key) {
          case 'decor':
            state.npcsApi.setDecor(e.meta.key, e.meta);
            break;
          case 'set-player':
            state.npcsApi.playerKey = e.npcKey || null;
            e.npcKey && state.npcsApi.setRoomByNpc(e.npcKey);
            break;
          case 'spawned-npc':
            if (state.npcsApi.playerKey === e.npcKey) {
              state.npcsApi.setRoomByNpc(e.npcKey);
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

      {state.doorsApi.ready && state.fovApi.ready && (
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
          gmId={state.fovApi.gmId}
          npcsApi={state.npcsApi}
          roomId={state.fovApi.roomId}
          setRoom={state.fovApi.setRoom}
        />
      )}

      <NPCs
        disabled={props.disabled}
        gmGraph={gmGraph}
        npcsKey={npcsKey}
        onLoad={api => { state.npcsApi = api; update(); }}
        worldApi={state}
      />

      <FOV
        gmGraph={gmGraph}
        onLoad={api => { state.fovApi = api; update(); }}
        worldApi={state}
      />

      <Doors
        gmGraph={gmGraph}
        initOpen={state.initOpen}
        onLoad={api => { state.doorsApi = api; update(); }}
        worldApi={state}
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
 * @typedef State @type {object}
 * @property {{ [gmId: number]: number[] }} initOpen
 * @property {DoorsApi} doorsApi
 * @property {PanZoom.CssApi} panZoomApi
 * @property {NPC.NPCs} npcsApi
 * @property {FovApi} fovApi
 * @property {(e: Extract<NPC.NPCsEvent, { key: 'way-point' }>) => void} handleCollisions
 * @property {(e: Extract<NPC.NPCsEvent, { key: 'way-point' }>) => void} handlePlayerWayEvent
 * @property {() => void} updateAll
 */

/**
 * @typedef DebugProps @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 * @property {DoorsApi} doorsApi
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
