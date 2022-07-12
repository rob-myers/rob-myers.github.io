/**
 * TODO
 * - replaces NavDemo1
 * - parametric in`Geomorph.UseGeomorphsDefItem[]`
 * - tidies various initialization issues
 */

import { Poly } from "../geom";
import { testNever } from "../service/generic";
import { geom } from "../service/geom";
import useUpdate from "../hooks/use-update";
import useGeomorphs from "../geomorph/use-geomorphs";
import useStateRef from "../hooks/use-state-ref";
import { State as DoorsApi } from '../world/Doors';

/** @param {Props} props */
export default function World(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs(props.geomorphs);

  /**
   * TODO
   * - rethinking below in NavDemo1
   */

  const state = useStateRef(() => ({
    gmId: 0,
    roomId: 0,
    initOpen: props.init.openDoors || {},
    clipPath: gms.map(_ => 'none'),

    doorsApi: /** @type {DoorsApi} */  ({ ready: false }),
    panZoomApi: /** @type {PanZoom.CssApi} */ ({ ready: false }),
    npcsApi: /** @type {NPC.NPCs} */  ({ ready: false }),

    /**
     * Handle waypoint metas concerning collisions with other npcs
     * @param {Extract<NPC.NPCsEvent, { key: 'way-point' }>} e
     */
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
    /**
     * Handle waypoint metas concerning player specific stuff
     * @param {Extract<NPC.NPCsEvent, { key: 'way-point' }>} e
     */
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

  return null;
}

/**
 * @typedef Props @type {object}
 * @property {Geomorph.UseGeomorphsDefItem[]} geomorphs
 * @property {{ openDoors?: { [doorId: number]: number[]} }} init
 * @property {string} npcsKey
 * @property {boolean} [disabled]
 */
