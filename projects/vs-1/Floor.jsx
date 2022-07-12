import classNames from "classnames";
import { css } from "goober";
import { geomorphPngPath } from "../geomorph/geomorph.model";

/**
 * The floor images of each geomorph
 * Styled earlier e.g. position absolute.
 * @param {Props} props 
 */
export default function Floor(props) {
  return (
    <div className={classNames("floor", rootCss)}>
      {props.gms.map((gm, gmId) => (
        <img
          key={gmId}
          className="geomorph"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            transform: gm.transformStyle,
            transformOrigin: gm.transformOrigin,
          }}
        />
      ))}
    </div>
  );
}

/**
 * @typedef Props @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 */

const rootCss = css`
  img.geomorph {
    position: absolute;
    transform-origin: top left;
    pointer-events: none;
    filter: brightness(80%);
  }
`;
