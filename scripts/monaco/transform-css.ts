import fs from 'fs';
import glob from 'glob';
import { splitStyles } from '@microsoft/load-themed-styles';

// Create a source file
function createEsm(css: string) {
  return [
    '/* tslint:disable */',
    'import { loadStyles } from \'@microsoft/load-themed-styles\';',
    `loadStyles(${JSON.stringify(splitStyles(css))});`,
  ].join('\n');
}


export function transformCssTask() {
  const cssFiles = glob.sync('esm/**/*.css', { cwd: __dirname, absolute: true });
  // console.log({ cssFiles });

  for (const cssFile of cssFiles) {
    const contents = createEsm(fs.readFileSync(cssFile, 'utf-8'));
    fs.writeFileSync(`${cssFile}.js`, contents);
    fs.unlinkSync(cssFile);
  }
}
