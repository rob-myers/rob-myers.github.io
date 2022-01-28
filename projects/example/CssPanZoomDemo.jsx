import { css } from "goober";
import CssPanZoom from '../panzoom/CssPanZoom';

export default function PanZoomDemo() {
  return (
    <div className={rootCss}>
      <CssPanZoom>
        <rect fill="red" x="10" y="10" width="100" height="50" />
      </CssPanZoom>
    </div>
  );
}

const rootCss = css`
  height: 100%;
`;