/**
 * Usage: yarn svg-meta
 * > Parse svg symbols in /public/symbol, writing
 * > a single json file /public/symbol/svg.json
 */
/// <reference path="../../projects/geom/types.d.ts"/>
/// <reference path="../../projects/geomorph/types.d.ts"/>

import fs from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import { parseStarshipSymbol, serializeSymbol } from '../../projects/geomorph/service';

const publicDir = path.resolve(__dirname, '../../public');
const symbolsDir = path.resolve(publicDir, 'symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));
const svgJsonLookup = {} as Record<string, Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>>;

for (const filename of svgFilenames) {
  const symbolName = filename.slice(0, -'.svg'.length);
  const filepath = path.resolve(symbolsDir, filename);
  const contents = fs.readFileSync(filepath).toString();
  const parsed = serializeSymbol(parseStarshipSymbol(symbolName, contents));
  // const metaFilepath = path.resolve(symbolsDir, path.basename(filename) + '.json');
  // fs.writeFileSync(metaFilepath, stringify(parsed));
  svgJsonLookup[symbolName] = parsed;
}

fs.writeFileSync(path.resolve(symbolsDir, 'svg.json'), stringify(svgJsonLookup));
