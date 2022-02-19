import { css } from "goober";
import CssPanZoom from '../panzoom/CssPanZoom';

export default function CssSvgPanZoomDemo() {
  return (
    <div className={rootCss}>
      <CssPanZoom dark>
        <div>
          Hello, world!
        </div>
      </CssPanZoom>
    </div>
  );
}

const rootCss = css`
  height: 100%;
  color: white;
`;
