/**
 * curl -XPOST -H 'content-type: application/json' localhost:3002/api/dev/triangle -d '{ "polys": [] }' 
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import { geomorphJsonPath } from 'projects/geomorph/geomorph.model';
import { Poly } from 'projects/geom/poly';
import { triangle } from 'projects/service/triangle';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    if ((req.body.polys?.[0] as Geom.GeoJsonPolygon)?.coordinates[0].length >= 3) {
      const polys = (req.body.polys as Geom.GeoJsonPolygon[]).map(Poly.from);
      const decomp = await triangle.triangulate(polys, {
        maxArea: req.body.maxArea || false,
        minAngle: req.body.minAngle || false,
        maxSteiner: req.body.maxSteiner == null ? undefined : req.body.maxSteiner,
      });
      res.json(decomp);
    } else {
      res.status(500).json({ error: `invalid input` });
    }
  } else if (req.method === 'GET')  {// Demo
    const json = JSON.parse(
      fs.readFileSync('public' + geomorphJsonPath('g-301--bridge')).toString()
    ) as Geomorph.LayoutJson;
    const polys = json.navPoly.map(x => Poly.from(x));
    const decomp =  await triangle.triangulate(polys);
    res.json(decomp);
  }
}
