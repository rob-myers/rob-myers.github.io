import { useQuery } from "react-query";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect, Vect } from '../geom';
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";

// TODO
// - try triangle-wasm on nodejs ✅
// - get triangle-wasm working in DEV browser ✅
// - fix triangulation errors ✅
// - remove recast service etc

/**
 * @param {{ layoutKey: Geomorph.LayoutKey}} props 
 */
export default function TriangleDev(props) {
  
  const { data } = useQuery(`triangle-dev-${props.layoutKey}`, async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath(props.layoutKey)).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x)).slice(0, 1);

    const { vs: vsJson, tris: triIds } = /** @type {Geom.TriangulationJson} */ (await fetch('/api/dev/triangle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polys: navPoly.map(x => x.geoJson) }),
    }).then(x => x.json()));

    const vs = vsJson.map(Vect.from);
    const tris = triIds.map(triple => /** @type {Triple<Geom.Vect>} */ (triple.map(id => vs[id])));

    return {
      pngRect: json.pngRect,
      tris,
    };
  }, {
    // staleTime: Infinity,
  });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>

      {data && <>
        <image {...data.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />

        {data.tris.map((points) =>
          <polygon
            stroke="red"
            fill="none"
            strokeWidth={1}
            className="navtri"
            points={`${points}`}
          />
        )}
      </>}

    </PanZoom>
  );
}

const initViewBox = new Rect(200, 0, 600, 600);
