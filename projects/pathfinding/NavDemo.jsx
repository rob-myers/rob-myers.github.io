import React, { useEffect, useState } from "react";
import { css } from "goober";
import { Rect, Vect } from "../geom";
import { figureOfEight } from '../example/geom';
import { getSvgPos, geom, recast } from "../service";
import PanZoom from "../panzoom/PanZoom";

// TODO provide random point button

export default function NavDemo() {

  const [dots, setDots] = useState(/** @type {Vect[]} */ ([]));
  const [selected, setSelected] = useState(/** @type {number[]} */ ([]));
  const [path, setPath] = useState(/** @type {Vect[]} */ ([]));
  const [tris, setTris] = useState(/** @type {Vect[][]} */ ([]));

  useEffect(() => {
    geom.createNavMesh(navKey, [polygon], {}).then(() => {
      const tr = recast.getDebugTriangulation(navKey);
      setTris(tr.tris.map(tri => tri.map(i => tr.vs[i])));
    });
  }, []);

  useEffect(() => {
    if (selected.length === 2) {
      setPath(geom.requestNavPath(navKey, dots[selected[0]], dots[selected[1]]));
    }
  }, [dots, selected]);

  /** @param {number} index */
  function toggleDot(index) {
    setSelected(selected.includes(index)
      ? selected.filter(x => x !== index)
      : [index].concat(selected).slice(0, 2)
    );
  }

  return (
    <section className={rootCss}>
      <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
        <path className="walls" d={`${thickWalls.svgPath}`} />
        <path className="polygon" d={`${polygon.svgPath}`}
          onClick={(e) => {
            const point = getSvgPos(e);
            if (!dots.some(d => d.distanceTo(point) < 5)) {
              setDots(dots.concat(Vect.from(point)));
              toggleDot(dots.length);
            }
          }}
        />
        {tris.map((tri, i) =>
          <polygon key={i} className="triangle" points={`${tri}`} />  
        )}
        <polyline className="navpath" points={`${path}`} />
        <g className="dots">
          {dots.map((p, i) =>
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.5}
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
const polygon = figureOfEight.clone().translate(100, 100);
const [thickWalls] = polygon.createOutset(12);

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
    cursor: crosshair;
    fill: #ddd;
    stroke: black;
    stroke-width: 0.5;

    &.selected {
      fill: red;
    }
  }
  polygon.triangle {
    fill: none;
    stroke: #999;
    stroke-width: 0.5;
  }
  polyline.navpath {
    fill: none;
    stroke: #800;
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }
`;