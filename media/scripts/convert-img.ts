/**
 * Example: yarn convert-img 'media/downloads/Geomorphs/100x50 Edge' media/geomorph/edge
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { extractMetaFromFilename } from './service';

const [,, srcDir, dstDir] = process.argv;
const filenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;

if (!srcDir || !dstDir || !fs.existsSync(srcDir)) {
  console.error(chalk.red("error: usage: yarn convert-img {src_folder} {dst_folder} where {src_folder} exists"));
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcDir);
fs.mkdirSync(dstDir, { recursive: true });
const manifestPath = path.join(dstDir, 'manifest.json');

interface FileMeta {
  srcName: string;
  /** Numeric identifier from Starship Geomorphs 2.0 */
  id: number;
  /** Sometimes a range is given */
  ids: number[];
  /** Dimension in grid squares of Starship Geomorphs 2.0 */
  gridDim: [number, number];
  dstName: string;
  is: string[];
  has: string[];
}

const fileMetas = srcFilenames.flatMap<FileMeta>(filename => {
  const matched = filename.match(filenameRegex);
  if (!matched) {
    console.warn('Ignoring unexpected PNG filename format:', filename);
    return [];
  }

  const srcName = matched[0];
  const ids = matched[1].split(',').map(Number);
  const id = ids[0];
  const gridDim = matched[2].split('x').map(x => Number(x) / 5) as [number, number];
  const description = matched[3].concat(matched[4]);
  const { filePrefix, is, has } = extractMetaFromFilename(description);
  const dstName =`${id}--${filePrefix}--${gridDim[0]}x${gridDim[1]}.png`;

  return [{
    srcName,
    dstName,
    id,
    gridDim,
    is,
    has,
    ids,
  }];
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

for (const { srcName, dstName } of fileMetas) {
  const result = childProcess.execSync(`
    echo "${chalk.yellow('converting')} ${srcName} ${chalk.yellow('to')} ${dstName}"
    convert "${path.join(srcDir, srcName)}" -fuzz 1% -trim -colors 16 "${path.join(dstDir, dstName)}"
  `);
  console.log(result.toString().trim());
}
