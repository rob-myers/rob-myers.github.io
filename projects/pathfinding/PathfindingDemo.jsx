import React from "react";
import { css } from "goober";
import { Rect, Vect } from "../geom";
import { octagon, hollowOctagon, figureOfEight } from '../example/geom';
import { getSvgPos } from "../service";
import PanZoom from "../panzoom/PanZoom";

const polygon = figureOfEight.clone().translate(80, 80);

export default function PathfindingDemo() {

  const [dots, setDots] = React.useState(() => /** @type {Vect[]} */ ([]));
  const [selected, setSelected] = React.useState(() => /** @type {number[]} */ ([]));

  React.useEffect(() => {
    const worker = new Worker(new URL('./nav.worker.js', import.meta.url));
    worker.postMessage({ type: 'ping' });
    worker.postMessage({ type: 'create', navKey: 'fig-of-8', navPolys: [figureOfEight.geoJson] });
    return () => worker.terminate();
  }, []);

  return (
    <section className={rootCss}>
      <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
        <path
          className="polygon"
          d={`${polygon.svgPath}`}
          onClick={(e) => {
            const point = getSvgPos(e);
            if (!dots.some(d => d.distanceTo(point) < 5)) {
              setDots(dots.concat(Vect.from(point)));
            }
          }}
        />
        <g className="dots">
          {dots.map((p, i) =>
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              className={selected.includes(i) ? 'selected' : undefined }
              onClick={() => setSelected(selected.includes(i)
                ? selected.filter(x => x !== i)
                : [i].concat(selected).slice(0, 2)
              )}
            />
          )}
        </g>
      </PanZoom>
    </section>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);

const rootCss = css`
  height: 300px;
  path.polygon {
    cursor: crosshair;
    stroke: black;
    fill: white;
  }
  g.dots circle {
    r: 2.5;
    fill: #ddd;
    stroke: black;
    stroke-width: 0.5;

    &.selected {
      fill: red;
    }
  }
`;