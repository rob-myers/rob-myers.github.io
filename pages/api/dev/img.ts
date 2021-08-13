import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next'
import { repoRootDir } from 'pages/api';

const symbolsDir = path.resolve(repoRootDir, 'media/edited-symbols');

/**
 * Example
 * - curl localhost:3002/api/dev/img?name=stateroom--037--2x4.png
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const filename = req.query.name as string;
    if (!filename) {
      throw Error(`expected syntax /api/dev/img?name=foo.png\n`);
    }
    const filepath = path.resolve(symbolsDir, filename);
    if (!filename.endsWith('.png') || !fs.existsSync(filepath)) {
      throw Error(`404: file "${filepath}" not found\n`);
    }
    res.writeHead(200, { 'content-type': 'image/png' });
    res.end(fs.readFileSync(filepath), 'binary');
  } catch (e) {
    res.status(`${e}`.startsWith('404:') ? 404 : 500).json(`${e}`);
  }
}
