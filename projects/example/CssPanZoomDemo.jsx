import { css } from "goober";
import CssPanZoom from '../panzoom/CssPanZoom';

export default function CssSvgPanZoomDemo() {
  return (
    <div className={rootCss}>
      <CssPanZoom>
        <div>
          Hello, world!
        </div>
      </CssPanZoom>
    </div>
  );
}

const rootCss = css`
  height: 100%;
`;
