import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

export default function DoorsDemo() {

  const { data } = useQuery('gm-101-json', async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch('/geomorph/g-101--multipurpose.json').then(x => x.json()));
  });

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}

    >
      {data && <g className={rootCss}>
        <image
          {...data.pngRect}
          className="geomorph"
          href="/geomorph/g-101--multipurpose.png"
        />
        <ForeignObject json={data} />
      </g>}
    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);

/** @param {{ json: Geomorph.GeomorphJson }} _ */
function ForeignObject({ json }) {
  return (
    <foreignObject {...json.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div>
        {json.doors.map(({ rect, angle }) =>
          <div
            className="door"
            style={{
              left: rect.x - json.pngRect.x,
              top: rect.y - json.pngRect.y,
              width: rect.width,
              height: rect.height,
              transformOrigin: 'top left',
              transform: `rotate(${angle}deg)`,
            }}
          />
        )}
      </div>
    </foreignObject>
  );
}

const rootCss = css`
  foreignObject {
    div.door {
      position: absolute;
      cursor: pointer;
      background: white;
      border: 1px solid black;
    }
  }
`;