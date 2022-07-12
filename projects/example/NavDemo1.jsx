import React from "react";
import { filter } from "rxjs/operators";

import { testNever } from "../service/generic";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import NPCs from "../npc/NPCs";
import Doors, { State as DoorsApi } from "../geomorph/Doors";
import Geomorphs from "../world/Floor";
import FOV, { State as FovApi } from "../world/FOV";
import DebugWorld from "../world/DebugWorld";

/** @param {Props} props */
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

    doors: /** @type {DoorsApi} */  ({ ready: false }),
    fov: /** @type {FovApi} */  ({ ready: false }),
    npcs: /** @type {NPC.NPCs} */  ({ ready: false }),
    panZoom: /** @type {PanZoom.CssApi} */ ({ ready: false }),

    handleCollisions(e) {
      switch (e.meta.key) {
        case 'pre-collide': {
          const npc = state.npcs.getNpc(e.npcKey);
          const other = state.npcs.getNpc(e.meta.otherNpcKey);
          npc.cancel();
          other.cancel();
          break;
        }
        case 'start-seg': {
          const npc = state.npcs.getNpc(e.npcKey);
          const others = Object.values(state.npcs.npc).filter(x => x !== npc);

          // TODO efficiency
          for (const other of others) {
            const collision = state.npcs.detectCollision(npc, other);

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
            state.fov.setRoom(e.meta.gmId, e.meta.otherRoomId);
          } else {// Handle hull doors
            const adjCtxt = gmGraph.getAdjacentRoomCtxt(e.meta.gmId, e.meta.hullDoorId);
            adjCtxt && state.fov.setRoom(adjCtxt.adjGmId, adjCtxt.adjRoomId);
          }
          state.updateAll();
          break;
        case 'enter-room':
          if (state.fov.setRoom(e.meta.gmId, e.meta.enteredRoomId)) {
            state.updateAll();
          }
          break;
        case 'pre-exit-room':
        case 'pre-near-door':
          // If upcoming door is closed, stop player
          if (!state.doors.open[e.meta.gmId][e.meta.doorId]) {
            const player = state.npcs.getNpc(e.npcKey);
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
      state.fov.updateClipPath();
      state.doors.updateVisibleDoors();
      update();
    },
  }), {
    deps: [gms, gmGraph],
  });

  React.useEffect(() => {
    if (gms.length && state.doors.ready && state.npcs.ready) {
      state.updateAll();

      // Update doors and lights on change
      const doorsSub = state.doors.events
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe(() => state.updateAll());

      // React to NPC events
      const npcsSub = state.npcs.events.subscribe((e) => {
        switch (e.key) {
          case 'decor':
            state.npcs.setDecor(e.meta.key, e.meta);
            break;
          case 'set-player':
            state.npcs.playerKey = e.npcKey || null;
            e.npcKey && state.npcs.setRoomByNpc(e.npcKey);
            break;
          case 'spawned-npc':
            if (state.npcs.playerKey === e.npcKey) {
              state.npcs.setRoomByNpc(e.npcKey);
            }
            break;
          case 'started-walking':
          case 'stopped-walking':
            break;
          case 'way-point':
            if (e.npcKey === state.npcs.playerKey) {
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
  }, [gms, state.doors.ready, state.npcs.ready]);

  return gms.length ? (
    <CssPanZoom
      initZoom={1.5}
      initCenter={{ x: 300, y: 300 }}
      dark
      // grid
      onLoad={api => {state.panZoom = api; update(); }}
    >
      <Geomorphs
        gms={gms}
      />

      <DebugWorld
        // localNav
        // outlines
        // roomOutlines
        showIds
        showLabels
        // windows
        api={state}
        gmGraph={gmGraph}
      />

      <NPCs
        api={state}
        disabled={props.disabled}
        gmGraph={gmGraph}
        npcsKey={npcsKey}
        onLoad={api => { state.npcs = api; update(); }}
      />

      <FOV
        api={state}
        gmGraph={gmGraph}
        onLoad={api => { state.fov = api; update(); }}
      />

      <Doors
        api={state}
        gmGraph={gmGraph}
        init={props.init.open}
        onLoad={api => { state.doors = api; update(); }}
      />

    </CssPanZoom>
  ) : null;
}

const npcsKey = 'npcs-demo-1';

/**
 * @typedef Props @type {object}
 * @property {boolean} [disabled]
 * @property {{ open?: {[gmId: number]: number[]} }} init
 */

/**
 * @typedef State @type {object}
 * @property {DoorsApi} doors
 * @property {PanZoom.CssApi} panZoom
 * @property {NPC.NPCs} npcs
 * @property {FovApi} fov
 * @property {(e: NPC.NPCsWayEvent) => void} handleCollisions
 * @property {(e: NPC.NPCsWayEvent) => void} handlePlayerWayEvent
 * @property {() => void} updateAll
 */
