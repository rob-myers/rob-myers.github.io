import React, { useRef, useEffect, useState } from "react";
import { css } from "goober";
import { Rect, Vect } from "../geom";
import { figureOfEight } from '../example/geom';
import { getSvgPos } from "../service";
import PanZoom from "../panzoom/PanZoom";

export default function PathfindingDemo() {

  const worker = useRef(/** @type {null | Worker} */ (null));
  const [dots, setDots] = useState(/** @type {Vect[]} */ ([]));
  const [selected, setSelected] = useState(/** @type {number[]} */ ([]));
  const [path, setPath] = useState(/** @type {Vect[]} */ ([]));

  useEffect(() => {
    worker.current = new Worker(new URL('./nav.worker.js', import.meta.url));
    worker.current.postMessage({ type: 'create', navKey, navPolys: [polygon.geoJson] });
    worker.current.addEventListener('message', (e) => {
      if (e.data.type === 'path') {
        console.log(e.data.path);
        setPath(e.data.path.map(Vect.from));
      }
    });
    return () => worker.current?.terminate();
  }, []);

  /** @param {number} index */
  function toggleDot(index) {
    setSelected(selected.includes(index)
      ? selected.filter(x => x !== index)
      : [index].concat(selected).slice(0, 2)
    );
  }

  useEffect(() => {
    if (selected.length === 2) {
      worker.current?.postMessage({ type: 'path', navKey, src: dots[selected[0]], dst: dots[selected[1]] })
    }
  }, [dots, selected]);

  return (
    <section className={rootCss}>
      <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
        <path
          className="walls"
          d={`${thickWalls.svgPath}`}
        />
        <path
          className="polygon"
          d={`${polygon.svgPath}`}
          onClick={(e) => {
            const point = getSvgPos(e);
            if (!dots.some(d => d.distanceTo(point) < 5)) {
              setDots(dots.concat(Vect.from(point)));
              toggleDot(dots.length);
            }
          }}
        />
        <polyline
          className="path"
          points={`${path}`}
        />
        <g className="dots">
          {dots.map((p, i) =>
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              className={selected.includes(i) ? 'selected' : undefined }
              onClick={() => toggleDot(i)}
            />
          )}
        </g>
      </PanZoom>
    </section>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);
const navKey = 'fig-of-8';
const polygon = figureOfEight.clone().translate(80, 80);
const [thickWalls] = polygon.createOutset(3);

const rootCss = css`
  border: 1px solid #555555;

  height: 300px;
  path.walls {
    fill: #aaa;
  }
  path.polygon {
    cursor: crosshair;
    fill: white;
    stroke:none;
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
  polyline.path {
    fill: none;
    stroke: #800;
    stroke-width: 0.5;
    stroke-dasharray: 4 4;
  }
`;