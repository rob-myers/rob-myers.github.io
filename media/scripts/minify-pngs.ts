/**
 * Examples:
 * - yarn minify-pngs media/geomorph-edge
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';
import { nanoid } from 'nanoid';

const [,, srcDir] = process.argv;

if (!srcDir || !fs.existsSync(srcDir)) {
  console.error(chalk.red(`error: usage: yarn minify-pngs {src_dir} where {src_dir} exists`));
  process.exit(1);
}

console.info(chalk.yellow(`Applying \`pngcrush\` to all pngs in ${srcDir}`));
const tempDir = path.join(`'${srcDir}'`, `temp_${nanoid()}`);

childProcess.execSync(`
  time find ${path.join(`'${srcDir}'`, '*.png')} -print0 |
    xargs -0 -n 1 -P 40 pngcrush -d ${tempDir}
  mv ${path.join(`'${tempDir}'`, '*.png')} ${srcDir} && rmdir ${tempDir}
`);
