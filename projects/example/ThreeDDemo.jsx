import React, { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { css } from "goober";

import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import { fillPolygon } from "../service";
import PanZoom from "../panzoom/PanZoom";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function ThreeDDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox} maxZoom={6}>
      {data && <>
        <image {...data.pngRect} href={`/geomorph/${props.layoutKey}.png`} />
        <ForeignObject gm={data} />
      </>}
    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} props */
function ForeignObject({ gm }) {

  const rootEl = useUpdatePerspective();
  const { wallsDataUrl, obstaclesDataUrl } = useDataUrls(gm);

  const { wallSegs, doorSegs, obstacleSegs } = React.useMemo(() => {
    return {
      wallSegs: gm.walls.flatMap(json =>
        Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs
      ),
      doorSegs: gm.doors.map(({ seg: [u, v] }) =>
        [u, v].map(p => Vect.from(p).translate(-gm.pngRect.x, -gm.pngRect.y))
      ),
      obstacleSegs: gm.obstacles.flatMap(json =>
        Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs
      ),
    };
  }, [gm.walls]);

  return (
    <foreignObject ref={rootEl} xmlns="http://www.w3.org/1999/xhtml" {...gm.pngRect}>
      <div className={threeDeeCss}>
        {wallSegs.map(([v, u], i) => { // [v, u] fixes backface culling
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
        {obstacleSegs.map(([v, u], i) => { // [v, u] fixes backface culling
          tempPoint.copy(u).sub(v);
          return (
            <div key={`obstacle-${i}`} className="obstacle"
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
        <img src={obstaclesDataUrl} className="obstacle-tops" />
      </div>
    </foreignObject>
  );
}

const tempPoint = Vect.zero;
const wallHeight = 200;
const obstacleHeight = 100;

const threeDeeCss = css`
  pointer-events: none;
  transform-style: preserve-3d;
  
  .wall {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: #900;
    backface-visibility: hidden;
  }
  .obstacle {
    position: absolute;
    transform-origin: top left;
    height: ${obstacleHeight}px;
    background: rgba(0, 200, 0, 1);
    backface-visibility: hidden;
  }
  .wall-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(${wallHeight}px);
  }
  .obstacle-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(${obstacleHeight}px);
  }
  .door {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: #500;
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
    
    const obstacles = gm.obstacles.map(json => Poly.from(json));
    ctxt.fillStyle = 'rgba(0, 255, 0, 1)';
    fillPolygon(ctxt, obstacles);
    const obstaclesDataUrl = canvas.toDataURL();

    return {
      wallsDataUrl,
      obstaclesDataUrl,
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
