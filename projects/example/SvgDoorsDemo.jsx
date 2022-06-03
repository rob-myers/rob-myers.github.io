import React from "react";
import { css } from "goober";
import { gridBounds, initViewBox } from "./defaults";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import PanZoom from "../panzoom/PanZoom";
import useGeomorphData from "../hooks/use-geomorph-data";


/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function SvgDoorsDemo(props) {

  const { data } = useGeomorphData(props.layoutKey);

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
        {!props.disabled && <ForeignObject gm={data} />}
      </>}
    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphData }} _ */
function ForeignObject({ gm }) {

  /** @param {React.MouseEvent} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    const [width, index] = [div.clientWidth, Number(div.getAttribute('data-index'))];
    const nextWidth = width <= 10 ? gm.doors[index].baseRect.width : 10; // Leq for borders
    div.style.width = `${nextWidth}px`;
  };

  return (
    <foreignObject {...gm.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onPointerUp={onClick}>
        {gm.doors.map(({ baseRect, angle }, i) =>
          <div
            className="door"
            data-index={i}
            style={{
              left: baseRect.x - gm.pngRect.x,
              top: baseRect.y - gm.pngRect.y,
              width: baseRect.width,
              height: baseRect.height,
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
