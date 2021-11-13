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

  const [state] = React.useState(() => ({
    /** @type {SVGGElement} */
    targetEl: ({}),
    /** @type {SVGPolylineElement} */
    pathEl: ({}),
    bot: new Vect(300, 300),
    target: new Vect(300, 300),
    path: /** @type {Vect[]} */ ([]),
    /** @param {PointerEvent} e */
    pointerup: (e) => {
      state.target.copy(Vect.from(getSvgPos(projectSvgEvt(e))));
      state.targetEl.style.transform = `translate(${state.target.x}px, ${state.target.y}px)`;

      const groupId = pathfinding.getGroup(zoneKey, state.bot);
      if (groupId !== null) {
        state.path = [state.bot].concat(pathfinding.findPath(state.bot, state.target, zoneKey, groupId) || []);
        console.log(state.path);
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
            state.targetEl = /** @type {SVGGElement} */ (el.querySelector('g.target'));
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

        <g className="target" style={{ transform: `translate(${state.target.x}px, ${state.target.y}px)` }}>
          <circle r={8}/>
        </g>

        <g className="bot" style={{ transform: `translate(${state.bot.x}px, ${state.bot.y}px)` }}>
          <circle r={8}/>
        </g>

      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  .bot > circle {
    fill: red;
    cursor: pointer;
  }
  .target > circle {
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
      fill: rgba(80, 0, 0, 0.2);
    }
  }
`;

const zoneKey = 'NavStringPullZone';
