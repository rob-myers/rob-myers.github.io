import { css } from "goober";
import CssSvgPanZoom from '../panzoom/CssSvgPanZoom';

export default function CssSvgPanZoomDemo() {
  return (
    <div className={rootCss}>
      <CssSvgPanZoom>
        <rect fill="red" x="10" y="10" width="100" height="50" />
      </CssSvgPanZoom>
    </div>
  );
}

const rootCss = css`
  height: 100%;
`;
