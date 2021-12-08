import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import { geomorphJsonPath } from 'projects/geomorph/geomorph.model';
import { Poly } from 'projects/geom/poly';
import { triangle } from 'projects/service/triangle';

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const json = JSON.parse(fs.readFileSync('public' + geomorphJsonPath('g-301--bridge')).toString()) as Geomorph.GeomorphJson;
  const navPoly = json.navPoly.map(x => Poly.from(x));
  const decomp =  await triangle.triangulate(navPoly);
  res.json(decomp);
}
