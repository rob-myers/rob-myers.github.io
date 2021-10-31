import React, { useMemo } from "react";
import { css } from "goober";
import { useQuery } from "react-query";

import { Poly, Vect } from "../geom";
import { geom, getSvgPos } from "../service";
import PanZoom from "../panzoom/PanZoom";
import { gridBounds, initViewBox } from "./defaults";

/**
 * TODO
 * - move draggable node into self-contained component
 * - possibly permit two lights
 */

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function LightDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6} className={rootCss}>

      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`} />
        <Light gm={data} />
      </>}

    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} props */
function Light({ gm }) {

  const [renderCount, setRenderCount] = React.useState(1);

  const [state, setState] = React.useState(() => {
    return {
      position: new Vect(300, 300),
      target: new Vect(300, 300),
      dragging: false,
      /** @param {React.PointerEvent} e */
      startDrag: (e) => {
        e.stopPropagation();
        state.dragging = true;
        state.lineEl.style.display = 'inline';
        state.target.copy(state.position);
        ['x1', 'x2'].forEach(attr => state.lineEl.setAttribute(attr, String(state.position.x)));
        ['y1', 'y2'].forEach(attr => state.lineEl.setAttribute(attr, String(state.position.y)));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.addEventListener('pointermove', state.onMove);
        svg.addEventListener('pointerleave', state.endDrag);
        svg.addEventListener('pointerup', state.applyDrag);
        window.addEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'grabbing';
      },
      /** @param {PointerEvent}  e */
      onMove: (e) => {
        if (state.dragging) {
          const { x, y } = getSvgPos({
            clientX: e.clientX,
            clientY: e.clientY,
            ownerSvg: /** @type {SVGSVGElement} */ (state.lineEl.ownerSVGElement),
            pointerId: null,
          });
          state.target.set(x, y);
          state.lineEl.setAttribute('x2', String(x));
          state.lineEl.setAttribute('y2', String(y));
        }
      },
      endDrag: () => {
        state.dragging = false; // Mutate
        state.lineEl.style.display = 'none';
        state.lineEl.setAttribute('x2', /** @type {*} */ (state.lineEl.getAttribute('x1')));
        state.lineEl.setAttribute('y2', /** @type {*} */ (state.lineEl.getAttribute('y1')));
        /** @type {SVGSVGElement} */
        const svg = (state.lineEl.ownerSVGElement);
        svg.removeEventListener('pointermove', state.onMove);
        svg.removeEventListener('pointerleave', state.endDrag);
        svg.removeEventListener('pointerup', state.applyDrag);
        window.removeEventListener('keydown', state.endDragOnEscape);
        svg.style.cursor = 'auto';
      },
      applyDrag: () => {
        state.endDrag();
        state.position.copy(state.target);
        state.lineEl.setAttribute('x1', String(state.target.x));
        state.lineEl.setAttribute('y1', String(state.target.y));
        setRenderCount(x => ++x);
      },
      /** @param {KeyboardEvent} e */
      endDragOnEscape: (e) => void (e.key === 'Escape' && state.endDrag()),
      /** @type {SVGLineElement} */
      lineEl: ({}),
    };
  });

  const light = useMemo(() => {
    const polys = gm.walls.map(x => Poly.from(x));
    const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
    const polygon = geom.lightPolygon(state.position, 1000, triangs);
    const inverted = Poly.cutOut([polygon], [Poly.fromRect(gm.pngRect)]);
    const { rect: bounds } = polygon;
    const sourceRatios = state.position.clone().sub(bounds).scale(1 / bounds.width, 1 / bounds.height);
    return { polygon: inverted, sourceRatios };
  }, [state.position.x, state.position.y]);

  return <>
    {light.polygon.map((x, i) => (
      <path
        key={i}
        fill={`rgba(0, 0, 0, 0.5)`}
        d={x.svgPath}
      />
    ))}
    <line
      ref={(el) => el && (state.lineEl = el)}
      className="drag-indicator"
    />
    <circle
      className="light"
      cx={state.position.x}
      cy={state.position.y}
      r={10}
      // TODO does PointerEvents polyfill work?
      onPointerDown={state.startDrag}
      onPointerUp={state.applyDrag}
    />
  </>;
}

const rootCss = css`
  .light {
    fill: white;
    stroke: black;
    cursor: pointer;
    stroke-width: 2;
  }
  .drag-indicator {
    stroke: black;
    display: none;
    stroke-width: 2.5;
    user-select: none;
  }
`;
