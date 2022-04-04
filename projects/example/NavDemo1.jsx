import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly } from "../geom";
import { allLayoutKeys } from "../service/geomorph";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

// TODO
// - ✅ rewrite `click` as a function
// - ✅ integrate `useGeomorphs` hook
//   - ✅ cleanup Doors
//   - ...
// - 🚧 spawn from TTY
//   - symbols have points tagged 'spawn'
//   - implement spawn as shell function
//   - default spawn to 1st (in hull or first symbol with a spawn point)
//   - can specify point to spawn from
// - Andros is situated and lighting reacts

/** @param {{ disabled?: boolean }} props */
export default function NavDemo1(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
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
      doorsApi: /** @type {Record<Geomorph.LayoutKey, NPC.DoorsApi>} */  ({}),
      /** Hack to avoid repeated assertions */
      // get gm() { return assertDefined(gm); },
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /** @param {Geomorph.UseGeomorphsItem} gm */
      getAdjacentHoleIds(gm) {
        const { roomGraph } = gm;
        const openDoorIds = state.doorsApi[gm.layoutKey].getOpen();
        return roomGraph.getEnterableRooms(roomGraph.nodesArray[state.currentHoleId], openDoorIds)
          .map(roomNode => roomNode.holeIndex);
      },
      onChangeDeps() {
        // Initial and HMR update
        if (gms.length) {
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
        gms.map(gm => {
          const { holesWithDoors, hullOutline, pngRect } = gm;
          const shownHoleIds = [state.currentHoleId].concat(state.getAdjacentHoleIds(gm));
          const holePolys = shownHoleIds.map(i => holesWithDoors[i]);
          const maskPoly = Poly.cutOut(holePolys, [hullOutline],)
            .map(poly => poly.translate(-pngRect.x, -pngRect.y)); // ?
          const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
          state.clipPath[gm.layoutKey] = svgPaths.length ? `path('${svgPaths}')` : 'none'; // ?
        });
      },
      updateObservableDoors() {
        gms.map(gm => {
          const { roomGraph } = gm;
          const currentRoomNode = roomGraph.nodesArray[state.currentHoleId];
          const observableDoors = roomGraph.getAdjacentDoors(currentRoomNode);
          this.doorsApi[gm.layoutKey].setObservableDoors(observableDoors.map(x => x.doorIndex));
        });
      },
    };
  }, [gms], {
    equality: { currentHoleId: true },
  });

  // React.useEffect(() => {
  //   if (gms.length) {
  //     console.log(gmGraph)
  //   }
  // }, [gmGraph]);

  // React.useEffect(() => {
  //   state.npcsApi.spawn([
  //     { key: 'andros', position: { x: 50, y: 38 } },
  //   ]);
  // }, [state.npcsApi]);

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
            left: gm.pngRect.x,
            top: gm.pngRect.y,
          }}
        />
      )}

      <NPCs
        onLoad={api => { state.npcsApi = api; update() }}
        disabled={props.disabled}
        stageKey="stage-nav-demo-1"
      />

      {gms.map(gm =>
        [
          <img
            className="geomorph-dark"
            src={geomorphPngPath(gm.layoutKey)}
            draggable={false}
            width={gm.pngRect.width}
            height={gm.pngRect.height}
            style={{
              clipPath: state.clipPath[gm.layoutKey],
              WebkitClipPath: state.clipPath[gm.layoutKey],
              left: gm.pngRect.x,
              top: gm.pngRect.y,
              // transform: `matrix(${gm.transform})`,
            }}
          />,

          <Doors
            gm={gm}
            wire={state.wire}
            onLoad={api => state.doorsApi[gm.layoutKey] = api}
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
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);
  }
`;
