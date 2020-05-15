import fs from 'fs';
import os from 'os';
import path from 'path';
import glob from 'glob';

export function transformDtsTask() {
  const dtsFiles = glob.sync('esm/**/*.d.ts', { cwd: __dirname, absolute: true });
  // console.log({ dtsFiles });

  for (const dtsFile of dtsFiles) {
    let content = fs.readFileSync(dtsFile, 'utf-8');
    // Remove readonly parameters (added in TS 3.4)
    content = content.replace(/: readonly /gm, ': ');

    const dtsDirname = path.dirname(dtsFile).replace(/\\/g, '/');
    if (dtsDirname.endsWith('/language/typescript') && content.includes(' monaco.')) {
      // Add imports for ambient monaco references in typescript language contribution
      content = `import * as monaco from '../../editor/editor.api';${os.EOL}${content}`;
    }

    fs.writeFileSync(dtsFile, content);
  }
}
