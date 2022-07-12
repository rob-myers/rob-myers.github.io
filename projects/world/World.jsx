import React from "react";
import { filter, first, map, take } from "rxjs/operators";

import { removeCached, setCached } from "../service/query-client";
import { otag } from "../service/rxjs";
import { Vect } from "../geom";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../geomorph/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import NPCs, { State as NpcsApi } from "./NPCs";
import Doors, { State as DoorsApi } from "./Doors";
import Geomorphs from "./Floor";
import FOV, { State as FovApi } from "./FOV";
import DebugWorld from "./DebugWorld";
import useHandleEvents from "./use-handle-events";

/** @param {Props} props */
export default function World(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs(props.gms);

  const state = useStateRef(/** @type {() => State} */ () => ({

    doors: /** @type {DoorsApi} */  ({ ready: false }),
    fov: /** @type {FovApi} */  ({ ready: false }),
    npcs: /** @type {NpcsApi} */  ({ ready: false }),
    panZoom: /** @type {PanZoom.CssApi} */ ({ ready: false }),

    lib: {
      Vect,
      filter, first, map, take, otag,
    },

    updateAll() {
      state.fov.updateClipPath();
      state.doors.updateVisibleDoors();
      update();
    },

  }));

  useHandleEvents(state, gmGraph);

  React.useEffect(() => {
    setCached(props.worldKey, state);
    return () => removeCached(props.worldKey);
  }, []);

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

/**
 * @typedef Props @type {object}
 * @property {boolean} [disabled]
 * @property {Geomorph.UseGeomorphsDefItem[]} gms
 * @property {{ open?: {[gmId: number]: number[]} }} init
 * @property {string} worldKey
 */

/**
 * @typedef State @type {object}
 * @property {DoorsApi} doors
 * @property {PanZoom.CssApi} panZoom
 * @property {NpcsApi} npcs
 * @property {FovApi} fov
 * @property {() => void} updateAll
 * @property {StateUtil} lib
 */

/**
 * @typedef StateUtil Utility classes and `rxjs` functions
 * @type {object}
 * @property {typeof import('../geom').Vect} Vect
 * @property {import('../service/rxjs').filter} filter
 * @property {import('../service/rxjs').first} first
 * @property {import('../service/rxjs').map} map
 * @property {import('../service/rxjs').otag} otag
 * @property {import('../service/rxjs').take} take
 */
