import { css } from "goober";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import CssPanZoom from "../panzoom/CssPanZoom";

/** @param {{ disabled?: boolean; layoutKey: Geomorph.LayoutKey }} props */
export default function NavDemo1(props) {

  const { data: gm } = useGeomorphData(props.layoutKey);

  return (
    <CssPanZoom dark className={rootCss}>
      {gm && <>

        <img
          className="geomorph"
          src={geomorphPngPath(props.layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
          }}
        />
      
      </>}
    </CssPanZoom>
  );
}

const rootCss = css`
  img.geomorph {
    
  }
`;
