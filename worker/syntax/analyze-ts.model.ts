import { Project, ts, JsxText } from 'ts-morph';
import { JsImportMeta, JsExportMeta, ModuleSpecifierMeta } from '@model/code/patch-js-imports';

/**
 * Analyze imports/exports of ts/tsx file.
 */
export function analyzeTsImportsExports(filename: string, code: string) {
  const project = new Project({ compilerOptions: {} });
  const srcFile = project.createSourceFile(filename, code);

  const importItems = [] as JsImportMeta[];
  const exportItems = [] as JsExportMeta[];

  const importDecs = srcFile.getImportDeclarations();
  const exportDecs = srcFile.getExportDeclarations();
  const exportAssigns = srcFile.getExportAssignments();
  const exportSymbols = srcFile.getExportSymbols();

  // e.g. export const foo = 'bar';
  exportSymbols.forEach((item) => {
    exportItems.push({
      type: 'export-symb',
      names: [{
        name: item.getName(), // alias always undefined
        alias: item.getAliasedSymbol()?.getName(),
      }],
    });
  });

  importDecs.forEach((item) => {
    const moduleSpecifier = item.getModuleSpecifier();
    const { line, column } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());

    importItems.push({
      type: 'import-decl',
      /** Module specifier e.g. `./index` */
      path: {
        value: moduleSpecifier.getLiteralValue(),
        start: moduleSpecifier.getPos() + 2,
        startLine: line,
        startCol: column,
      },
      names: item.getNamedImports().map(x => ({
        name: x.getName(),
        alias: x.getAliasNode()?.getText(),
      })),
      namespace: item.getNamespaceImport()?.getText(),
    });
  });

  exportDecs.forEach((item) => {
    // export { foo } from './other-module'
    let from = undefined as undefined | ModuleSpecifierMeta;
    if (item.hasModuleSpecifier()) {
      const moduleSpecifier = item.getModuleSpecifier()!;
      const { line, column } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());
      from = {
        value: moduleSpecifier.getLiteralValue(),
        start: moduleSpecifier.getPos() + 2,
        startLine: line,
        startCol: column,
      };
    }

    exportItems.push({
      type: 'export-decl',
      names: item.getNamedExports().map((x) => ({
        name: x.getName(),
        alias: x.getAliasNode()?.getText(),
      })),
      namespace: item.getNamespaceExport()?.getName(),
      from,
    });
  });

  exportAssigns.forEach((item) => {
    exportItems.push({
      type: 'export-asgn',
      names: [{
        name: item.isExportEquals()
          ? item.getFirstChild()?.getText()!
          : 'default',
      }],
    });
  });

  return {
    exports: exportItems,
    imports: importItems,
  };
}

export function toggleTsxComment(
  code: string,
  startLineStartPos: number,
  endLineEndPos: number,
): ToggleTsxCommentResult {
  const project = new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });
  const srcFile = project.createSourceFile('main.tsx', code);

  const node = srcFile.getDescendantAtPos(startLineStartPos);
  if (!node) {
    throw Error(`Expected code position "${startLineStartPos}" inside ${JSON.stringify(code)}`);
  }

  const isJsxCommentCtxt = [node].concat(node.getAncestors()).some(node =>
    node instanceof JsxText && node.containsRange(startLineStartPos, startLineStartPos));
  const selectedCode = code.slice(startLineStartPos, endLineEndPos + 1);
  let nextSelection = selectedCode;

  if (isJsxCommentCtxt) {
    nextSelection = nextSelection.replace(/^(\s*)\{\/\* (.*) \*\/\}(\s*)$/s, '$1$2$3');
    if (nextSelection === selectedCode) {
      nextSelection = nextSelection.replace(/^(\s*)(.+)(\s*)$/s, '$1{/* $2 */}$3');
    }
  }
  // console.log({ isJsxCommentCtxt, selectedCode, nextSelection });

  return isJsxCommentCtxt
    ? { key: 'jsx-comment', nextSelection }
    : { key: 'js-comment', nextSelection: null };
}

export type ToggleTsxCommentResult = (
  | { key: 'jsx-comment'; nextSelection: string }
  | { key: 'js-comment'; nextSelection: null }
);
