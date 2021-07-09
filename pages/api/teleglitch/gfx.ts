import fs from 'fs';
import path from 'path';
import { rootPath } from '../index';
import type { NextApiRequest, NextApiResponse } from 'next'

const dirPath = path.resolve(rootPath, 'scripts/teleglitch/gfx');

export default (req: NextApiRequest, res: NextApiResponse) => {
  const filename = Object.keys(req.query)[0];
  const contents = fs.readdirSync(dirPath);

  if (contents.includes(filename)) {
    const data = fs.readFileSync(path.resolve(dirPath, filename));
    res.writeHead(200, {'Content-Type': 'image/png'}); // TODO always png?
    res.end(data); // Send the file data to the browser
  } else {
    res.status(500).json({ error: `Failed to find file '${filename}' in '${dirPath}'` });
  }
}
