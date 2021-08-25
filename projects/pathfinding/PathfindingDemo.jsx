import { Poly, Rect, Vect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

export default function PathfindingDemo() {

  return (
    <section style={{ height: 300 }}>
      <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
        <g transform="translate(150, 90)">
          {/* <polygon points={String(octogon.outline)} /> */}
          <path d={`M${hollowOctagon.outline}Z M${hollowOctagon.holes[0]}Z`} />
        </g>
      </PanZoom>
    </section>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);

const range = [...Array(8)].map((_ ,i) => i);
const octagon = new Poly(range.map((_ ,i) => new Vect(
  Math.cos(2 * Math.PI * (1/16 + i/8)),
  Math.sin(2 * Math.PI * (1/16 + i/8)),
))).scale(50);
const [hollowOctagon] = Poly.cutOut(
  [octagon.clone().scale(0.8)],
  [octagon],
);
