/**
 * Rename and trim PNGs originally from Starship Geomorphs 2.0
 *
 * Examples:
 * - yarn trim-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
 * - yarn trim-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
 * - yarn trim-pngs symbol media/Symbols/Bridge media/symbol-bridge
 * - yarn trim-pngs symbol media/Symbols/'Dock, Small Craft' media/symbol-dock-small-craft
 * - yarn trim-pngs root media/Symbols media/symbol-root
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { 
  FileMeta,
  metaFromGeomorphFilename,
  metaFromSymbolFilename,
  error,
  info,
  metaFromRootFilename,
  warn,
} from './service';
import { nanoid } from 'nanoid';

const [,, inputType, srcDir, dstDir] = process.argv;
const rootFilenameRegex = /^(\d+x\d+)(.*)\.png$/;
const geomorphsFilenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;
const symbolsFilenameRegex = /^(.*) (\d+)([a-z])? \[(\d+x\d+)\](.*)\.png$/;

if (
  !(inputType === 'root' || inputType === 'geomorph' || inputType == 'symbol')
  || !srcDir
  || !dstDir
  || !fs.existsSync(srcDir)
) {
  error(`error: usage: yarn trim-pngs {input_type} {src_dir} {dst_dir} where:
  - {input_type} in ['root ,'geomorph', 'symbol']
  - {src_dir} exists`
  );
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

const filenameRegex = {
  'root': rootFilenameRegex,
  'geomorph': geomorphsFilenameRegex,
  'symbol': symbolsFilenameRegex,
}[inputType];
const extractMeta = {
  'root': metaFromRootFilename,
  'geomorph': metaFromGeomorphFilename,
  'symbol': metaFromSymbolFilename,
}[inputType];

info('creating manifest', manifestPath);
const fileMetas = srcFilenames.flatMap<FileMeta>(filename => {
  const matched = filename.match(filenameRegex);
  return matched ? [extractMeta(matched)]
    : (filename.match(/\.png$/) && warn('ignoring PNG with unexpected filename format:', filename), []);
});
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
