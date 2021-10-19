import { Rect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

export default function DoorsDemo() {

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6}>

    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);
