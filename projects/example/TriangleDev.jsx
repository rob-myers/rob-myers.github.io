import React from "react";
import { useQuery } from "react-query";
import { styled } from "goober";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect, Vect } from '../geom';
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - try triangle-wasm on nodejs ✅
// - get triangle-wasm working in DEV browser ✅
// - fix triangulation errors ✅
// - remove recast service etc ✅
// - ui controls to play with triangulation

/**
 * @param {{ layoutKey: Geomorph.LayoutKey}} props 
 */
export default function TriangleDev(props) {
  
  const [state, setState] = React.useState(() => ({
    minArea: { disabled: true, area: 505 },
    maxMinAngle: { disabled: true, angle: 80 },
  }));

  const { data: gmAux } = useQuery(`gm-aux-${props.layoutKey}`, async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath(props.layoutKey)).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x)).slice(0, 1);
    return {
      navPoly,
      pngRect: json.pngRect,
    };
  });

  const { data: triData } = useQuery(`tri-dev-${props.layoutKey}-${!!gmAux}-${JSON.stringify(state)}`, async () => {
    if (gmAux) {
      const { vs: vsJson, tris: triIds } = /** @type {Geom.TriangulationJson} */ (await fetch('/api/dev/triangle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polys: gmAux.navPoly.map(x => x.geoJson) }),
      }).then(x => x.json()));
  
      const vs = vsJson.map(Vect.from);
      const tris = triIds.map(triple => /** @type {Triple<Geom.Vect>} */ (triple.map(id => vs[id])));
      return {
        tris,
      };
    }
  }, {
    staleTime: Infinity,
  });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>

      {gmAux && <>
        <image {...gmAux.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />
      </>}

      {triData?.tris.map((points) =>
        <polygon
          stroke="red"
          fill="none"
          strokeWidth={1}
          className="navtri"
          points={`${points}`}
        />
      )}

      <ForeignObject xmlns="http://www.w3.org/1999/xhtml">
        <div className="min-area">
          <input type="range" id="min-tri-area-range" min={10} max={1000} defaultValue={state.minArea.area}
            disabled={state.minArea.disabled}
            onChange={()  => {}}
          />
          <label htmlFor="min-tri-area-range" onClick={() => setState(x => { x.minArea.disabled = !x.minArea.disabled; return { ...x }; })}>
            min area
          </label>
        </div>
        <div className="maxmin-angle">
          <input type="range" id="maxmin-tri-angle-range" min={20} max={140} defaultValue={state.maxMinAngle.angle}
            disabled={state.maxMinAngle.disabled}
          />
          <label htmlFor="maxmin-tri-angle-range" onClick={() => setState(x => { x.maxMinAngle.disabled = !x.maxMinAngle.disabled; return { ...x }; })}>
            maxmin angle
          </label>
        </div>
      </ForeignObject>

    </PanZoom>
  );
}

const initViewBox = new Rect(200, 0, 600, 600);

const ForeignObject = styled('foreignObject')`
  background: #eee;
  border: 1px solid #aaa;
  font-size: 1rem;
  padding: 8px;
  width: 220px;
  height: 100px;
  x: -6px;
  y: -106px;

  div { display: flex; }
  label { cursor: pointer; user-select: none; }

  div.min-area {
    input[type="range"] { width: 80px; margin-right: 8px; }
  }
  div.maxmin-angle {
    input[type="range"] { width: 80px; margin-right: 8px; }
  }
`;
