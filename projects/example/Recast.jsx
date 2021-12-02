import { useQuery } from "react-query";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from '../geom';
import * as defaults from "./defaults";
import { geom } from "../service/geom";
import { recast } from "../service/recast";
import PanZoom from "../panzoom/PanZoom";

export default function Recast() {
  
  const { data } = useQuery('recast-demo', async () => {
    const navKey = 'test-nav-key';

    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));

    await recast.create(navKey, navPoly, {  cs: 1, walkableRadius: 0, maxSimplificationError: 0 });
    const decomp = recast.getDebugTriangulation(navKey);
    const recastTris = geom.triangulationToPolys(decomp);

    return {
      pngRect: json.pngRect,
      recastTris,
    };
  }, {
    staleTime: Infinity,
  });

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>

      {data && <>
        <image {...data.pngRect} className="geomorph" href={geomorphPngPath('g-301--bridge')} />

        {data.recastTris.map(({ outline }) =>
          <polygon
            stroke="red"
            fill="none"
            strokeWidth={1}
            className="navtri"
            points={`${outline}`}
          />
        )}
      </>}

    </PanZoom>
  );
}

const initViewBox = new Rect(200, 0, 600, 600);
