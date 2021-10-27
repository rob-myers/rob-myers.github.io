import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Rect, Vect } from "../geom";
import { geom, getSvgPos } from "../service";
import PanZoom from "../panzoom/PanZoom";
import { gridBounds, initViewBox } from "./defaults";

/**
 * TODO movable light
 */

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      className={rootCss}
    >

      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light gm={data} />
      </>}

    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} props */
function Light({ gm }) {

  // TODO move draggable node into self-contained component

  const [state, setState] = React.useState(() => {
    return {
      position: new Vect(300, 300),
      dragging: false,
      /** @param {React.PointerEvent} e */
      startDrag: (e) => {
        e.stopPropagation();
        state.dragging = true;
        state.lineEl.style.display = 'inline';
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.addEventListener('pointermove', state.onMove);
        svg.addEventListener('pointerleave', state.endDrag);
        svg.addEventListener('pointerup', state.endDrag);
      },
      /** @param {PointerEvent}  e */
      onMove: (e) => {
        if (state.dragging) {
          const { x, y } = getSvgPos({ clientX: e.clientX, clientY: e.clientY, ownerSvg: /** @type {SVGSVGElement} */ (state.lineEl.ownerSVGElement), pointerId: null });
          state.lineEl.setAttribute('x2', String(x));
          state.lineEl.setAttribute('y2', String(y));
        }
      },
      endDrag: () => {
        state.dragging = false; // Mutate
        state.lineEl.style.display = 'none';
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.removeEventListener('pointermove', state.onMove);
        svg.removeEventListener('pointerleave', state.endDrag);
        svg.removeEventListener('pointerup', state.endDrag);
      },
      /** @type {SVGLineElement} */
      lineEl: ({}),
    };
  });

  const light = useMemo(() => {
    const polys = (gm.walls.map(x => Poly.from(x)) || []);
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    const polygon = geom.lightPolygon(state.position, 800, triangs);
    const { rect: bounds } = polygon;
    const sourceRatios = state.position.clone().sub(bounds).scale(1 / bounds.width, 1 / bounds.height);
    return { polygon, sourceRatios };
  }, [state.position]);

  return <>
    <defs>
      <radialGradient
        id={`light-radial`}
        cx={`${100 * light.sourceRatios.x}%`}
        cy={`${100 * light.sourceRatios.y}%`}
        r="50%"
      >
        <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 230, 0.75)' }} />
        <stop offset="50%" style={{ stopColor: 'rgba(230, 230, 230, 0.2)' }} />
        <stop offset="100%" style={{ stopColor: 'rgba(255, 200, 255, 0)' }} />
      </radialGradient>
    </defs>
    <path
      fill={`url(#light-radial)`}
      d={light.polygon.svgPath}
    />
    <line
      ref={(el) => el && (state.lineEl = el)}
      className="drag-indicator"
      x1={state.position.x}
      y1={state.position.y}
    />
    <circle
      className="light"
      cx={state.position.x}
      cy={state.position.y}
      r={20}
      // TODO does PointerEvents polyfill work?
      onPointerDown={state.startDrag}
      onPointerUp={state.endDrag}
    />
  </>;
}

const rootCss = css`
  .light {
    fill: red;
    cursor: pointer;
  }
  .drag-indicator {
    stroke: black;
    display: none;
  }
`;
