/**
 * Usage: yarn svg-meta
 * > Parse svg symbols in /public/symbol,
 * > writing json files in same directory.
 */
import fs from 'fs';
import path from 'path';
import {
  parseStarshipSymbol,
  serializeSymbol,
} from '../../projects/geomorph/parse-symbol';
import stringify from 'json-stringify-pretty-compact';

const symbolsDir = path.resolve(__dirname, '../../public/symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));

for (const filename of svgFilenames) {
  const filepath = path.resolve(symbolsDir, filename);
  const contents = fs.readFileSync(filepath).toString();
  const parsed = parseStarshipSymbol(contents);
  const metaFilepath = path.resolve(symbolsDir, path.basename(filename) + '.json');
  fs.writeFileSync(metaFilepath, stringify(serializeSymbol(parsed)));
}
