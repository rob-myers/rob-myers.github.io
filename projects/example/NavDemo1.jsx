import React from "react";
import { css } from "goober";
import { filter } from "rxjs/operators";

import { testNever } from "../service/generic";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import NPCs from "../npc/NPCs";
import Doors, { State as DoorsApi } from "../geomorph/Doors";
import Floor from "../vs-1/Floor";
import FOV, { State as FovApi } from "../vs-1/FOV";
import DebugWorld from "../vs-1/DebugWorld";

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

      <DebugWorld
        // outlines
        // windows
        // localNav
        // roomOutlines
        showIds
        showLabels

        gms={gms}
        gmGraph={gmGraph}
        worldApi={state}
      />

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
