/**
 * Examples:
 * - yarn minify-pngs media/geomorph-edge
 * - yarn minify-pngs media/symbol-staterooms
 * - yarn minify-pngs media/symbol-bridge
 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import childProcess from 'child_process';

const [,, srcDir] = process.argv;
if (!srcDir || !fs.existsSync(srcDir)) {
  console.error(chalk.red(`error: usage: yarn minify-pngs {src_dir} where {src_dir} exists`));
  process.exit(1);
}

console.info(chalk.yellow('detecting'), 'optipng command');
if (childProcess.execSync(`optipng --version | grep OptiPNG  >/dev/null && echo $?`).toString().trim() !== '0') {
  console.error(chalk.red("error: please install optipng e.g. `brew install optipng`"));
  process.exit(1);
}

console.info(chalk.yellow(`Applying \`optipng\` to all pngs in ${srcDir}`));
childProcess.execSync(`
  time find ${path.join(`'${srcDir}'`, '*.png')} -print0 |
    xargs -0 -n 1 -P 20 optipng
`);
