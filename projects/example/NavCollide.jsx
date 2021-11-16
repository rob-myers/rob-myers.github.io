import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geom } from "../service/geom";
import { Pathfinding } from '../pathfinding/Pathfinding';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import DraggableNode from "../ui/DraggableNode";
import classNames from "classnames";

// TODO
// - 2 paths
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  const [state] = React.useState(() => ({
    /** @type {SVGGElement} */
    rootEl: ({}),
    /** @type {SVGCircleElement} */
    targetEl: ({}),
    /** @type {SVGPolylineElement} */
    pathEl: ({}),

    source: new Vect(300, 300),
    target: new Vect(600, 300),
    path: /** @type {Vect[]} */ ([]),

    updatePath: () => {
      const groupId = pathfinding.getGroup(zoneKey, state.source);
      if (groupId !== null) {
        state.path = [state.source.clone()].concat(pathfinding.findPath(state.source, state.target, zoneKey, groupId) || []);
        state.pathEl.setAttribute('points', `${state.path}`);
      }
    },
  }));
  
  const pathfinding = React.useMemo(() => new Pathfinding, []);
  const { data } = useQuery('nav-collide-demo', async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));
    const decomp = geom.polysToTriangulation(navPoly);
    const zone = Pathfinding.createZone(decomp);
    pathfinding.setZoneData(zoneKey, zone);
    return { pngRect: json.pngRect, navPoly, zone };
  });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g
        className={classNames(rootCss, !props.disabled && animateNavpathCss)}
        ref={(el) => {
          if (el) {
            state.rootEl = el;
            state.pathEl = /** @type {SVGPolylineElement} */ (el.querySelector('polyline.navpath'));
            state.updatePath();
          }
        }}
      >

        {data && <>
          <image {...data.pngRect} className="geomorph" href={geomorphPngPath('g-301--bridge')} />

          {data.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => data.zone.vertices[id])}`} />
          ))}
        </>}

        <polyline className="navpath" points={`${state.path}`}/>

        <DraggableNode
          initial={state.source}
          radius={8}
          onStop={(p) => {
            state.source.copy(p);
            state.updatePath();
          }}
          fill="red"
        />

        <DraggableNode
          initial={state.target}
          radius={8}
          onStop={(p) => {
            state.target.copy(p);
            state.updatePath();
          }}
          fill="blue"
        />

      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  polyline.navpath {
    fill: none;
    stroke: #083;
    stroke-width: 4;
    stroke-dasharray: 8px;
    stroke-dashoffset: 16px;
  }

  @keyframes flash {
    0% { stroke-dashoffset: 16px; }
    100% { stroke-dashoffset: 0px; }
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      stroke: #900;
    }
  }
`;

const animateNavpathCss = css`
  polyline.navpath {
    animation: 600ms flash infinite linear;
  }
`;

const zoneKey = 'NavCollideZone';
const initViewBox = new Rect(200, 0, 600, 600);
