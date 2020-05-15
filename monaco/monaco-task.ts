import path from 'path';
import fs from 'fs';

const monacoEditorPath = path.dirname(require.resolve('monaco-editor/package.json'));
const monacoSrcPath = path.join(monacoEditorPath, 'esm');
const monacoDestPath = path.join(__dirname, 'esm');

fs.copyFileSync(monacoSrcPath, monacoDestPath);

// TODO css to js