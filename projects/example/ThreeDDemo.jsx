import React from "react";
import { useQuery } from "react-query";
import classNames from "classnames";
import { css } from "goober";
import { gridBounds, initViewBox } from "./defaults";
import { Poly, Vect } from "../geom";
import PanZoom from "../panzoom/PanZoom";

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
      // className={rootCss}
    >

      {data && <>
        <image
          {...data.pngRect}
          className="geomorph"
          href={`/geomorph/${props.layoutKey}.png`}
        />
        <Walls gm={data} />
      </>}

    </PanZoom>
  );
}

/** @param {{ gm: Geomorph.GeomorphJson }} props */
function Walls(props) {
  const { pngRect, walls } = props.gm;

  const wallSegs = React.useMemo(() => {
    return walls.flatMap(json => Poly.from(json).lineSegs);
  }, [walls]);

  return (
    <foreignObject
      xmlns="http://www.w3.org/1999/xhtml"
      {...pngRect}
    >
      <div className={threeDeeCss}>
        {
          wallSegs.map(([ u, v ], i) => {
            tempPoint.copy(u).sub(v);
            return (
              <div
                key={`wall-${i}`}
                className={classNames('wall')}
                style={{
                  transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.angle}rad) rotateX(90deg)`,
                  width: tempPoint.length,
                }}
              />
            );
          })
        }
      </div>
    </foreignObject>
  );
}

let tempPoint = Vect.zero;

const threeDeeCss = css`
  perspective: 500px;
  transform-style: preserve-3d;
  position: absolute;

  .wall {
    transform-origin: top left;
    position: absolute;
    height: 50px;
    /* background: #222; */
    background: #222;
  }

`;
