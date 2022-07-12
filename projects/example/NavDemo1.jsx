import React from "react";

import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../geomorph/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import NPCs from "../world/NPCs";
import Doors, { State as DoorsApi } from "../world/Doors";
import Geomorphs from "../world/Floor";
import FOV, { State as FovApi } from "../world/FOV";
import DebugWorld from "../world/DebugWorld";
import useHandleEvents from "projects/world/use-handle-events";

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

    updateAll() {
      state.fov.updateClipPath();
      state.doors.updateVisibleDoors();
      update();
    },

  }));

  useHandleEvents(state, gmGraph);

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
 * @property {() => void} updateAll
 */
