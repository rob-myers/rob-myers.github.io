import React, { useEffect, useState, useMemo, useRef } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Rect, Vect } from "../geom";
import { getSvgPos, geom, projectSvgEvt } from "../service";
import { Pathfinding } from '../pathfinding/Pathfinding';
import PanZoom from "../panzoom/PanZoom";

/**
 * TODO find an interface permitting possibly many
 * navpaths, and enable/disable navnodes
 */

export default function NavDemo() {

  const [dots, setDots] = useState(/** @type {Geom.VectJson[]} */ ([]));
  const [path, setPath] = useState(/** @type {Geom.VectJson[]} */ ([]));
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
    return { pngRect: json.pngRect, navPoly, zone };
  });

  useEffect(() => {
    if (dots.length === 2) {
      const groupId = pathfinding.getGroup(zoneKey, dots[0]);
      if (groupId !== null) {
        setPath([dots[0]].concat(pathfinding.findPath(dots[0], dots[1], zoneKey, groupId) || []));
      }
    } else {
      setPath([]);
    }
  }, [dots]);

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g
        className={rootCss}
        onPointerDown={_ => lastDownAt.current = Date.now()}
        onPointerUp={e => {
          if (Date.now() - lastDownAt.current < 200) {
            const point = getSvgPos(projectSvgEvt(e));
            setDots(dots.slice(0, 1).concat(point));
          }
        }}
      >

        {data && <>
          <image
            {...data.pngRect}
            className="geomorph"
            href="/geomorph/g-301--bridge.debug.png"
          />

          {data.navPoly.map(x => (
            <path
              className="navpoly"
              d={x.svgPath}
              // onPointerDown={_ => lastDownAt.current = Date.now()}
              // onPointerUp={e => {
              //   if (Date.now() - lastDownAt.current < 200) {
              //     const point = Vect.from(getSvgPos(e));
              //     setDots(dots.slice(0, 1).concat(point));
              //   }
              // }}
            />
          ))}

          {data.zone.groups.map(nodes =>
            nodes.map(({ centroid, vertexIds}) =>
              // <circle fill="rgba(0, 0, 0, 0.2)" cx={centroid.x} cy={centroid.y} r={2.5} />
              <polygon
                className="navtri"
                points={`${vertexIds.map(id => data.zone.vertices[id])}`}
              />
          ))}

        </>}

        <polyline className="navpath" points={`${path}`}/>

        <g className="dots">
          {dots.map((p, i) =>
            <circle
              key={i} cx={p.x} cy={p.y} r={8}
              onClick={(e) => {
                setDots(dots.filter((_, j) => i !== j));
                e.stopPropagation();
              }}
            />
          )}
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
    fill: rgba(0, 0, 0, 0.01);
    stroke-width: 2;
  }

  > g.dots circle {
    fill: white;
    stroke: black;
    stroke-width: 2;
    cursor: pointer;
  }

  > polyline.navpath {
    fill: none;
    stroke: #00f;
    stroke-width: 4;
    stroke-dasharray: 20 10;
  }

  polygon.navtri {
    fill: rgba(0, 0, 0, 0);
    &:hover {
      fill: rgba(0, 0, 0, 0.2);
    }
  }
`;