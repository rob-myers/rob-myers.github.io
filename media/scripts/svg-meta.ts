/**
 * Usage: yarn svg-meta
 * > Parse svg symbols in /public/symbol,
 * > writing json files in same directory.
 */
import fs from 'fs';
import path from 'path';
import { parseStarshipSymbol } from '../../projects/geomorph/parse-symbol';

const symbolsDir = path.resolve(__dirname, '../../public/symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));

for (const filename of svgFilenames) {
  const filepath = path.resolve(symbolsDir, filename);
  const contents = fs.readFileSync(filepath).toString();
  const parsed = parseStarshipSymbol(contents);
  const metaFilepath = path.resolve(symbolsDir, path.basename(filename) + '.json');
  fs.writeFileSync(metaFilepath, JSON.stringify(parsed));
}
