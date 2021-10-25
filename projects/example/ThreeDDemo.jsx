import React, { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { css } from "goober";
import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import { fillPolygon } from "../service";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - doors
// - transparent obstacles

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function ThreeDDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6}>
      {data && <>
        <image {...data.pngRect} className="geomorph" href={`/geomorph/${props.layoutKey}.png`}/>
        <ForeignObject gm={data} />
      </>}
    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} _ */
function ForeignObject({ gm }) {
  const rootEl = useUpdatePerspective();

  const wallSegs = React.useMemo(() => {// TODO clarify `translate`
    return gm.walls.flatMap(json => Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs);
  }, [gm.walls]);

  const wallsDataUrl = React.useMemo(() => {
    const walls = gm.walls.map(json => Poly.from(json));
    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [gm.pngRect.width, gm.pngRect.height];
    const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    ctxt.fillStyle = '#00f';
    ctxt.translate(-gm.pngRect.x, -gm.pngRect.y);
    fillPolygon(ctxt, walls);
    return canvas.toDataURL();
  }, [gm.walls]);

  return (
    <foreignObject ref={rootEl} xmlns="http://www.w3.org/1999/xhtml" {...gm.pngRect}>
      <div className={threeDeeCss}>
        {wallSegs.map(([u, v], i) => {
          tempPoint.copy(u).sub(v);
          return (
            <div key={`wall-${i}`} className="wall"
              style={{
                transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
                width: tempPoint.length,
              }}
            />
          );
        })}
        <img src={wallsDataUrl} className="wall-tops" />
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
    background: #a00;
    /* backface-visibility: hidden; */
  }
  .wall-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(100px);
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