import { geomorphPngPath } from "../geomorph/geomorph.model";

/**
 * The floor images of each geomorph
 * @param {Props} props 
 */
export default function Floor(props) {
  return <>
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
  </>;
}

/**
 * @typedef Props @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 */
