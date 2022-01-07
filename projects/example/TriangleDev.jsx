import React from "react";
import { useQuery } from "react-query";
import { styled } from "goober";
import { assertDefined } from "../service/generic";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect, Vect } from '../geom';
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - CodeSandbox

/**
 * @param {{ layoutKey: Geomorph.LayoutKey}} props 
 */
export default function TriangleDev(props) {
  
  const [state, setState] = React.useState(() => ({
    maxArea: { disabled: true, value: 4000/2, min: 10, max: 4000 },
    minAngle: { disabled: true, value: 14, min: 0, max: 28 },
    maxSteiner: { disabled: true, value: 300, min: 0, max: 600 },
    /** @param {Event} e */
    onChangeMaxArea: (e) => {
      const {value} = /** @type {HTMLInputElement} */ (e.target);
      setState(x => { x.maxArea.value = Number(value); return { ...x }; });
    },
    /** @param {Event} e */
    onChangeMinAngle: (e) => {
      const {value} = /** @type {HTMLInputElement} */ (e.target);
      setState(x => { x.minAngle.value = Number(value); return { ...x }; });
    },
    /** @param {Event} e */
    onChangeMaxSteiner: (e) => {
      const {value} = /** @type {HTMLInputElement} */ (e.target);
      setState(x => { x.maxSteiner.value = Number(value); return { ...x }; });
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
        maxArea: state.maxArea.disabled ? null : state.maxArea.value,
        minAngle: state.minAngle.disabled ? null : state.minAngle.value,
        maxSteiner: state.maxSteiner.disabled ? null : state.maxSteiner.value,
      }),
    }).then(x => x.json()));

    const vs = vsJson.map(Vect.from);
    const tris = triIds.map(triple => /** @type {[Geom.Vect, Geom.Vect, Geom.Vect]} */ (triple.map(id => vs[id])));
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
        <div>
          #tri {triData?.tris.length}
        </div>
        <div className="max-area">
          <input
            type="range" id="max-area-range" min={state.maxArea.min} max={state.maxArea.max} defaultValue={state.maxArea.value}
            disabled={state.maxArea.disabled}
            ref={(el) => el?.addEventListener('change', state.onChangeMaxArea)}
            title={String(state.maxArea.value)}
          />
          <label htmlFor="max-area-range" onClick={() => setState(x => { x.maxArea.disabled = !x.maxArea.disabled; return { ...x }; })}>
            max area
          </label>
        </div>
        <div className="min-angle">
          <input
            type="range" id="min-angle-range" min={state.minAngle.min} max={state.minAngle.max} defaultValue={state.minAngle.value}
            disabled={state.minAngle.disabled}
            ref={(el) => el?.addEventListener('change', state.onChangeMinAngle)}
            title={String(state.minAngle.value)}
          />
          <label htmlFor="min-angle-range" onClick={() => setState(x => { x.minAngle.disabled = !x.minAngle.disabled; return { ...x }; })}>
            min angle
          </label>
        </div>
        <div className="max-steiner">
          <input
            type="range" id="max-steiner" min={state.maxSteiner.min} max={state.maxSteiner.max} defaultValue={state.maxSteiner.value}
            disabled={state.maxSteiner.disabled}
            ref={(el) => el?.addEventListener('change', state.onChangeMaxSteiner)}
            title={String(state.maxSteiner.value)}
          />
          <label htmlFor="max-steiner" onClick={() => setState(x => { x.maxSteiner.disabled = !x.maxSteiner.disabled; return { ...x }; })}>
            max steiner
          </label>
        </div>
      </ForeignObject>

    </PanZoom>
  );
}

const uiHeightPx = 170;

const initViewBox = new Rect(0, -uiHeightPx, 600, 600);

const ForeignObject = styled('foreignObject')`
  background: #eee;
  border: 1px solid #aaa;
  font-size: 1rem;
  padding: 8px;
  width: 220px;
  height: ${uiHeightPx}px;
  x: -6px;
  y: -${uiHeightPx + 6}px;

  div { display: flex; }
  label { cursor: pointer; user-select: none; }
  input[type="range"] { width: 80px; margin-right: 8px; }
`;