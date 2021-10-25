import React, { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { css } from "goober";
import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - wall tops
// - doors
// - transparent obstacles

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function ThreeDDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
    >
      {data && <>
        <image {...data.pngRect}
          className="geomorph"
          href={`/geomorph/${props.layoutKey}.png`}
        />
        <Walls gm={data} />
      </>}
    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} _ */
function Walls({ gm }) {

  const rootEl = useUpdatePerspective();

  const { wallSegs } = React.useMemo(() => {// TODO clarify `translate`
    const walls = gm.walls.map(json => Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y));
    return { walls, wallSegs: walls.flatMap(x => x.lineSegs) };
  }, [gm.walls]);

  return (
    <foreignObject
      ref={rootEl}
      xmlns="http://www.w3.org/1999/xhtml"
      {...gm.pngRect}
    >
      <div className={threeDeeCss}>
        {wallSegs.map(([u, v], i) => {
          tempPoint.copy(u).sub(v);
          return (
            <div
              key={`wall-${i}`}
              className="wall"
              style={{
                transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
                width: tempPoint.length,
              }}
            />
          );
        })}
      </div>
    </foreignObject>
  );
}

let tempPoint = Vect.zero;

const threeDeeCss = css`
  transform-style: preserve-3d;
  pointer-events: none;
  
  .wall {
    position: absolute;
    transform-origin: top left;
    height: 100px;
    background: #000;
    /* backface-visibility: hidden; */
  }
  .top {
    position: absolute;
    transform-origin: top left;
    background: red;
  }
`;

function useUpdatePerspective() {
  /** @type {React.Ref<SVGForeignObjectElement>} */
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current?.ownerSVGElement) {
      const svgEl = rootRef.current.ownerSVGElement;
      const rootDiv = /** @type {HTMLDivElement} */ (Array.from(rootRef.current.children)[0]);

      const updatePerspective = () => {
        const { x, width, y, height } = svgEl.viewBox.baseVal;
        rootDiv.style.perspective = `1000px`;
        rootDiv.style.perspectiveOrigin = `${( x + 0.5 * width )}px ${( y + 0.5 * height)}px`;
      };
      updatePerspective();

      const observer = new MutationObserver((ms) => ms.forEach(m =>
        m.type === 'attributes' && m.attributeName === 'viewBox' && updatePerspective())
      );
      observer.observe(svgEl, { attributes: true });
    }
  }, []);

  return rootRef;
}