import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Poly } from "../geom/poly";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";

/**
 * TODO new approach:
 * - ✅ create hole image between geomorph and geomorph-dark
 * - 🅧 LightHole didn't work (outlying rooms go blank when lit)
 * - new door type: support tag `iris`
 *   - ✅ change door design for existing
 *   - ✅ add missing walls + doors to hull 301 and 101
 * - support multiple edges between same two rooms
 * - support invisible doors which are always open, to split up large areas
 * - far doors shown dark
 */

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: gm } = useGeomorphData(layoutKey);
  const update = useUpdate();

  const state = useMuState(() => {
    return {
      clipPath: 'none',
      isHoleMasked: /** @type {{ [holeIndex: string]: true }} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),
      doorApi: /** @type {NPC.DoorsApi} */ ({}),

      /** @param {React.MouseEvent<HTMLDivElement>} param0  */
      handleDotClick({ target }) {
        if (gm) {
          const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
          dataIndex in state.isHoleMasked ? delete state.isHoleMasked[dataIndex] : state.isHoleMasked[dataIndex] = true;
          state.updateMask();
        }
      },

      updateMask() {
        if (!gm) return;
        const { roomGraph: graph } = gm.d;

        const rootHoleIds = Object.keys(state.isHoleMasked).map(Number);
        const openDoorLookup = state.doorApi.getOpen();
        const adjHoleIds = rootHoleIds.flatMap(holeId => {// node-ordering aligned to holeIndex
          return graph.getEdgesFrom(graph.nodesArray[holeId])
            .filter(edge => edge.origOpts.doorIndex in openDoorLookup)
            .map(edge => edge.dst.opts.holeIndex);
        });
        const shownHoleIds = Array.from(new Set(rootHoleIds.concat(adjHoleIds)));

        const holePolys = shownHoleIds.map(i => gm.d.holesWithDoors[i].clone());
        const maskPoly = Poly.cutOut(holePolys, [gm.d.hullOutline]).map(poly => poly.translate(-gm.d.pngRect.x, -gm.d.pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath = `path('${svgPaths}')`;
        update();
      },
    };
  }, [gm]);

  React.useEffect(() => {
    // state.updateMask();
    const sub = state.wire
      .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
      .subscribe((_) => state.updateMask());
    return () => sub.unsubscribe();
  }, []);

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
          className="area-dots"
          onClick={state.handleDotClick}
        >
          {gm.d.holeCenters.map((center, holeIndex) => {
            return <div
              key={holeIndex}
              data-index={holeIndex}
              style={{
                borderRadius: 5,
                border: '5px solid white',
                position: 'absolute',
                cursor: 'pointer',
                left: center.x - 5,
                top: center.y - 5,
              }}
            />
          })}
        </div>

        <Doors gm={gm} wire={state.wire} onLoad={api => state.doorApi = api} />
        
        <svg
          className="room-graph"
          width={gm.d.pngRect.width}
          height={gm.d.pngRect.height}
        >
          {gm.d.holeCenters.map((center, i) =>
            <circle
              key={i}
              fill="rgba(0, 0, 100, 0.2)"
              r={10}
              cx={center.x}
              cy={center.y}
            />
          )}
          {/* {gm.holes.map((poly) =>
            <path
              // fill="rgba(0, 0, 200, 0.4)"
              fill="none"
              // stroke="blue"
              stroke="red"
              d={poly.svgPath}
            />
          )} */}
          {/* {gm.d.roomGraph.edgesArray.map(({ src, dst }) =>
            <line
              stroke="grey"
              x1={gm.d.holeCenters[Number(src.id)].x}
              y1={gm.d.holeCenters[Number(src.id)].y}
              x2={gm.d.holeCenters[Number(dst.id)].x}
              y2={gm.d.holeCenters[Number(dst.id)].y}
            />
          )} */}
        </svg>

      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
// const layoutKey = 'g-301--bridge';
const layoutKey = 'g-101--multipurpose';
// const layoutKey = 'g-302--xboat-repair-bay';

const rootCss = css`
  img.geomorph-dark {
    filter: invert(100%) brightness(60%) contrast(200%) sepia(30%);
    position: absolute;
  }
  img.geomorph {
    filter:  brightness(75%);
    position: absolute;
  }
  /* img.geomorph-light {
    filter:  brightness(75%);
    position: absolute;
  } */
  div.area-dots {
    position: absolute;
  }
  svg.room-graph {
    position: absolute;
    pointer-events: none;
    circle, line {
      pointer-events: none;
    }
  }
`;
