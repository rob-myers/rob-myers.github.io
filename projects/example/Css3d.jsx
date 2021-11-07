import React from "react";
import { useQuery } from "react-query";
import { css } from "goober";

import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import { fillPolygon } from "../service";
import PanZoom from "../panzoom/PanZoom";
import PanZoomAlt from "../panzoom/PanZoomAlt";
import { labelMeta } from "projects/geomorph/geomorph.model";
import classNames from "classnames";
import useMeasure from "react-use-measure";

/**
 * TODO get previous 3d approach working
 */

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function Css3d(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });

  /** @type {React.RefObject<HTMLDivElement>} */
  const root3d = (React.useRef());
  const [measureRef, dimension] = useMeasure({ debounce: 30, scroll: false });

  return (
    <div ref={measureRef} className={viewportCss}>
      <PanZoomAlt
        gridBounds={gridBounds}
        initViewBox={initViewBox}
        maxZoom={6}
        onUpdate={(scale, bounds) => {
          if (data && root3d.current) {
            root3d.current.style.transform = `scale(${scale}) translate(${data.pngRect.x - bounds.x}px, ${data.pngRect.y - bounds.y}px)`;
            /** @type {HTMLDivElement} */
            const child = (root3d.current.children[0]);
            child.style.perspectiveOrigin = `${bounds.cx}px ${bounds.cy}px`;
          }
        }}
      >
        {data && (
          <image {...data.pngRect} href={`/geomorph/${props.layoutKey}.png`} />
        )}
      </PanZoomAlt>
      {data && <ThreeDee ref={root3d} gm={data} dimension={dimension} />}
    </div>
  );
}

const viewportCss = css`
  position: relative;
  height: 100%;
  
  .three-dim-container {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    pointer-events: none;
    transform-origin: top left;
  }

  .three-dim-container > .three-dim-parent {
    perspective: 500px;
    transform-style: preserve-3d;
    position: absolute;

    .wall {
      transform-origin: top left;
      position: absolute;
      height: 50px;
      background: red;
      /* backface-visibility: hidden; */
    }
  }
`;

const ThreeDee = React.forwardRef((
  /** @type {{ gm: Geomorph.GeomorphJson; dimension: Geom.VectJson }} */
  { gm, dimension },
  /** @type {React.ForwardedRef<HTMLDivElement>} */
  ref,
) => {

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
    <div
      ref={ref}
      className="three-dim-container"
      // style={{ transform: `${scale} ${translate}` }}
    >
      <div
        className="three-dim-parent"
        // style={dimension && {
        //   // perspectiveOrigin: `${100 * (mouseWorld.x / dimension.x)}% ${100 * (mouseWorld.y / dimension.y)}%`,
        //   width: dimension.x,
        //   height: dimension.y,
        // }}
      >
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
      </div>
    </div>
  );
});

// /** @param {{ gm: Geomorph.GeomorphJson }} props */
// function ForeignObject({ gm }) {

//   const { wallsDataUrl, obstaclesDataUrl, labelsDataUrl } = useDataUrls(gm);

//   const { wallSegs, doorSegs, obstacleSegs } = React.useMemo(() => {
//     return {
//       wallSegs: gm.walls.flatMap(json =>
//         Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs
//       ),
//       doorSegs: gm.doors.map(({ seg: [u, v] }) =>
//         [u, v].map(p => Vect.from(p).translate(-gm.pngRect.x, -gm.pngRect.y))
//       ),
//       obstacleSegs: gm.obstacles.flatMap(json =>
//         Poly.from(json).translate(-gm.pngRect.x, -gm.pngRect.y).lineSegs
//       ),
//     };
//   }, [gm.walls]);

//   return (
//     <foreignObject xmlns="http://www.w3.org/1999/xhtml" {...gm.pngRect}>
//       <div className={classNames("root-3d-div", threeDeeCss)}>
//         {wallSegs.map(([v, u], i) => { // [v, u] fixes backface culling
//           tempPoint.copy(u).sub(v);
//           return (
//             <div key={`wall-${i}`} className="wall"
//               style={{
//                 transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
//                 width: tempPoint.length,
//               }}
//             />
//           );
//         })}
//         {/* {obstacleSegs.map(([v, u], i) => { // [v, u] fixes backface culling
//           tempPoint.copy(u).sub(v);
//           return (
//             <div key={`obstacle-${i}`} className="obstacle"
//               style={{
//                 transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
//                 width: tempPoint.length,
//               }}
//             />
//           );
//         })}
//         {doorSegs.map(([u, v], i) => {
//           tempPoint.copy(u).sub(v);
//           return (
//             <div key={`door-${i}`} className="door"
//               style={{
//                 transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
//                 width: tempPoint.length,
//               }}
//             />
//           );
//         })} */}
//         {/* <img src={wallsDataUrl} className="wall-tops" /> */}
//         <img src={obstaclesDataUrl} className="obstacle-tops" />
//         {/* <img src={labelsDataUrl} className="labels" /> */}
//       </div>
//     </foreignObject>
//   );
// }

const tempPoint = Vect.zero;
// const wallHeight = 150;
// const obstacleHeight = 75;
// const color = {
//   obstacleTop: '#666',
//   obstacleSide: '#444',
//   wallTop: '#222',
//   wallSide: '#000',
//   door: '#444',
// };

// const threeDeeCss = css`
//   pointer-events: none;
//   transform-style: preserve-3d;
//   perspective: 1000px;
//   /* perspective-origin: 5000px 5000px; */
  
//   .door {
//     position: absolute;
//     transform-origin: top left;
//     height: ${wallHeight}px;
//     background: ${color.door};
//   }
//   .obstacle {
//     position: absolute;
//     transform-origin: top left;
//     height: ${obstacleHeight}px;
//     background: ${color.obstacleSide};
//     backface-visibility: hidden;
//   }
//   .wall {
//     position: absolute;
//     transform-origin: top left;
//     height: ${wallHeight}px;
//     background: ${color.wallSide};
//     backface-visibility: hidden;
//   }
//   .obstacle-tops {
//     position: absolute;
//     transform-origin: top left;
//     transform: translateZ(${obstacleHeight}px);
//   }
//   .labels, .wall-tops {
//     position: absolute;
//     transform-origin: top left;
//     transform: translateZ(${wallHeight}px);
//   }
// `;

// /**
//  * @param {Geomorph.GeomorphJson} gm 
//  */
// function useDataUrls(gm) {
//   return React.useMemo(() => {
//     const canvas = document.createElement('canvas');
//     const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
//     [canvas.width, canvas.height] = [gm.pngRect.width, gm.pngRect.height];
//     ctxt.translate(-gm.pngRect.x, -gm.pngRect.y);

//     const walls = gm.walls.map(json => Poly.from(json));
//     ctxt.fillStyle = color.wallTop;
//     fillPolygon(ctxt, walls);
//     const wallsDataUrl = canvas.toDataURL();
//     ctxt.clearRect(0, 0, canvas.width, canvas.height);
    
//     const obstacles = gm.obstacles.map(json => Poly.from(json));
//     ctxt.fillStyle = color.obstacleTop;
//     fillPolygon(ctxt, obstacles);
//     const obstaclesDataUrl = canvas.toDataURL();
//     ctxt.clearRect(0, 0, canvas.width, canvas.height);

//     ctxt.font = labelMeta.font;
//     ctxt.textBaseline = 'top';
//     for (const { text, rect, padded } of gm.labels) {
//       ctxt.fillStyle = '#000';
//       ctxt.fillRect(padded.x, padded.y, padded.width, padded.height);
//       ctxt.fillStyle = '#fff';
//       ctxt.fillText(text, rect.x, rect.y)
//     }
//     const labelsDataUrl = canvas.toDataURL();

//     return {
//       wallsDataUrl,
//       obstaclesDataUrl,
//       labelsDataUrl,
//     }
//   }, [gm.walls]);
// }
