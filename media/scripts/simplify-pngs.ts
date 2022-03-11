/**
 * Trim and minify PNGs in directory
 * yarn simplify-pngs {src_dir}
 * - {src_dir} is relative to repo root
 * - {src_dir} exists
 * 
 * Examples
 * - yarn simplify-pngs media/unsorted
 * - yarn simplify-pngs public/png
 * - yarn simplify-pngs public/symbol
 */

import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import { nanoid } from 'nanoid';
import { error, info } from './service';

const [,, srcDir] = process.argv;

if (!srcDir || !fs.existsSync(srcDir)) {
  error(`error: usage: yarn simplify-pngs {src_dir} where
  - {src_dir} is relative to repo root
  - {src_dir} exists
  `);
  process.exit(1);
}

info(`applying parallel \`convert\` to directory ${srcDir}`);
const tempDir = `temp_${nanoid()}`;
childProcess.execSync(`
  cd '${srcDir}' && mkdir ${tempDir}
  time find *.png -print0 |
    xargs -0 -I £ -P 40 convert -fuzz 1% -trim -colors 32 £ ./${tempDir}/£
  mv ${tempDir}/*.png . && rmdir ${tempDir}
`);


info(`applying parallel \`optipng\` to directory ${srcDir}`);
childProcess.execSync(`
  time find ${path.join(`'${srcDir}'`, '*.png')} -print0 |
    xargs -0 -n 1 -P 20 optipng
`);
