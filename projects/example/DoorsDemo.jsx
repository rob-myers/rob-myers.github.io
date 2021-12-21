import React from "react";
import { css } from "goober";
import { gridBounds, initViewBox } from "../example/defaults";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import PanZoom from "../panzoom/PanZoom";
import { useGeomorphJson } from "../hooks";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function DoorsDemo(props) {

  const { data } = useGeomorphJson(props.layoutKey);

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={8}
      className={rootCss}
    >
      {data && <>
        <image
          {...data.pngRect}
          className="geomorph"
          href={geomorphPngPath(props.layoutKey)}
        />
        <ForeignObject json={data} />
      </>}
    </PanZoom>
  );
}

/** @param {{ json: Geomorph.GeomorphJson }} _ */
function ForeignObject({ json }) {

  /** @param {React.MouseEvent} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    const [width, index] = [div.clientWidth, Number(div.getAttribute('data-index'))];
    const nextWidth = width <= 10 ? json.doors[index].rect.width : 10; // Leq for borders
    div.style.width = `${nextWidth}px`;
  };

  return (
    <foreignObject {...json.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onPointerUp={onClick}>
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
              transform: `rotate(${angle}rad)`,
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
