import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { rootPath } from '../index';

const dirPath = path.resolve(rootPath, 'scripts/teleglitch/gfx');

/** e.g. `/api/teleglitch/gfx?set1.png` returns file set1.png */
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const filename = Object.keys(req.query)[0];
  const filenames = (await fs.readdir(dirPath));

  if (filenames.includes(filename)) {
    const data = await fs.readFile(path.resolve(dirPath, filename));
    const ext = filename.split('.').pop()!;
    res.writeHead(200, {'Content-Type': `image/${ext}`});
    res.end(data);
  } else {
    res.status(404).json({ error: `Failed to find png '${filename}' in '${dirPath}'` });
  }
}
