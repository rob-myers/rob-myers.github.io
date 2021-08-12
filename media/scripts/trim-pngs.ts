/**
 * Rename and trim PNGs originally from Starship Geomorphs 2.0
 * Examples:
 * - yarn trim-pngs geomorph 'media/Geomorphs/100x50 Edge' media/geomorph-edge
 * - yarn trim-pngs symbol media/Symbols/Staterooms media/symbol-staterooms
 * - yarn trim-pngs symbol media/Symbols/Bridge media/symbol-bridge
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { FileMeta, metaFromGeomorphFilename, metaFromSymbolFilename } from './service';
import { nanoid } from 'nanoid';

const [,, inputType, srcDir, dstDir] = process.argv;
const geomorphsFilenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;
const symbolsFilenameRegex = /^(.*) (\d+)([^\d]*) \[(\d+x\d+)\]\.png$/;

if (
  !(inputType === 'geomorph' || inputType == 'symbol')
  || !srcDir
  || !dstDir
  || !fs.existsSync(srcDir)
) {
  error(`error: usage: yarn trim-pngs {input_type} {src_dir} {dst_dir} where:
  - {input_type} in ['geomorph', 'symbol']
  - {src_dir} exists`
  );
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcDir);
fs.mkdirSync(dstDir, { recursive: true });
const manifestPath = path.join(dstDir, 'manifest.json');
const filenameRegex = inputType === 'geomorph' ? geomorphsFilenameRegex : symbolsFilenameRegex;
const extractMeta = inputType === 'geomorph' ? metaFromGeomorphFilename : metaFromSymbolFilename;

const fileMetas = srcFilenames.flatMap<FileMeta>(filename => {
  const matched = filename.match(filenameRegex);
  return matched
    ? [extractMeta(matched)]
    : (info('Ignoring file with unexpected PNG filename format:', filename), []);
});

info('creating manifest', manifestPath);
fs.writeFileSync(path.join(dstDir, 'manifest.json'), jsonStringifyPrettyCompact({
  parentFolder: path.basename(srcDir),
  fileMetas,
}));

info('detectings ImageMagick command \`convert\`');
if (childProcess.execSync(`convert --version | grep ImageMagick >/dev/null && echo $?`).toString().trim() !== '0') {
  error("error: please install ImageMagick e.g. `brew install imagemagick`");
  process.exit(1);
}

console.log(childProcess.execSync(fileMetas.map(({ srcName, dstName }) => `
  echo "${chalk.yellow('copying')} ${srcName} ${chalk.yellow('to')} ${dstName}"
  cp "${path.join(srcDir, srcName)}" "${path.join(dstDir, dstName)}"
`).join('')).toString());

info(`applying ImageMagick \`convert\`s in parallel`);
const tempDir = `temp_${nanoid()}`;
childProcess.execSync(`
  mkdir ${path.join(dstDir, tempDir)}
  cd '${dstDir}'
  time find *.png -print0 |
    xargs -0 -I £ -P 40 convert -fuzz 1% -trim -colors 32 £ ./${tempDir}/£
  mv ${tempDir}/*.png .
  rmdir ${tempDir}
`);

function error(...args: string[]) {
  console.error(chalk.red(...args));
}
function info(...args: string[]) {
  console.info(chalk.yellow(...args));
}
