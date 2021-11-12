import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import * as defaults from "./defaults";
import { Poly, Vect } from "../geom";
import { getSvgPos, projectSvgEvt } from "../service/dom";
import { geom } from "../service/geom";
import { Pathfinding } from '../pathfinding/Pathfinding';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import PanZoom from "../panzoom/PanZoom";

export default function NavStringPull() {

  // const [dots, setDots] = useState(/** @type {Geom.VectJson[]} */ ([]));
  // const [path, setPath] = useState(/** @type {Geom.Vect[]} */ ([]));
  const [state, setState] = React.useState(() => ({
    bot: new Vect(300, 300),
    target: new Vect(300, 300),
  }));
  
  const pathfinding = React.useMemo(() => new Pathfinding, []);
  const { data } = useQuery('navpoly-demo', async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));
    const decomp = geom.polysToTriangulation(navPoly);
    const zone = Pathfinding.createZone(decomp);
    pathfinding.setZoneData(zoneKey, zone);
    return { pngRect: json.pngRect, navPoly, zone };
  });

  // useEffect(() => {
  //   if (dots.length === 2) {
  //     const groupId = pathfinding.getGroup(zoneKey, dots[0]);
  //     if (groupId !== null) {
  //       setPath(
  //         [dots[0]].concat(pathfinding.findPath(dots[0], dots[1], zoneKey, groupId) || [])
  //           .map(Vect.from)
  //       );
  //     }
  //   } else {
  //     setPath([]);
  //   }
  // }, [dots]);

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={defaults.initViewBox} maxZoom={6}>
      <g
        className={rootCss}
        ref={(el) => {
          if (el) {// Use native events so polyfill works
            el.addEventListener('pointerup', (e) => {
              state.target.copy(Vect.from(getSvgPos(projectSvgEvt(e))));
              setState({ ...state });
            });
          }
        }}
      >

        {data && <>
          <image
            {...data.pngRect}
            className="geomorph"
            href={geomorphPngPath('g-301--bridge')}
          />

          {/* {data.navPoly.map(x => (
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
          ))} */}

          {data.zone.groups.map(nodes =>
            nodes.map(({ centroid, vertexIds}) =>
              // <circle fill="rgba(0, 0, 0, 0.2)" cx={centroid.x} cy={centroid.y} r={2.5} />
              <polygon
                className="navtri"
                points={`${vertexIds.map(id => data.zone.vertices[id])}`}
              />
          ))}

        </>}

        {/* <polyline className="navpath" points={`${path}`}/> */}

        <g className="target" style={{ transform: `translate(${state.target.x}px, ${state.target.y}px)` }}>
          <circle r={8}/>
        </g>

        <g className="bot" style={{ transform: `translate(${state.bot.x}px, ${state.bot.y}px)` }}>
          <circle r={8}/>
        </g>


        {/* <g className="dots">
          {dots.map((p, i) =>
            <circle
              key={i} cx={p.x} cy={p.y} r={8}
              onClick={(e) => {
                setDots(dots.filter((_, j) => i !== j));
                e.stopPropagation();
              }}
            />
          )}
        </g> */}
      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  /* > path.navpoly {
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
  } */

  .bot > circle {
    fill: red;
    cursor: pointer;
  }
  .target > circle {
    fill: green;
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      fill: rgba(80, 0, 0, 0.2);
    }
  }
`;

const zoneKey = 'NavStringPullZone';
