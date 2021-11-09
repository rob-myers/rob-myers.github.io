/**
 * Parse svg symbols in /public/symbol, writing
 * a single json file /public/symbol/svg.json
 *
 * Usage: `yarn svg-meta`
 */
/// <reference path="./deps.d.ts"/>

import fs from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import { parseStarshipSymbol, serializeSymbol } from '../../projects/service/geomorph';

const publicDir = path.resolve(__dirname, '../../public');
const symbolsDir = path.resolve(publicDir, 'symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));
/** @type {Record<string, Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>>} */
const svgJsonLookup = {};

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
