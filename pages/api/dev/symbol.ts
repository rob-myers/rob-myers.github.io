import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next'
import { repoRootDir } from 'pages/api';
import { parseStarshipSymbol, serializeSymbol } from 'projects/geomorph/parse-symbol';

const symbolsDir = path.resolve(repoRootDir, 'public/svg');

/**
 * Parse a Starship Symbol SVG, e.g.
 * - curl 'localhost:3002/api/dev/symbol?name=stateroom--014--2x2'
 * - curl 'localhost:3002/api/dev/symbol?name=office--001--2x2&tags=\["door-s"\]'
 * - curl 'localhost:3002/api/dev/symbol?name=office--001--2x2&debug'
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const symbolName = req.query.name as string;
    const tags = req.query.tags ? JSON.parse(req.query.tags as string) as string[] : undefined;
    const debug = 'debug' in req.query;
    if (!symbolName) {
      throw Error(`param "name" required e.g. /api/dev/symbol?name=my-symbol-name\n`);
    }

    const filepath = path.resolve(symbolsDir, symbolName + '.svg');
    if (!fs.existsSync(filepath)) {
      throw Error(`404: file "${filepath}" not found\n`);
    }

    const svgContents = fs.readFileSync(filepath).toString();
    const result = parseStarshipSymbol(svgContents, debug);
    res.json(serializeSymbol(result));

  } catch (e) {
    res.status(`${e}`.startsWith('404:') ? 404 : 500).json(`${e}`);
  }
}
