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
import DraggableNode from "../ui/DraggableNode";

// TODO
// - circle follows path

export default function NavStringPull() {

  const [state] = React.useState(() => ({
    /** @type {SVGGElement} */
    targetEl: ({}),
    /** @type {SVGPolylineElement} */
    pathEl: ({}),

    source: new Vect(300, 300),
    target: new Vect(300, 300),
    path: /** @type {Vect[]} */ ([]),
    dragging: false,

    /** @param {PointerEvent} e */
    pointerup: (e) => {
      if (state.dragging) return;
      const mouse = Vect.from(getSvgPos(projectSvgEvt(e)));
      state.target.copy(mouse);
      state.targetEl.style.transform = `translate(${state.target.x}px, ${state.target.y}px)`;
      state.updatePath();
    },
    updatePath: () => {
      const groupId = pathfinding.getGroup(zoneKey, state.source);
      if (groupId !== null) {
        state.path = [state.source.clone()].concat(pathfinding.findPath(state.source, state.target, zoneKey, groupId) || []);
        state.pathEl.setAttribute('points', `${state.path}`);
      }
    },
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

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={defaults.initViewBox} maxZoom={6}>
      <g
        className={rootCss}
        ref={(el) => {
          if (el) {
            state.targetEl = /** @type {SVGGElement} */ (el.querySelector('circle.target'));
            state.pathEl = /** @type {SVGPolylineElement} */ (el.querySelector('polyline.navpath'));
            el.addEventListener('pointerup', state.pointerup);
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

        <circle className="target" r={8} style={{ transform: `translate(${state.target.x}px, ${state.target.y}px)` }}/>

        <DraggableNode
          initial={state.source}
          radius={8}
          onStart={() => {
            state.dragging = true;
          }}
          onStop={(p) => {
            state.source.copy(p);
            state.updatePath();
            state.dragging = false;
          }}
        />

      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  circle.source {
    fill: red;
    cursor: pointer;
  }
  circle.target {
    fill: green;
  }

  > polyline.navpath {
    fill: none;
    stroke: #00f;
    stroke-width: 4;
    stroke-dasharray: 20 10;
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      fill: rgba(0, 0, 80, 0.2);
    }
  }
`;

const zoneKey = 'NavStringPullZone';
