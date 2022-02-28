import React from "react";
import { css } from "goober";
import { gridBounds, initViewBox } from "../example/defaults";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import PanZoom from "../panzoom/PanZoom";
import useGeomorphData from "../hooks/use-geomorph-data";


/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function DoorsDemo(props) {

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
          {...data.d.pngRect}
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
    const nextWidth = width <= 10 ? gm.d.doors[index].rect.width : 10; // Leq for borders
    div.style.width = `${nextWidth}px`;
  };

  return (
    <foreignObject {...gm.d.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onPointerUp={onClick}>
        {gm.d.doors.map(({ rect, angle }, i) =>
          <div
            className="door"
            data-index={i}
            style={{
              left: rect.x - gm.d.pngRect.x,
              top: rect.y - gm.d.pngRect.y,
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
