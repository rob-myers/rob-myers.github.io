import React, { useEffect, useState } from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect, Vect } from "../geom";
import { figureOfEight } from '../example/geom';
import { getSvgPos, geom, recast } from "../service";
import PanZoom from "../panzoom/PanZoom";

// import { options } from 'preact';
// if (typeof window !== 'undefined') {
//   const prev = options.diffed;
//   options.diffed = (/** @type {*} */ vnode) => {
//     prev?.(vnode);
//     console.log(vnode); 
//   };
// }

// TODO remove recast-detour:
// (a) compute navmesh in dev-env or codesandbox
// (b) adapt three-pathfinding

// TODO provide random point button

export default function NavDemo() {

  const [dots, setDots] = useState(/** @type {Vect[]} */ ([]));
  const [selected, setSelected] = useState(/** @type {number[]} */ ([]));
  const [path, setPath] = useState(/** @type {Vect[]} */ ([]));

  // TODO draw into image via canvas instead
  const { data: tris } = useQuery('create-nav', async () => {
    await geom.createNavMesh(navKey, [polygon], {  cs: 1, walkableRadius: 2, maxSimplificationError: 50 });
    const { tris, vs } = recast.getDebugTriangulation(navKey);
    return tris.map(tri => tri.map(i => vs[i]));
  }, { staleTime: Infinity });

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
        <path className="floor" d={`${polygon.svgPath}`}
          onClick={(e) => {
            const point = getSvgPos(e);
            if (!dots.some(d => d.distanceTo(point) < 5)) {
              setDots(dots.concat(Vect.from(point)));
              toggleDot(dots.length);
            }
          }}
        />
        {<MemoedTriangles tris={tris} />}
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

/** @type {React.FC<{ tris?: Vect[][] }>}  */
const Triangles = (props) => <g>
  {props.tris?.map((tri, i) =>
    <polygon key={i} className="triangle" points={`${tri}`} />  
  )}
</g>;

const MemoedTriangles = React.memo(Triangles);

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);
const navKey = 'fig-of-8';
const polygon = figureOfEight.clone().translate(100, 100);
const [thickWalls] = polygon.createOutset(6);

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  path.walls {
    fill: #000;
  }
  path.floor {
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
    stroke: #bbb;
    stroke-width: 0.5;
  }
  polyline.navpath {
    fill: none;
    stroke: #800;
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }
`;