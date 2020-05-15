import path from 'path';
import { execSync } from 'child_process';

const monacoEditorPath = path.dirname(require.resolve('monaco-editor/package.json'));
const monacoSrcPath = path.join(monacoEditorPath, 'esm').replace(/'/g, '');
const monacoDstPath = path.join(__dirname, 'esm').replace(/'/g, '');

// Copy files from monaco-editor
execSync(`rm -r '${monacoDstPath}' || true`);
execSync(`cp -r '${monacoSrcPath}' '${monacoDstPath}'`);

// Transform .CSS
import { transformCssTask } from './transform-css';
transformCssTask();

// Transform .D.TS
import { transformDtsTask } from './transform-dts';
transformDtsTask();
