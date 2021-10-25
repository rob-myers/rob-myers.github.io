import React, { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { css } from "goober";
import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import { fillPolygon } from "../service";
import PanZoom from "../panzoom/PanZoom";

// TODO
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

  const { wallsDataUrl, doorsDataUrl } = useDataUrls(gm);
  
  const rootEl = useUpdatePerspective();

  const { wallSegs, doorSegs } = React.useMemo(() => {
    return {
      wallSegs: gm.walls.flatMap(json => Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs),
      doorSegs: gm.doors.flatMap(json => Poly.from(json.poly).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs),
    };
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
        {doorSegs.map(([u, v], i) => {
          tempPoint.copy(u).sub(v);
          return (
            <div key={`door-${i}`} className="door"
              style={{
                transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
                width: tempPoint.length,
              }}
            />
          );
        })}
        <img src={wallsDataUrl} className="wall-tops" />
        <img src={doorsDataUrl} className="door-tops" />
      </div>
    </foreignObject>
  );
}

const tempPoint = Vect.zero;
const wallHeight = 100;

const threeDeeCss = css`
  transform-style: preserve-3d;
  pointer-events: none;
  
  .wall {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: #900;
    /* backface-visibility: hidden; */
  }
  .wall-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(${wallHeight}px);
  }
  .door {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: #000;    
  }
  .door-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(${wallHeight}px);
  }
`;

/**
 * @param {Geomorph.GeomorphJson} gm 
 */
function useDataUrls(gm) {
  return React.useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    [canvas.width, canvas.height] = [gm.pngRect.width, gm.pngRect.height];
    ctxt.translate(-gm.pngRect.x, -gm.pngRect.y);

    const walls = gm.walls.map(json => Poly.from(json));
    ctxt.fillStyle = '#c00';
    fillPolygon(ctxt, walls);
    const wallsDataUrl = canvas.toDataURL();
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    
    const doors = gm.doors.map(json => Poly.from(json.poly));
    ctxt.fillStyle = '#000';
    fillPolygon(ctxt, doors);
    const doorsDataUrl = canvas.toDataURL();

    return {
      wallsDataUrl,
      doorsDataUrl,
    }
  }, [gm.walls]);
}

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