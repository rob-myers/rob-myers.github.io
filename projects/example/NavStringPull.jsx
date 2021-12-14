import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { Pathfinding } from '../pathfinding/Pathfinding';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import DraggableNode from "../ui/DraggableNode";
import classNames from "classnames";

// TODO
// - also show triangle path

/** @param {{ disabled?: boolean }} props */
export default function NavStringPull(props) {

  const { data } = useQuery(geomorphJsonPath('g-301--bridge'), async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json()));
  });

  const [state, setState] = React.useState(() => ({
    rootEl: /** @type {SVGGElement} */ ({}),
    pathEl: /** @type {null | SVGPolylineElement} */ (null),

    source: new Vect(300, 300),
    target: new Vect(600, 300),
    path: /** @type {Vect[]} */ ([]),

    pathfinding: new Pathfinding,
    zone: /** @type {undefined | Nav.Zone} */ (undefined),
    navPoly: /** @type {Poly[]} */ ([]),

    updatePath: () => {
      const groupId = state.pathfinding.getGroup(zoneKey, state.source);
      if (groupId !== null) {
        /**
         * TODO use returned `nodePath` and illustrate it
         */
        state.path = [state.source.clone()].concat(
          state.pathfinding.findPath(state.source, state.target, zoneKey, groupId)?.path || []
        );
        state.pathEl = state.pathEl || state.rootEl.querySelector('polyline.navpath');
        state.pathEl?.setAttribute('points', `${state.path}`);
      }
    },
  }));

  React.useEffect(() => {
    if (data && !props.disabled && !state.zone) {
      state.zone = Pathfinding.createZone(data.navDecomp);
      state.pathfinding.setZoneData(zoneKey, state.zone);
      state.navPoly = data.navPoly.map(x => Poly.from(x));
      setState({...state});
    }
  }, [data, props.disabled]);

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g
        className={classNames(rootCss, !props.disabled && animateNavpathCss)}
        ref={(el) => {
          if (el) {
            state.rootEl = el;
            state.updatePath();
          }
        }}
      >
        {data && (
          <image {...data.pngRect} className="geomorph" href={geomorphPngPath('g-301--bridge')} />
        )}

        {state.zone?.groups.map(nodes => nodes.map(({ vertexIds }) =>
          <polygon className="navtri" points={`${vertexIds.map(id => state.zone?.vertices[id])}`} />
        ))}

        <DraggableNode
          initial={state.source}
          icon="run"
          onStop={(p) => {
            if (!state.navPoly.some(x => x.contains(p))) return 'cancel';
            state.source.copy(p);
            state.updatePath();
          }}
        />
        <polyline className="navpath" points={`${state.path}`}/>
        <DraggableNode
          initial={state.target}
          icon="finish"
          onStop={(p) => {
            if (!state.navPoly.some(x => x.contains(p))) return 'cancel';
            state.target.copy(p);
            state.updatePath();
          }}
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

const zoneKey = 'NavStringPullZone';
const initViewBox = new Rect(200, 0, 600, 600);
