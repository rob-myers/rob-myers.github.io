import { css } from "goober";

/**
 * TODO optionally fade door, or very quickly open
 */

/**
 * Doors for a specific geomorph.
 * @param {{ json: Geomorph.GeomorphJson }} props
 */
export function Doors(props) {
  const { json } = props;

  /** @param {React.MouseEvent} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    const [width, index] = [div.clientWidth, Number(div.getAttribute('data-index'))];
    const nextWidth = width <= 10 ? json.doors[index].rect.width : 10; // Leq for borders
    div.style.width = `${nextWidth}px`;
  };

  return (
    <foreignObject
      {...json.pngRect}
      xmlns="http://www.w3.org/1999/xhtml"
      className={rootCss}
    >
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
  div.door {
    position: absolute;
    cursor: pointer;
    background: white;
    border: 1px solid black;

    transition: width 100ms ease-in;
    &.open {
      width: 0;
    }
  }
`;
