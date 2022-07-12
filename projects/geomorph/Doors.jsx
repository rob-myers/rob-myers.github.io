import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { Subject } from "rxjs";
import { assertNonNull, pause } from "../service/generic";
import { fillPolygon } from "../service/dom";
import { cssName, doorWidth, hullDoorWidth } from "../service/const";
import { geom } from "../service/geom";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";

/**
 * @param {Props} props
 */
export default function Doors(props) {

  const update = useUpdate();

  const { gms } = props.gmGraph;

  const state = useStateRef(/** @type {() => State} */ () => ({
    canvas: [],
    events: new Subject,
    open: gms.map((gm, gmId) =>
      gm.doors.map((_, doorId) => props.initOpen[gmId]?.includes(doorId) || false)
    ),
    ready: true,
    rootEl: /** @type {HTMLDivElement} */ ({}),
    vis: gms.map(_ => ({})),

    /** @param {number} gmId */
    drawInvisibleInCanvas(gmId) {
      const canvas = state.canvas[gmId];
      const ctxt = assertNonNull(canvas.getContext('2d'));
      const gm = gms[gmId];

      ctxt.setTransform(1, 0, 0, 1, 0, 0);
      ctxt.clearRect(0, 0, canvas.width, canvas.height);
      ctxt.setTransform(1, 0, 0, 1, -gm.pngRect.x, -gm.pngRect.y);
      ctxt.fillStyle = '#555';

      // Handle extension of open visible doors (orig via `relate-connectors` tag)
      const relDoorIds = gm.doors.flatMap((_, i) =>
        state.vis[gmId][i] && state.open[gmId][i] && gm.relDoorId[i]?.doorIds || []
      ).filter(doorId => state.open[gmId][doorId]);
      
      gm.doors.forEach(({ poly }, doorId) => {
        if (!state.vis[gmId][doorId] && !relDoorIds.includes(doorId)) {
          fillPolygon(ctxt, [poly]);
        }
      });
    },
    getClosed(gmId) {
      return state.open[gmId].flatMap((open, doorId) => open ? [] : doorId);
    },
    getOpen(gmId) {
      return state.open[gmId].flatMap((open, doorId) => open ? doorId : []);
    },
    getVisible(gmId) {
      return Object.keys(state.vis[gmId]).map(Number);
    },
    async onToggleDoor(e) {
      const gmIdAttr = /** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-id');
      const gmId = Number(gmIdAttr);
      const doorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-door-id'));
      const hullDoorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-hull-door-id'));

      const gmDoorNode = hullDoorId === -1 ? null : props.gmGraph.getDoorNodeByIds(gmId, hullDoorId);
      const sealed = gmDoorNode?.sealed || gms[gmId].doors[doorId].tags.includes('sealed');

      if (gmIdAttr === null || !state.vis[gmId][doorId] || sealed) {
        return; // Not a door, or not visible, or sealed permanently
      }

      if (!state.playerNearDoor(gmId, doorId)) {
        return;
      }

      if (state.open[gmId][doorId] && !state.safeToCloseDoor(gmId, doorId)) {
        return;
      }

      if (state.open[gmId][doorId]) {// Animate close slightly early
        const visDoorId = [...Array(doorId)].reduce((agg, _, preId) => state.vis[gmId][preId] ? agg + 1 : agg, 0);
        state.rootEl.children[gmId].children[visDoorId].classList.remove('open');
        await pause(hullDoorId === -1 ? 300/2 : 600/2);
      }

      // Toggle the door
      state.open[gmId][doorId] = !state.open[gmId][doorId];
      const key = state.open[gmId][doorId] ? 'opened-door' : 'closed-door';
      state.events.next({ key, gmId, doorId });

      // Unsealed hull doors have adjacent door, which must also be toggled
      const adjHull = hullDoorId !== -1 ? props.gmGraph.getAdjacentRoomCtxt(gmId, hullDoorId) : null;
      if (adjHull) {
        state.open[adjHull.adjGmId][adjHull.adjDoorId] = state.open[gmId][doorId];
        state.events.next({ key, gmId: adjHull.adjGmId, doorId: adjHull.adjDoorId });
      }
    },
    playerNearDoor(gmId, doorId) {
      const { npcs } = props.api;
      const player = npcs.getPlayer();
      if (!player) { // If no player, we are "everywhere"
        return true;
      }
      const center = player.getPosition();
      const radius = npcs.getNpcInteractRadius();
      const door = gms[gmId].doors[doorId];
      const convexPoly = door.poly.clone().applyMatrix(gms[gmId].matrix);
      return geom.circleIntersectsConvexPolygon(center, radius, convexPoly);
    },
    safeToCloseDoor(gmId, doorId) {
      const door = gms[gmId].doors[doorId];
      const convexPoly = door.poly.clone().applyMatrix(gms[gmId].matrix);
      const closeNpcs = props.api.npcs.getNpcsIntersecting(convexPoly);
      return closeNpcs.length === 0;
    },
    setVisible(gmId, doorIds) {
      state.vis[gmId] = doorIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
      state.drawInvisibleInCanvas(gmId);
      update();
    },
    updateVisibleDoors() {
      const { fov } = props.api;
      const gm = gms[fov.gmId]

      /** Visible doors in current geomorph and possibly hull doors from other geomorphs */
      const nextVis = /** @type {number[][]} */ (gms.map(_ => []));
      nextVis[fov.gmId] = gm.roomGraph.getAdjacentDoors(fov.roomId).map(x => x.doorId);
      gm.roomGraph.getAdjacentHullDoorIds(gm, fov.roomId).flatMap(({ hullDoorIndex }) =>
        props.gmGraph.getAdjacentRoomCtxt(fov.gmId, hullDoorIndex) || []
      ).forEach(({ adjGmId, adjDoorId }) => (nextVis[adjGmId] = nextVis[adjGmId] || []).push(adjDoorId));

      gms.forEach((_, gmId) => state.setVisible(gmId, nextVis[gmId]));
    },
  }), {
    deps: [props.api],
  });

  React.useEffect(() => {
    props.onLoad(state);
  }, []);

  React.useEffect(() => {
    gms.forEach((_, gmId) => state.drawInvisibleInCanvas(gmId));
    /** @param {PointerEvent} e */
    const cb = (e) => state.onToggleDoor(e);
    state.rootEl.addEventListener('pointerup', cb);
    return () => void state.rootEl.removeEventListener('pointerup', cb);
  }, [gms]);
  
  return (
    <div
      ref={el => el && (state.rootEl = el)}
      className={classNames(cssName.doors, rootCss)}
    >
      {gms.map((gm, gmId) => (
        <div
          key={gm.itemKey}
          style={{
            transform: gm.transformStyle,
          }}
        >
          {gm.doors.map((door, i) =>
            state.vis[gmId][i] &&
              <div
                key={i}
                className={classNames(cssName.door, {
                  [cssName.hull]: door.tags.includes('hull'),
                  [cssName.iris]: door.tags.includes('iris'),
                  [cssName.open]: state.open[gmId][i],
                })}
                style={{
                  left: door.baseRect.x,
                  top: door.baseRect.y,
                  width: door.baseRect.width,
                  height: door.baseRect.height,
                  transform: `rotate(${door.angle}rad)`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  className={cssName.doorTouchUi}
                  data-gm-id={gmId}
                  data-door-id={i}
                  data-hull-door-id={gm.hullDoors.indexOf(door)}
                />
              </div>
            )
          }
          <canvas
            ref={(el) => el && (state.canvas[gmId] = el)}
            width={gm.pngRect.width}
            height={gm.pngRect.height}
            style={{ left: gm.pngRect.x, top: gm.pngRect.y }}
          />
        </div>
      ))}
    </div>
  );
}

const rootCss = css`
  --npc-door-touch-radius: 10px;

  position: absolute;

  canvas {
    position: absolute;
    pointer-events: none;
  }

  div.door {
    position: absolute;
    pointer-events: none;
    
    .door-touch-ui {
      cursor: pointer;
      pointer-events: all;
      position: absolute;

      width: calc(100% + 2 * var(--npc-door-touch-radius));
      min-width: calc( 2 * var(--npc-door-touch-radius) );
      top: calc(-1 * var(--npc-door-touch-radius) + ${ doorWidth / 2 }px ); /** 5px for hull */
      left: calc(-1 * var(--npc-door-touch-radius));
      height: calc(2 * var(--npc-door-touch-radius));

      background: rgba(100, 0, 0, 0.1);
      border-radius: var(--npc-door-touch-radius);
    }

    &:not(.iris) {
      background: #444;
      border: 1px solid #999;

      transition: width 300ms ease-in;
      &.open {
        width: 4px !important;
      }
    }

    &.hull {
      transition: width 600ms ease-in;
      .door-touch-ui {
        top: calc(-1 * var(--npc-door-touch-radius) + ${ hullDoorWidth / 2 }px );
      }
    }

    &.iris {
      background-image: linear-gradient(45deg, #000 33.33%, #888 33.33%, #888 50%, #000 50%, #000 83.33%, #888 83.33%, #aaa 100%);
      background-size: 4.24px 4.24px;
      border: 1px solid #aaa;
      
      opacity: 1;
      transition: opacity 300ms ease;
      &.open {
        opacity: 0.2;
      }
    }
  }
`;

/**
 * @typedef Props @type {object}
 * @property {Graph.GmGraph} gmGraph
 * @property {import('../example/NavDemo1').State} api
 * @property {{ [gmId: number]: number[] }} initOpen
 * @property {(doorsApi: State) => void} onLoad
 */

/**
 * @typedef State @type {object}
 * @property {HTMLCanvasElement[]} canvas
 * @property {(gmId: number) => void} drawInvisibleInCanvas
 * @property {import('rxjs').Subject<NPC.DoorMessage>} events
 * @property {(gmId: number) => number[]} getClosed
 * @property {(gmId: number) => number[]} getOpen Get ids of open doors
 * @property {(gmId: number) => number[]} getVisible
 * @property {(e: PointerEvent) => void} onToggleDoor
 * @property {(gmId: number, doorId: number) => boolean} playerNearDoor
 * @property {boolean[][]} open open[gmId][doorId]
 * @property {boolean} ready
 * @property {HTMLDivElement} rootEl
 * @property {(gmId: number, doorId: number) => boolean} safeToCloseDoor
 * @property {(gmId: number, doorIds: number[]) => void} setVisible
 * @property {() => void} updateVisibleDoors
 * @property {{ [doorId: number]: true }[]} vis
 */
