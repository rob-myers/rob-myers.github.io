import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function DoorsDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
    >
      {data && <>
        <image
          {...data.pngRect}
          className="geomorph"
          href={`/geomorph/${props.layoutKey}.png`}
        />
        <ForeignObject json={data} />
      </>}
    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);

/** @param {{ json: Geomorph.GeomorphJson }} _ */
function ForeignObject({ json }) {

  /** @param {React.MouseEvent} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    const [width, index] = [div.clientWidth, Number(div.getAttribute('data-index'))];
    const nextWidth = width <= 5 ? json.doors[index].rect.width : 5; // Leq for borders
    div.style.width = `${nextWidth}px`;
  };

  return (
    <foreignObject {...json.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onClick={onClick}>
        {json.doors.map(({ rect, angle }, i) =>
          <div
            className="door"
            data-index={i}
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

      transition: width 500ms ease;
      &.open {
        width: 0;
      }
    }
  }
`;
