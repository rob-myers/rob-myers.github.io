/**
 * - parse every svg symbol in /public/symbol
 * - write as a single json file /public/symbol/svg.json
 *
 * Usage: `yarn svg-meta`
 */
/// <reference path="./deps.d.ts"/>

/**
 * TODO
 * - ✅ detect which symbols have changed
 * - detect which layout defs reference those symbols
 * - run `await createLayout(def, symbolLookup, triangle)` appropriately
 */

import fs from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import { parseStarshipSymbol, serializeSymbol } from '../../projects/service/geomorph';

const publicDir = path.resolve(__dirname, '../../public');
const symbolsDir = path.resolve(publicDir, 'symbol');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));
const svgJsonFilename = path.resolve(symbolsDir, `svg.json`)
/** @type {Record<string, Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>>} */
const svgJsonLookup = {};

let prevSvgJsonLookup = /** @type {null | typeof svgJsonLookup} */ (null);
if (fs.existsSync(svgJsonFilename)) {
  prevSvgJsonLookup = JSON.parse(fs.readFileSync(svgJsonFilename).toString());
}

for (const filename of svgFilenames) {
  const symbolName = filename.slice(0, -'.svg'.length);
  const filepath = path.resolve(symbolsDir, filename);
  const contents = fs.readFileSync(filepath).toString();
  const lastModified = fs.statSync(filepath).mtimeMs;
  const parsed = serializeSymbol(parseStarshipSymbol(
    symbolName,
    contents,
    lastModified,
  ));
  svgJsonLookup[symbolName] = parsed;
}

const changedSymbols = Object.keys(svgJsonLookup).filter((symbolName) =>
  prevSvgJsonLookup?.[symbolName].lastModified !== svgJsonLookup[symbolName].lastModified
);

console.log({ changedSymbols });

fs.writeFileSync(svgJsonFilename, stringify(svgJsonLookup));
