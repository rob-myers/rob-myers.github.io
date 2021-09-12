/**
 * Rename and trim PNGs originally from Starship Geomorphs 2.0.
 * 
 * yarn rename-pngs {input_type} {src_dir} {dst_dir}
 * - {input_type} in ['root', 'geomorph', 'symbol']
 * - {src_dir} and {dst_dir} are relative to repo root
 * - {src_dir} exists
 *
 * Examples:
 * - yarn rename-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
 * - yarn rename-pngs root media/Symbols media/symbol-root
 * - yarn rename-pngs symbol media/Symbols/Bridge media/symbol-bridge
 * - yarn rename-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
 * - yarn rename-pngs symbol media/Symbols/Offices media/symbol-offices
 * - yarn rename-pngs symbol media/Symbols/Misc media/symbol-misc
 * - yarn rename-pngs symbol 'media/Symbols/Furniture, Consoles, & Equipment' media/symbol-furniture-consoles-equipment
 * 
 * - yarn rename-pngs symbol media/Symbols/Lounge media/symbol-lounge
 * - yarn rename-pngs symbol media/Symbols/'Dock, Small Craft' media/symbol-dock-small-craft
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { nanoid } from 'nanoid';

import { 
  FileMeta,
  metaFromRootFilename,
  metaFromGeomorphFilename,
  metaFromSymbolFilename,
  metaFromAltSymbolFilename,
  rootFilenameRegex,
  geomorphsFilenameRegex,
  symbolsFilenameRegex,
  altSymbolsFilenameRegex,
  error,
  info,
  warn,
} from './service';

const [,, inputType, srcDir, dstDir] = process.argv;

if (
  !(inputType === 'root' || inputType === 'geomorph' || inputType == 'symbol')
  || !srcDir
  || !dstDir
  || !fs.existsSync(srcDir)
) {
  error(`error: usage: yarn rename-pngs {input_type} {src_dir} {dst_dir} where:
  - {input_type} in ['root', 'geomorph', 'symbol']
  - {src_dir} and {dst_dir} are relative to repo root
  - {src_dir} exists
  `);
  process.exit(1);
}

if (childProcess.execSync(
  'convert --version | grep ImageMagick >/dev/null && echo $?'
).toString().trim() !== '0') {
  error("error: please install ImageMagick e.g. `brew install imagemagick`");
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcDir);
fs.mkdirSync(dstDir, { recursive: true });
const manifestPath = path.join(dstDir, 'manifest.json');
const fileMetas = [] as FileMeta[];

info('creating manifest', manifestPath);

switch (inputType) {
  case 'root':
    srcFilenames.forEach(filename => {
      const matched = filename.match(rootFilenameRegex);
      if (matched) fileMetas.push(metaFromRootFilename(matched))
      else if (filename.match(/\.png$/)) warn('ignoring PNG:', filename);
    });
    break;
  case 'geomorph':
    srcFilenames.forEach(filename => {
      const matched = filename.match(geomorphsFilenameRegex);
      if (matched) fileMetas.push(metaFromGeomorphFilename(matched))
      else if (filename.match(/\.png$/)) warn('ignoring PNG:', filename);
    });
    break;
  case 'symbol':
    srcFilenames.forEach(filename => {
      let matched = filename.match(symbolsFilenameRegex);
      if (matched) fileMetas.push(metaFromSymbolFilename(matched))
      else {
        matched = filename.match(altSymbolsFilenameRegex);
        if (matched) fileMetas.push(metaFromAltSymbolFilename(matched))
        else if (filename.match(/\.png$/)) warn('ignoring PNG:', filename);
      }
    });
    break;
}

fs.writeFileSync(path.join(dstDir, 'manifest.json'), jsonStringifyPrettyCompact({
  parentFolder: path.basename(srcDir),
  sourceType: inputType,
  fileMetas,
}));

if (!fileMetas.length) {
  info('no files found');
  process.exit(0);
}

console.log(childProcess.execSync(fileMetas.map(({ srcName, dstName }) => `
  echo "${chalk.yellow('copying')} ${srcName} ${chalk.yellow('to')} ${dstName}"
  cp "${path.join(srcDir, srcName)}" "${path.join(dstDir, dstName)}"
`).join('')).toString());

info(`applying ImageMagick command \`convert\` in parallel`);
const tempDir = `temp_${nanoid()}`;

childProcess.execSync(`
  mkdir ${path.join(dstDir, tempDir)}
  cd '${dstDir}'
  time find *.png -print0 |
    xargs -0 -I £ -P 40 convert -fuzz 1% -trim -colors 32 £ ./${tempDir}/£
  mv ${tempDir}/*.png .
  rmdir ${tempDir}
`);
