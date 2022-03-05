/**
 * - Parse every svg symbol in /public/symbol
 * - Write as a single json file /public/symbol/svg.json
 * - Update any changed /geomorph/{geomorph}.json
 *
 * Usage:
 * - `yarn svg-meta`
 * - `yarn svg-meta --all`
 */
/// <reference path="./deps.d.ts"/>

import fs from 'fs';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';
import getOpts from 'getopts';
import asyncPool from 'tiny-async-pool';
import chalk from 'chalk';

import { keys } from '../../model/generic.model';
import { createLayout, deserializeSvgJson, parseStarshipSymbol, serializeLayout, serializeSymbol } from '../../projects/service/geomorph';
import layoutDefs from '../../projects/geomorph/layouts';
import { triangle } from '../../projects/service/triangle';

const publicDir = path.resolve(__dirname, '../../public');
const symbolsDir = path.resolve(publicDir, 'symbol');
const geomorphsDir = path.resolve(publicDir, 'geomorph');
const svgFilenames = fs.readdirSync(symbolsDir).filter(x => x.endsWith('.svg'));
const svgJsonFilename = path.resolve(symbolsDir, `svg.json`)

const opts = getOpts(process.argv);
const [updateAllGeomorphJsons] = [opts.all];

const svgJsonLookup = /** @type {Record<Geomorph.SymbolKey, Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>>} */ ({});
let prevSvgJsonLookup = /** @type {null | typeof svgJsonLookup} */ (null);
if (fs.existsSync(svgJsonFilename)) {
  prevSvgJsonLookup = JSON.parse(fs.readFileSync(svgJsonFilename).toString());
}

for (const filename of svgFilenames) {
  const symbolName = /** @type {Geomorph.SymbolKey} */ (filename.slice(0, -'.svg'.length));
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

const changedSymbols = keys(svgJsonLookup).filter((symbolName) =>
  prevSvgJsonLookup?.[symbolName].lastModified !== svgJsonLookup[symbolName].lastModified
);
const changedLayoutDefs = Object.values(layoutDefs).filter(def => {
  const usedSymbols = def.items.map(x => x.symbol);
  return changedSymbols.some(symbolName => usedSymbols.includes(symbolName));
});
console.log({ changedSymbols, changedLayoutDefs });

(async function writeChangedGeomorphJsons () {
  const symbolLookup = deserializeSvgJson(svgJsonLookup);
  const layoutDefsToUpdate = updateAllGeomorphJsons ? Object.values(layoutDefs) : changedLayoutDefs;
  
  await asyncPool(
    1, // One at a time aids debugging
    layoutDefsToUpdate.map(def => {
      return async () => {
        console.log(chalk.blue('creating layout'), chalk.yellow(def.key), '...');
        const layout = await createLayout(def, symbolLookup, triangle);
        const filename = path.resolve(geomorphsDir, `${def.key}.json`);
        console.log(chalk.blue('writing'), chalk.yellow(filename), '...');
        fs.writeFileSync(filename, stringify(serializeLayout(layout)));
      };
    }),
    action => action(),
  );

})();

// Finally, write svg.json
fs.writeFileSync(svgJsonFilename, stringify(svgJsonLookup));
