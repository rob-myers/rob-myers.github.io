/**
 * Usage: yarn svg-meta
 * > Parse svg symbols in /public/symbol,
 * > writing json files in same directory,
 * > and a single json file /public/symbol/svg.json
 */
import fs from 'fs';
import stringify from 'json-stringify-pretty-compact';
import path from 'path';
import type { GeoJsonPolygon } from 'projects/geom/types';
import type { ParsedSymbol } from 'projects/geomorph/types';
import {
  parseStarshipSymbol,
  serializeSymbol,
} from '../../projects/geomorph/parse-symbol';

const symbolsDir = path.resolve(__dirname, '../../public/symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));
const svgJsonLookup = {} as Record<string, ParsedSymbol<GeoJsonPolygon>>;

for (const filename of svgFilenames) {
  const symbolName = filename.slice(0, -'.svg'.length);
  const filepath = path.resolve(symbolsDir, filename);
  const contents = fs.readFileSync(filepath).toString();
  const parsed = serializeSymbol(parseStarshipSymbol(symbolName, contents));
  const metaFilepath = path.resolve(symbolsDir, path.basename(filename) + '.json');
  fs.writeFileSync(metaFilepath, stringify(parsed));
  svgJsonLookup[symbolName] = parsed;
}

fs.writeFileSync(
  path.resolve(symbolsDir, 'svg.json'),
  stringify(svgJsonLookup),
);
