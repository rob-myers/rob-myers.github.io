import classNames from "classnames";
import { css } from "goober";
import { geomorphPngPath } from "../geomorph/geomorph.model";

/**
 * The images of each geomorph
 * @param {Props} props 
 */
export default function Geomorphs(props) {
  return (
    <div className={classNames("geomorphs", rootCss)}>
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
