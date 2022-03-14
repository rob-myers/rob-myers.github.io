import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Poly } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";

/** @param {{ disabled?: boolean }} props */
export default function LightsTest(props) {

  const { data: gm } = useGeomorphData(layoutKey);
  const update = useUpdate();

  const state = useMuState(() => {
    return {
      clipPath: 'none',
      doorsApi: /** @type {NPC.DoorsApi} */ ({}),
      isHoleShown: /** @type {{ [holeIndex: string]: true }} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /** @param {React.MouseEvent<HTMLDivElement>} param0  */
      onToggleLight({ target }) {
        if (gm) {
          const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
          dataIndex in state.isHoleShown ? delete state.isHoleShown[dataIndex] : state.isHoleShown[dataIndex] = true;
          state.updateMask();
        }
      },

      updateMask() {
        if (!gm) return;
        const { roomGraph: graph } = gm.d;

        const rootHoleIds = Object.keys(state.isHoleShown).map(Number);
        const openDoorIds = state.doorsApi.getOpen();
        const adjHoleIds = rootHoleIds.flatMap(holeId => {
          // Assume node-ordering aligned to holeIndex
          return graph.getEnterableRooms(graph.nodesArray[holeId], openDoorIds)
            .map(roomNode => roomNode.holeIndex);
        });
        const allHoleIds = Array.from(new Set(rootHoleIds.concat(adjHoleIds)));
        const allHolePolys = allHoleIds.map(i => gm.d.holesWithDoors[i]);

        const observableDoors = graph.getAdjacentDoors(rootHoleIds.map(id => graph.nodesArray[id]));
        this.doorsApi.setObservableDoors(observableDoors.map(x => x.doorIndex));

        const maskPoly = Poly.cutOut(allHolePolys, [gm.d.hullOutline],)
          .map(poly => poly.translate(-gm.d.pngRect.x, -gm.d.pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath = `path('${svgPaths}')`;

        update();
      },
    };
  }, [gm]);

  React.useEffect(() => {
    if (gm) {
      state.updateMask(); // Initial update
      const sub = state.wire
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe((_) => state.updateMask());
      return () => sub.unsubscribe();
    }
  }, [gm]);

  return (
    <CssPanZoom dark className={rootCss}>
      {gm && <>

        <img
          className="geomorph"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
          }}
        />

        <img
          className="geomorph-dark"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
            clipPath: state.clipPath,
          }}
        />

        <div
          className="light-toggles"
          onClick={state.onToggleLight}
        >
          {gm.d.holeSwitches.map((center, holeIndex) => {
            return <div
              key={holeIndex}
              data-index={holeIndex}
              className="toggle"
              style={{
                left: center.x - 5,
                top: center.y - 5,
                borderColor: state.isHoleShown[holeIndex] ? '#5f5' : 'rgba(200, 0, 0, 0.3)',
                outline: state.isHoleShown[holeIndex] ? '1px solid black' : '1px solid rgba(255, 255, 255, 0.5)',
              }}
            />
          })}
        </div>

        <Doors
          gm={gm}
          wire={state.wire}
          onLoad={api => state.doorsApi = api}
        />

        {/* <DebugGraph gm={gm} /> */}

      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
// const layoutKey = 'g-301--bridge';
// const layoutKey = 'g-101--multipurpose';
const layoutKey = 'g-102--research-deck';
// const layoutKey = 'g-302--xboat-repair-bay';
// const layoutKey = 'g-303--passenger-deck';

const rootCss = css`
  img.geomorph-dark {
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);
    position: absolute;
  }
  img.geomorph {
    filter: brightness(80%);
    position: absolute;
  }
  /* img.geomorph-light {
    filter:  brightness(75%);
    position: absolute;
  } */
  div.light-toggles {
    position: absolute;

    div.toggle {
      border-radius: 5px;
      border: 5px solid white;
      position: absolute;
      cursor: pointer;
    }
  }
  svg.room-graph {
    position: absolute;
    pointer-events: none;
    circle, line {
      pointer-events: none;
    }
  }
`;

/** @param {{ gm: Geomorph.GeomorphData }} props */
function DebugGraph({ gm }) {
  return (
    <svg
      className="room-graph"
      width={gm.d.pngRect.width}
      height={gm.d.pngRect.height}
    >
      {gm.d.roomGraph.nodesArray.map((node, i) =>
        <circle
          key={i}
          stroke="rgba(200, 0, 0, 1)"
          fill="none"
          r={5}
          {...node.type === 'room'
            ? { cx: gm.d.holeSwitches[i].x, cy: gm.d.holeSwitches[i].y,  }
            : { cx: gm.doors[node.doorIndex].poly.center.x, cy: gm.doors[node.doorIndex].poly.center.y }
          }
        />
        )}
        {gm.holes.map((poly) =>
          <path
            fill="none"
            stroke="yellow"
            d={poly.svgPath}
          />
        )}
        {gm.d.roomGraph.edgesArray
          .filter((x) => x.src.type === 'room' && x.dst.type === 'door')
          .map((edge) =>
            <line
              stroke="red"
              x1={gm.d.holeSwitches[
                /** @type {Graph.RoomOfTypeRoom} */ (edge.src).holeIndex].x}
              y1={gm.d.holeSwitches[
                /** @type {Graph.RoomOfTypeRoom} */ (edge.src).holeIndex].y}
              x2={gm.doors[
                /** @type {Graph.RoomOfTypeDoor} */ (edge.dst).doorIndex].poly.center.x}
              y2={gm.doors[
                /** @type {Graph.RoomOfTypeDoor} */  (edge.dst).doorIndex].poly.center.y}
            />
        )}
    </svg>
  );
}