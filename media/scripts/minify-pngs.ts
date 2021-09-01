/**
 * yarn minify-pngs {src_dir}
 * - {src_dir} is relative to repo root
 * - {src_dir} exists
 *
 * Examples:
 * - yarn minify-pngs public/png
 * - yarn minify-pngs media/geomorph-edge
 * - yarn minify-pngs media/used-symbols
 */
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import { error, info } from './service';

const [,, srcDir] = process.argv;
if (!srcDir || !fs.existsSync(srcDir)) {
  error(`error: usage: yarn minify-pngs {src_dir} where
    - {src_dir} is relative to repo root
    - {src_dir} exists
  `);
  process.exit(1);
}
if (childProcess.execSync(`optipng --version | grep OptiPNG  >/dev/null && echo $?`).toString().trim() !== '0') {
  error("error: please install optipng e.g. `brew install optipng`");
  process.exit(1);
}

info(`applying parallel \`optipng\` to directory ${srcDir}`);
childProcess.execSync(`
  time find ${path.join(`'${srcDir}'`, '*.png')} -print0 |
    xargs -0 -n 1 -P 20 optipng
`);
