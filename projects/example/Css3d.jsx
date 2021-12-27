import React from "react";
import { css, styled } from "goober";
import classNames from "classnames";

import * as defaults from "./defaults";
import { Poly, Vect, Rect } from "../geom";
import { fillPolygon, getSvgPos } from "../service/dom";
import PanZoom from "../panzoom/PanZoom";
import { geomorphPngPath, labelMeta } from "../geomorph/geomorph.model";
import { useGeomorphJson } from "../hooks";
import { debounce } from "debounce";

/**
 * TODO
 * - props.disabled unmounts DOM segs
 */

/** @param {{ layoutKey: Geomorph.LayoutKey; disabled?: boolean; }} props */
export default function Css3d(props) {

  const { data: gm } = useGeomorphJson(props.layoutKey);

  const [state] = React.useState(() => ({
    root3d: /** @type {HTMLDivElement} */ ({}),
    eye: /** @type {HTMLDivElement} */ ({}),
    svg: /** @type {SVGSVGElement} */ ({}),
    /** @param {SVGSVGElement} el */
    onUpdate: (el) => {
      const { height } = el.viewBox.baseVal;
      const zoom = defaults.initViewBox.height / height;
      const { root3d, eye } = state;
      if (root3d) {
        root3d.style.perspective = `${100 + (500 / zoom)}px`;
        const eyeRect = eye.getBoundingClientRect();
        const svgPos = getSvgPos({ clientX: eyeRect.x, clientY: eyeRect.y, ownerSvg: el, pointerId: null });
        root3d.style.perspectiveOrigin = `${( svgPos.x )}px ${( svgPos.y )}px`;
      }
    },
    onResize: debounce(() => {
      state.svg && state.onUpdate(state.svg);
    }, 30),
  }));

  return (
    <Root>
      <PanZoom
        gridBounds={defaults.gridBounds} initViewBox={defaults.initViewBox} maxZoom={6}
        onUpdate={state.onUpdate}
        dark
      >
        {gm && (
          <g ref={(el) => {
            if (el) {
              state.root3d = /** @type {*} */ (el.querySelector('.root-3d'));
              state.svg = /** @type {*} */ (el.ownerSVGElement);
              setTimeout(() => state.onUpdate(/** @type {SVGSVGElement} */ (el.ownerSVGElement)));
              window.addEventListener('resize', state.onResize);
            } else {
              window.removeEventListener('resize', state.onResize);
            }
          }}>
            <image {...gm.pngRect} href={geomorphPngPath(props.layoutKey)} />
            <ForeignObject gm={gm} />
          </g>
        )}
      </PanZoom>
      <div
        className="eye"
        ref={(el) => el && (state.eye = el)}
      />
    </Root>
  );
}

const Root = styled('div')`
  height: 100%;
  > .eye {
    position: absolute;
    width: 10px;
    height: 10px;
    top: calc(50% - 5px);
    left: calc(50% - 5px);
    background: red;
    pointer-events: none;
  }
`;


/** @param {{ gm: Geomorph.GeomorphJson }} props */
function ForeignObject({ gm }) {

  const { wallsDataUrl, obstaclesDataUrl, labelsDataUrl } = useDataUrls(gm);

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
    <foreignObject xmlns="http://www.w3.org/1999/xhtml" {...gm.pngRect}>
      <div className={classNames("root-3d", threeDeeCss)}>
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
        <img src={labelsDataUrl} className="labels" />
      </div>
    </foreignObject>
  );
}

const tempPoint = Vect.zero;
const wallHeight = 150;
const obstacleHeight = 75;
const color = {
  obstacleTop: '#666',
  obstacleSide: '#444',
  wallTop: '#222',
  wallSide: '#000',
  door: '#444',
};

const threeDeeCss = css`
  pointer-events: none;
  transform-style: preserve-3d;
  
  .door {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: ${color.door};
  }
  .obstacle {
    position: absolute;
    transform-origin: top left;
    height: ${obstacleHeight}px;
    background: ${color.obstacleSide};
    backface-visibility: hidden;
  }
  .wall {
    position: absolute;
    transform-origin: top left;
    height: ${wallHeight}px;
    background: ${color.wallSide};
    backface-visibility: hidden;
  }
  .obstacle-tops {
    position: absolute;
    transform-origin: top left;
    transform: translateZ(${obstacleHeight}px);
  }
  .labels, .wall-tops {
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
    ctxt.fillStyle = color.wallTop;
    fillPolygon(ctxt, walls);
    const wallsDataUrl = canvas.toDataURL();
    ctxt.clearRect(0, 0, canvas.width, canvas.height);
    
    const obstacles = gm.obstacles.map(json => Poly.from(json));
    ctxt.fillStyle = color.obstacleTop;
    fillPolygon(ctxt, obstacles);
    const obstaclesDataUrl = canvas.toDataURL();
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    ctxt.font = labelMeta.font;
    ctxt.textBaseline = 'top';
    for (const { text, rect, padded } of gm.labels) {
      ctxt.fillStyle = '#000';
      ctxt.fillRect(padded.x, padded.y, padded.width, padded.height);
      ctxt.fillStyle = '#fff';
      ctxt.fillText(text, rect.x, rect.y)
    }
    const labelsDataUrl = canvas.toDataURL();

    return {
      wallsDataUrl,
      obstaclesDataUrl,
      labelsDataUrl,
    }
  }, [gm.walls]);
}
