import * as React from "react";
import { Rect } from "../geom";
import { octagon, hollowOctagon, figureOfEight } from '../example/geom';
import PanZoom from "../panzoom/PanZoom";

export default function PathfindingDemo() {

  React.useEffect(() => {
    // From https://webpack.js.org/guides/web-workers/#syntax
    console.info('creating nav worker');
    const worker = new Worker(new URL('./nav.worker.js', import.meta.url));
    worker.addEventListener('message', (evt) => {
      console.info('main thread received', evt.data);
    });
    worker.postMessage({ type: 'ping' });
    worker.postMessage({ type: 'create', navKey: 'fig-of-8', navPolys: [figureOfEight.geoJson] });

    return () => {
      console.info('terminating nav worker');
      worker.terminate();
    };
  }, []);

  return (
    <section style={{ height: 300 }}>
      <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
        <g transform="translate(150, 90)">
          {/* <polygon points={String(octogon.outline)} /> */}
          {/* <path d={`M${hollowOctagon.outline}Z M${hollowOctagon.holes[0]}Z`} /> */}
          <path d={`${figureOfEight.svgPath}`} />
        </g>
      </PanZoom>
    </section>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);
