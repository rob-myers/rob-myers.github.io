import { css } from "goober";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphJson from "../hooks/use-geomorph-json";
import CssPanZoom from "../panzoom/CssPanZoom";

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: json } = useGeomorphJson(layoutKey);

  return (
    <CssPanZoom dark className={rootCss}>
      {json && <>
        <img
          {...json.pngRect}
          src={geomorphPngPath(layoutKey)}
          draggable={false}
        />
      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';

const rootCss = css`
  /* img {
    filter: brightness(10%);
  } */
`;
