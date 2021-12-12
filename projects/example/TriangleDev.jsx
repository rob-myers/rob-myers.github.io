import React from "react";
import { useQuery } from "react-query";
import { styled } from "goober";
import { assertDefined } from "../service/generic";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect, Vect } from '../geom';
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - try triangle-wasm on nodejs ✅
// - get triangle-wasm working in DEV browser ✅
// - fix triangulation errors ✅
// - remove recast service etc ✅
// - ui controls to play with triangulation ✅

/**
 * @param {{ layoutKey: Geomorph.LayoutKey}} props 
 */
export default function TriangleDev(props) {
  
  const [state, setState] = React.useState(() => ({
    minArea: { disabled: true, value: 4000/2 },
    minAngle: { disabled: true, value: 14 },
    /** @param {Event} e */
    onChangeMinArea: (e) => {
      const {value} = /** @type {HTMLInputElement} */ (e.target);
      setState(x => { x.minArea.value = Number(value); return { ...x }; });
    },
    /** @param {Event} e */
    onChangeMinAngle: (e) => {
      const {value} = /** @type {HTMLInputElement} */ (e.target);
      setState(x => { x.minAngle.value = Number(value); return { ...x }; });
    },
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
    const { vs: vsJson, tris: triIds } = /** @type {Geom.TriangulationJson} */ (await fetch('/api/dev/triangle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        polys: assertDefined(gmAux).navPoly.map(x => x.geoJson),
        minArea: state.minArea.disabled ? null : state.minArea.value,
        minAngle: state.minAngle.disabled ? null : state.minAngle.value,
      }),
    }).then(x => x.json()));

    const vs = vsJson.map(Vect.from);
    const tris = triIds.map(triple => /** @type {Triple<Geom.Vect>} */ (triple.map(id => vs[id])));
    return {
      tris,
    };
  }, { staleTime: Infinity, enabled: !!gmAux });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>

      {gmAux && <image {...gmAux.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />}

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
          <input
            type="range" id="min-area-range" min={10} max={4000} defaultValue={state.minArea.value}
            disabled={state.minArea.disabled}
            ref={(el) => el?.addEventListener('change', state.onChangeMinArea)}
          />
          <label htmlFor="min-area-range" onClick={() => setState(x => { x.minArea.disabled = !x.minArea.disabled; return { ...x }; })}>
            min area
          </label>
        </div>
        <div className="min-angle">
          <input
            type="range" id="min-angle-range" min={0} max={28} defaultValue={state.minAngle.value}
            disabled={state.minAngle.disabled}
            ref={(el) => el?.addEventListener('change', state.onChangeMinAngle)}
          />
          <label htmlFor="min-angle-range" onClick={() => setState(x => { x.minAngle.disabled = !x.minAngle.disabled; return { ...x }; })}>
            min angle
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
  div.min-angle {
    input[type="range"] { width: 80px; margin-right: 8px; }
  }
`;
