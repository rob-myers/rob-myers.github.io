import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly } from '../geom/poly';
import { ai } from "../service/ai";
import { recast } from "../service/recast";


export default function Recast() {
  
  useQuery('recast-demo', async () => {
    const navKey = 'test-nav-key';

    /** @type {Geomorph.GeomorphJson} */
    const json = await fetch(geomorphJsonPath('g-301--bridge')).then(x => x.json());
    const navPoly = json.navPoly.map(x => Poly.from(x));

    await ai.createNavMesh(navKey, navPoly, {  cs: 1, walkableRadius: 2, maxSimplificationError: 50 });
    const { tris, vs } = recast.getDebugTriangulation(navKey);
    console.log({
      /**
       * TODO
       * - draw them over top of geomorph
       * - experiment with params
       */
      tris, vs,
    })

  }, {
    staleTime: Infinity,
  });

  return null;
}