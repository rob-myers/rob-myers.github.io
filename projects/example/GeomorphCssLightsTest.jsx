import { css } from "goober";
import { Subject } from "rxjs";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import useUpdate from "projects/hooks/use-update";

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: gm } = useGeomorphData(layoutKey);
  const update = useUpdate();

  const state = useMuState(() => {
    return {
      clipPath: 'none',
      isHoleMasked: /** @type {{ [holeIndex: string]: true }} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /**
       * TODO
       * - show all adjacent masks whose door is open
       * - adjust masks when adjacent doors are opened/closed
       */

      /** @param {React.MouseEvent<HTMLDivElement>} param0  */
      handleDotClick({ target }) {
        if (gm) {
          const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
          dataIndex in state.isHoleMasked ? delete state.isHoleMasked[dataIndex] : state.isHoleMasked[dataIndex] = true;

          // TODO compute all adjacents
          const { roomGraph: graph } = gm.d;
          const rootIds = Object.keys(state.isHoleMasked).map(Number);
          const adjIds = rootIds.flatMap(holeId => {// node-ordering aligned to holeIndex
            return graph.getSuccs(graph.nodesArray[holeId]).map(x => x.opts.holeIndex);
          });
          const allIds = Array.from(new Set(rootIds.concat(adjIds)));

          const svgPaths = allIds
            .map((i) => `${gm.allHoles[i].clone().translate(-gm.d.pngRect.x, -gm.d.pngRect.y).svgPath}`)
            .join(' ');
          state.clipPath = `path('${svgPaths}')`;
          update();
        }
      },
      
    };
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

        {Object.keys(state.isHoleMasked).length ? <img
          className="geomorph-light"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
            clipPath: state.clipPath,
          }}
        /> : null}

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

        {/* TODO svg test room graph */}
        <svg
          style={{
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          {gm.d.holeCenters.map((center, i) =>
            <g key={i}>
              <circle
                fill="rgba(0, 0, 100, 0.2)"
                r={10}
                cx={center.x}
                cy={center.y}
              />
              {/* <path
                // fill="rgba(0, 0, 200, 0.4)"
                fill="none"
                // stroke="blue"
                stroke="red"
                d={poly.svgPath}
              /> */}
            </g>
          )}
          {gm.d.roomGraph.edgesArray.map(({ src, dst }) =>
            <line
              stroke="grey"
              x1={gm.d.holeCenters[Number(src.id)].x}
              y1={gm.d.holeCenters[Number(src.id)].y}
              x2={gm.d.holeCenters[Number(dst.id)].x}
              y2={gm.d.holeCenters[Number(dst.id)].y}
            />
          )}
        </svg>

        <Doors gm={gm} wire={state.wire} />
      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';
// const layoutKey = 'g-101--multipurpose';
// const layoutKey = 'g-302--xboat-repair-bay';

const rootCss = css`
  img.geomorph {
    filter: invert(100%) brightness(60%) contrast(200%) sepia(30%);
    position: absolute;
  }
  img.geomorph-light {
    filter:  brightness(75%);
    position: absolute;
  }
  div.area-dots {
    position: absolute;
  }
  /* canvas {
    position: absolute;
  } */
`;
