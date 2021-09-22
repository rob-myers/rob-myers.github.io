import React, { useEffect, useState, useMemo, useRef } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Rect, Vect } from "../geom";
import { getSvgPos, geom } from "../service";
import { Pathfinding } from '../nav/Pathfinding';
import PanZoom from "../panzoom/PanZoom";

export default function NavDemo() {

  const [dots, setDots] = useState(/** @type {Vect[]} */ ([]));
  const [path, setPath] = useState(/** @type {Vect[]} */ ([]));
  const pathfinding = useMemo(() => new Pathfinding, []);
  const zoneKey = 'myZone';
  const lastDownAt = useRef(0);

  const { data } = useQuery('navpoly-demo', async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch('/geomorph/g-301--bridge.json').then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));
    const decomp = geom.polysToTriangulation(navPoly);
    const zone = Pathfinding.createZone(decomp);
    pathfinding.setZoneData(zoneKey, zone);
    return { pngRect: json.pngRect, navPoly };
  });

  useEffect(() => {
    if (dots.length === 2) {
      const groupId = pathfinding.getGroup(zoneKey, dots[0]);
      if (groupId !== null) {
        setPath([dots[0]].concat(pathfinding.findPath(dots[0], dots[1], zoneKey, groupId) || []));
      }
    }
  }, [dots]);

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
      <g className={rootCss}>

        {data && <>
          <image {...data.pngRect} className="geomorph" href="/geomorph/g-301--bridge.debug.png" />
          {data.navPoly.map(x => (
            <path
              className="navpoly"
              d={x.svgPath}
              onPointerDown={_ => lastDownAt.current = Date.now()}
              onPointerUp={e => {
                if (Date.now() - lastDownAt.current < 200) {
                  const point = Vect.from(getSvgPos(e));
                  setDots(dots.concat(point).slice(-2));
                }
              }}
            />
          ))}
        </>}

        <polyline className="navpath" points={`${path}`}/>

        <g className="dots">
          {dots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5}/>)}
        </g>
      </g>

    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 1200, 600);

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  > path.navpoly {
    stroke: red;
    fill: rgba(0, 0, 0, 0.1);
    stroke-width: 2;
  }

  > g.dots circle {
    fill: blue;
    stroke: black;
    stroke-width: 0.5;
  }

  > polyline.navpath {
    fill: none;
    stroke: #00f;
    stroke-width: 5;
    stroke-dasharray: 10 5;
  }
`;