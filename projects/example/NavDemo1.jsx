import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { assertDefined } from "../service/generic";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly } from "../geom";
import useUpdate from "../hooks/use-update";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

// TODO
// - Andros is situated and lighting reacts

/** @param {{ disabled?: boolean; layoutKey: Geomorph.LayoutKey }} props */
export default function NavDemo1(props) {

  const update = useUpdate();

  const { data: gm } = useGeomorphData(props.layoutKey, { staleTime: Infinity });

  const state = useMuState(() => {
    return {
      clipPath: 'none',
      /** Current hole of Andros */
      currentHoleId: 0,
      doorsApi: /** @type {NPC.DoorsApi} */ ({}),
      /** Hack to avoid repeated assertions */
      get gm() { return assertDefined(gm); },
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      getAdjacentHoleIds() {
        const { roomGraph } = state.gm.d;
        const openDoorIds = state.doorsApi.getOpen();
        return roomGraph.getEnterableRooms(roomGraph.nodesArray[state.currentHoleId], openDoorIds)
          .map(roomNode => roomNode.holeIndex);
      },
      onChangeDeps() {
        if (gm) {// Initial and HMR update
          state.updateClipPath();
          state.updateObservableDoors();
          update();
          state.npcsApi.spawn([
            { key: 'andros', position: { x: 50, y: 38 } },
          ]);
          const sub = state.wire
            .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
            .subscribe((_) => { state.updateClipPath(); update(); });
          return () => sub.unsubscribe();
        }
      },
      updateClipPath() {
        const { holesWithDoors, hullOutline, pngRect } = state.gm.d;
        const shownHoleIds = [state.currentHoleId].concat(state.getAdjacentHoleIds());
        const holePolys = shownHoleIds.map(i => holesWithDoors[i]);
        const maskPoly = Poly.cutOut(holePolys, [hullOutline],)
          .map(poly => poly.translate(-pngRect.x, -pngRect.y)); // ?
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath = `path('${svgPaths}')`;
      },
      updateObservableDoors() {
        const { roomGraph } = state.gm.d;
        const currentRoomNode = roomGraph.nodesArray[state.currentHoleId];
        const observableDoors = roomGraph.getAdjacentDoors([currentRoomNode]);
        this.doorsApi.setObservableDoors(observableDoors.map(x => x.doorIndex));
      },
    };
  }, [gm], {
    equality: { currentHoleId: true },
  });

  return gm ? (
    <CssPanZoom
      stageKey="stage-nav-demo-1"
      dark
      className={rootCss(gm)}
    >

      <img
        className="geomorph"
        src={geomorphPngPath(props.layoutKey)}
        draggable={false}
        width={gm.d.pngRect.width}
        height={gm.d.pngRect.height}
      />

      <NPCs
        gm={gm}
        onLoad={api => state.npcsApi = api}
        disabled={props.disabled}
      />

      <img
        className="geomorph-dark"
        src={geomorphPngPath(props.layoutKey)}
        draggable={false}
        width={gm.d.pngRect.width}
        height={gm.d.pngRect.height}
        style={{
          clipPath: state.clipPath,
        }}
      />

      <Doors
        gm={gm}
        wire={state.wire}
        onLoad={api => state.doorsApi = api}
      />
      
    </CssPanZoom>
  ) : null;
}

/** @param {Geomorph.GeomorphData} gm */
const rootCss = (gm) => css`
  img {
    position: absolute;
    left: ${gm.d.pngRect.x}px;
    top: ${gm.d.pngRect.y}px;
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);
  }
`;
