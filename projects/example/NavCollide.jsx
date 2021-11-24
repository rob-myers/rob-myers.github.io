import React from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geom } from "../service/geom";
import { Pathfinding } from '../pathfinding/Pathfinding';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import DraggablePath from "../ui/DraggablePath";
import classNames from "classnames";

// TODO
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  const [state] = React.useState(() => ({
    pathA: { initSrc: new Vect(300, 300), initDst: new Vect(600, 300) },
    pathB: { initSrc: new Vect(200, 200), initDst: new Vect(680, 200) },
    botA: {
      el: /** @type {SVGGElement} */ ({}),
      anim: /** @type {Animation} */ ({}),
    },
    disabled: props.disabled,
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

  React.useEffect(() => {
    if (props.disabled) {
      state.botA.anim.pause?.();
    } else {
      state.botA.anim.play?.();
    }
    state.disabled = props.disabled;
  }, [props.disabled]);

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g
        className={classNames(rootCss, !props.disabled && animateNavpathCss)}
        ref={(rootEl) => {
          if (rootEl) {
            state.botA.el = /** @type {*} */ (rootEl.querySelector('g.bot-a'));
          }
        }}
      >

        {data && <>
          <image {...data.pngRect} className="geomorph" href={geomorphPngPath('g-301--bridge')} />

          {data.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => data.zone.vertices[id])}`} />
          ))}

          <DraggablePath
            initial={{ src: state.pathA.initSrc, dst: state.pathA.initDst }}
            pathfinding={pathfinding}
            zoneKey={zoneKey}
            radius={4}
            onChange={(path) => {
              const bot = state.botA;

              if (bot.el && path.length) {
                // Move bot along path using Web Animations API
                const edges = path.map((p, i) => ({ p, q: path[i + 1] })).slice(0, -1);
                const elens = edges.map(({ p, q }) => p.distanceTo(q));
                const { sofars, total } = elens.reduce((agg, length) => {
                  agg.total += length;
                  agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
                  return agg;
                }, { sofars: [0], total: 0 });

                bot.anim = bot.el.animate(
                  path.map((p, i) => ({ offset: sofars[i] / total, transform: `translate(${p.x}px, ${p.y}px)` })),
                  { duration: 5000, iterations: Infinity, direction: 'alternate',  },
                );

                if (state.disabled) bot.anim.pause();
              }
            }}
            />

          <DraggablePath
            initial={{ src: state.pathB.initSrc, dst: state.pathB.initDst }}
            pathfinding={pathfinding}
            zoneKey={zoneKey}
            radius={4}
            onChange={(path) => {
              console.log('path B', path);
            }}
          />

          <g className="bot-a">
            <circle fill="red" stroke="black" strokeWidth={2} r="10" />
            <line stroke="black" strokeWidth={2} x2="10" />
          </g>

        </>}
        
      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  polyline.navpath {
    fill: none;
    stroke: #777;
    stroke-width: 2;
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

  g.bot-a {
    pointer-events: none;
  }
`;

const animateNavpathCss = css`
  polyline.navpath {
    animation: 600ms flash infinite linear;
  }
`;

const zoneKey = 'NavCollideZone';
const initViewBox = new Rect(200, 0, 600, 600);
