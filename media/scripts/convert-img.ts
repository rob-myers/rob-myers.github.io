/**
 * Examples:
 * - yarn convert-img geomorph 'media/downloads/Geomorphs/100x50 Edge' media/geomorph/edge
 * - yarn convert-img symbol media/downloads/Symbols/Staterooms media/symbol/Staterooms
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { FileMeta, metaFromGeomorphFilename, metaFromSymbolFilename } from './service';

const [,, inputType, srcDir, dstDir] = process.argv;
const geomorphsFilenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;
const symbolsFilenameRegex = /^(.*) (\d+)([^\d]*) \[(\d+x\d+)\]\.png$/;

if (
  !srcDir
  || !dstDir
  || !fs.existsSync(srcDir)
  || (inputType !== 'geomorph' && inputType !== 'symbol')
) {
  console.error(chalk.red("error: usage: yarn convert-img {input_type} {src_folder} {dst_folder} where {input_type} in ['geomorph', 'symbol'] and {src_folder} exists"));
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcDir);
fs.mkdirSync(dstDir, { recursive: true });
const manifestPath = path.join(dstDir, 'manifest.json');

const filenameRegex = inputType === 'geomorph' ? geomorphsFilenameRegex : symbolsFilenameRegex;
const extraMeta = inputType === 'geomorph' ? metaFromGeomorphFilename : metaFromSymbolFilename;

const fileMetas = srcFilenames.flatMap<FileMeta>(filename => {
  const matched = filename.match(filenameRegex);
  if (!matched) {
    console.warn('Ignoring unexpected PNG filename format:', filename);
    return [];
  }
  return [extraMeta(matched)];
});
// console.log(fileMetas);

console.info(
  chalk.yellow('Creating'), manifestPath,
);
fs.writeFileSync(path.join(dstDir, 'manifest.json'), jsonStringifyPrettyCompact({
  parentFolder: path.basename(srcDir),
  fileMetas,
}));

console.info(
  chalk.yellow('Detecting'), 'ImageMagick command line',
);
const detectImageMagick = childProcess.execSync(`
  convert --version | grep ImageMagick >/dev/null
  echo $?
`);

if (detectImageMagick.toString().trim() !== '0') {
  console.error(chalk.red("error: please install ImageMagick e.g. `brew install imagemagick`"));
  process.exit(1);
}

// TODO consider renaming then applying ImageMagick batch conversion

for (const { srcName, dstName } of fileMetas) {
  const result = childProcess.execSync(`
    echo "${chalk.yellow('converting')} ${srcName} ${chalk.yellow('to')} ${dstName}"
    convert "${path.join(srcDir, srcName)}" -fuzz 1% -trim -colors 16 "${path.join(dstDir, dstName)}"
  `);
  console.log(result.toString().trim());
}
