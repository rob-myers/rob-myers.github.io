import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Mat, Poly } from "../geom";
import { allLayoutKeys } from "../service/geomorph";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

// TODO
// - 🚧 current state is [gm id, hole id]
// - 🚧 light propagates over geomorph boundary
// - 🚧 GmGraph has windows

// TODO
// - 🚧 spawn from TTY
//   - ✅ symbols have points tagged 'spawn'
//   - ✅ implement spawn as shell function
//   - default spawn to 1st (in hull or first symbol with a spawn point)
//   - can specify point to spawn from
// - Andros is situated and lighting reacts

/** @param {{ disabled?: boolean }} props */
export default function NavDemo1(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 20 + 1200 + 600 + 20], },
  ]);

  const state = useMuState(() => {
    return {
      clipPath: allLayoutKeys.reduce(
        (agg, key) => ({ ...agg, [key]: 'none' }),
        /** @type {Record<Geomorph.LayoutKey, string>} */ ({}),
      ),
      /**
       * TODO specify index of gms too
       */
      /** Current hole id Andros */
      currentHoleId:0,
      doorsApi: /** @type {{ [gmsIndex: number]: NPC.DoorsApi }} */  ({}),
      /** Hack to avoid repeated assertions */
      // get gm() { return assertDefined(gm); },
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /** @param {number} gmIndex */
      getAdjacentHoleIds(gmIndex) {
        const { roomGraph } = gms[gmIndex];
        const openDoorIds = state.doorsApi[gmIndex].getOpen();
        return roomGraph.getEnterableRooms(roomGraph.nodesArray[state.currentHoleId], openDoorIds)
          .map(roomNode => roomNode.holeIndex);
      },
      onChangeDeps() {
        if (gms.length) {// Initial and HMR update
          state.updateClipPath();
          state.updateObservableDoors();
          update();
          const sub = state.wire
            .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
            .subscribe((_) => { state.updateClipPath(); update(); });
          return () => sub.unsubscribe();
        }
      },
      updateClipPath() {
        gms.map((gm, gmIndex) => {
          const { holesWithDoors, hullOutline, pngRect } = gm;
          const shownHoleIds = [state.currentHoleId].concat(state.getAdjacentHoleIds(gmIndex));
          const holePolys = shownHoleIds.map(i => holesWithDoors[i]);
          /**
           * TODO since we undo transform,
           * we could use original polys
           */
          const matrix = new Mat(gm.inverseTransform);
          const maskPoly = Poly.cutOut(holePolys, [hullOutline])
            .map(poly => poly.applyMatrix(matrix))
            .map(poly => poly.translate(-gm.gm.d.pngRect.x, -gm.gm.d.pngRect.y))
          const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
          state.clipPath[gm.layoutKey] = svgPaths.length ? `path('${svgPaths}')` : 'none'; // ?
        });
      },
      updateObservableDoors() {
        gms.map((gm, gmIndex) => {
          const { roomGraph } = gm;
          const currentRoomNode = roomGraph.nodesArray[state.currentHoleId];
          const observableDoors = roomGraph.getAdjacentDoors(currentRoomNode);
          this.doorsApi[gmIndex].setObservableDoors(observableDoors.map(x => x.doorIndex));
        });
      },
    };
  }, [gms], {
    equality: { currentHoleId: true },
  });

  return gms.length ? (
    <CssPanZoom
      stageKey="stage-nav-demo-1"
      dark
      className={rootCss}
      zoom={0.4}
    >
      {gms.map(gm =>
        <img
          className="geomorph"
          src={geomorphPngPath(gm.layoutKey)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            left: gm.gm.d.pngRect.x,
            top: gm.gm.d.pngRect.y,
            transform: `matrix(${gm.transform})`,
          }}
        />
      )}

      <NPCs
        onLoad={api => { state.npcsApi = api; update() }}
        disabled={props.disabled}
        stageKey="stage-nav-demo-1"
      />

      {gms.map((gm, gmIndex) =>
        [
          <img
            key={gm.itemKey}
            className="geomorph-dark"
            src={geomorphPngPath(gm.layoutKey)}
            draggable={false}
            width={gm.pngRect.width}
            height={gm.pngRect.height}
            style={{
              clipPath: state.clipPath[gm.layoutKey],
              WebkitClipPath: state.clipPath[gm.layoutKey],
              left: gm.gm.d.pngRect.x,
              top: gm.gm.d.pngRect.y,
              transform: `matrix(${gm.transform})`,
            }}
          />,

          <Doors
            gm={gm}
            wire={state.wire}
            onLoad={api => state.doorsApi[gmIndex] = api}
          />
        ]
      )}
      
    </CssPanZoom>
  ) : null;
}

/** @param {Geomorph.GeomorphData} gm */
const rootCss = css`
  img {
    position: absolute;
    transform-origin: top left;
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);
  }
`;
