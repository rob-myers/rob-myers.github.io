import path from 'path';
import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { rootPath } from '../index';

const dirPath = path.resolve(rootPath, 'scripts/teleglitch/mods');

/** Returns list of all module jsons */
export default async function (_req: NextApiRequest, res: NextApiResponse) {
  const filenames = (await fs.readdir(dirPath)).filter(x => x.endsWith('.json'));
  const jsons = await Promise.all(filenames.map(x =>
    fs.readFile(path.resolve(dirPath, x)).then(x => x.toString())),
  );
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(`[${jsons.join(',')}]`);
}
