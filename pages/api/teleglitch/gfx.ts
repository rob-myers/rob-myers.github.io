import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { rootPath } from '../index';

const dirPath = path.resolve(rootPath, 'scripts/teleglitch/gfx');

/** `/api/teleglitch/gfx?set1.png` returns file set1.png */
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const filename = Object.keys(req.query)[0];
  const filenames = (await fs.readdir(dirPath)).filter(x => x.endsWith('.png'));

  if (filenames.includes(filename)) {
    const data = await fs.readFile(path.resolve(dirPath, filename));
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(data);
  } else {
    res.status(404).json({ error: `Failed to find png '${filename}' in '${dirPath}'` });
  }
}
