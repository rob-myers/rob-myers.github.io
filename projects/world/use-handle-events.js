import React from "react";
import { filter } from "rxjs/operators";
import { testNever } from "../service/generic";
import useStateRef from "../hooks/use-state-ref";

/**
 * @param {import('../example/NavDemo1').State} api
 * @param {Graph.GmGraph} gmGraph
 */
export default function useHandleEvents(api, gmGraph) {

  const state = useStateRef(() => /** @type {State} */ ({

    handleCollisions(e) {
      switch (e.meta.key) {
        case 'pre-collide': {
          const npc = api.npcs.getNpc(e.npcKey);
          const other = api.npcs.getNpc(e.meta.otherNpcKey);
          npc.cancel();
          other.cancel();
          break;
        }
        case 'start-seg': {
          const npc = api.npcs.getNpc(e.npcKey);
          const others = Object.values(api.npcs.npc).filter(x => x !== npc);

          // TODO efficiency
          for (const other of others) {
            const collision = api.npcs.detectCollision(npc, other);

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
            api.fov.setRoom(e.meta.gmId, e.meta.otherRoomId);
          } else {// Handle hull doors
            const adjCtxt = gmGraph.getAdjacentRoomCtxt(e.meta.gmId, e.meta.hullDoorId);
            adjCtxt && api.fov.setRoom(adjCtxt.adjGmId, adjCtxt.adjRoomId);
          }
          api.updateAll();
          break;
        case 'enter-room':
          if (api.fov.setRoom(e.meta.gmId, e.meta.enteredRoomId)) {
            api.updateAll();
          }
          break;
        case 'pre-exit-room':
        case 'pre-near-door':
          // If upcoming door is closed, stop player
          if (!api.doors.open[e.meta.gmId][e.meta.doorId]) {
            const player = api.npcs.getNpc(e.npcKey);
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
  }), {
    deps: [gmGraph],
  });

  const { gms } = gmGraph;

  React.useEffect(() => {
    if (gms.length && api.doors.ready && api.npcs.ready) {
      api.updateAll();

      // Update doors and lights on change
      const doorsSub = api.doors.events
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe(() => api.updateAll());

      // React to NPC events
      const npcsSub = api.npcs.events.subscribe((e) => {
        switch (e.key) {
          case 'decor':
            api.npcs.setDecor(e.meta.key, e.meta);
            break;
          case 'set-player':
            api.npcs.playerKey = e.npcKey || null;
            e.npcKey && api.npcs.setRoomByNpc(e.npcKey);
            break;
          case 'spawned-npc':
            if (api.npcs.playerKey === e.npcKey) {
              api.npcs.setRoomByNpc(e.npcKey);
            }
            break;
          case 'started-walking':
          case 'stopped-walking':
            break;
          case 'way-point':
            if (e.npcKey === api.npcs.playerKey) {
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
  }, [gms, api.doors.ready, api.npcs.ready]);

}

/**
 * @typedef State @type {object}
 * @property {(e: NPC.NPCsWayEvent) => void} handleCollisions
 * @property {(e: NPC.NPCsWayEvent) => void} handlePlayerWayEvent
 */
