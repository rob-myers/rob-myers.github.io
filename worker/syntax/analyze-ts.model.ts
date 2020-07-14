import { Project, ts, Node, JsxText, JsxAttribute, JsxSelfClosingElement } from 'ts-morph';
import { JsImportMeta, JsExportMeta } from '@model/code/patch-js-imports';

const project = new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });

/**
 * Analyze imports/exports of ts/tsx/js file.
 *
 * TODO
 * - detect if path is not of form `./index`
 * - detect if ts file imports value from tsx
 * - detect if tsx file imports value from ts
 * - detect if tsx file exports non-react-component value
 */
export function analyzeTsImportsExports(
  filename: string,
  code: string,
  _allFilenames: { [filename: string]: true },
) {
  // console.log('analyzeTsImportsExports', 'for', filename);
  const isTsx = filename.endsWith('.tsx');
  if (isTsx) {
    /**
     * Add basic typings for React.FC so can recognise type.
     * Must apply as suffix to preserve import/export code intervals.
     */
    code = [code, 'declare namespace React { type FC<P = {}> = (x: P) => {} }'].join('\n');
  }
  const srcFile = project.createSourceFile(filename, code);

  const importItems = [] as JsImportMeta[];
  const exportItems = [] as JsExportMeta[];

  const importDecs = srcFile.getImportDeclarations();
  const exportDecs = srcFile.getExportDeclarations();
  const exportAssigns = srcFile.getExportAssignments();
  const exportSymbols = srcFile.getExportSymbols();

  // e.g. export const foo = 'bar';
  exportSymbols.forEach((item) => {
    if (isTsx) {
      console.log({
        key: 'export-symb',
        name: item.getName(),
        alias: item.getAliasedSymbol()?.getName(),
        type: item.getValueDeclaration()?.getType().getText(),
      });
    }

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

  /**
   * e.g. export { foo } from './other-module'
   * 
   * For tsx there is no need to enforce React components,
   * because they'll be enforced when exporting from original file.
   */
  exportDecs.forEach((item) => {
    if (!item.hasModuleSpecifier()) {
      return console.warn('ignored unexpected export declaration without module specifier');
    }

    const moduleSpecifier = item.getModuleSpecifier()!;
    const { line, column } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());

    exportItems.push({
      type: 'export-decl',
      names: item.getNamedExports().map((x) => ({
        name: x.getName(),
        alias: x.getAliasNode()?.getText(),
      })),
      namespace: item.getNamespaceExport()?.getName(),
      from: {
        value: moduleSpecifier.getLiteralValue(),
        start: moduleSpecifier.getPos() + 2,
        startLine: line,
        startCol: column,
      },
    });
  });

  // e.g. export default App
  exportAssigns.forEach((item) => {
    if (isTsx) {
      console.log({
        key: 'export-asgn',
        types: item.getDescendants().map(x => ({ kind: x.getKindName(), type: x.getType().getText() })),
      });
    }

    exportItems.push({
      type: 'export-asgn',
      names: [{
        name: item.isExportEquals()
          ? item.getFirstChild()?.getText()!
          : 'default',
      }],
    });
  });

  project.removeSourceFile(srcFile);

  return {
    exports: exportItems,
    imports: importItems,
  };
}

/**
 * Detect if `startLineStartPos` should be commented in JSX-style.
 * If so, provide the text which will replace the selection.
 */
export function toggleTsxComment(
  code: string,
  startLineStartPos: number,
  endLineEndPos: number,
): ToggleTsxCommentResult {
  const srcFile = project.createSourceFile('__temp.tsx', code, { overwrite: true });

  const node = srcFile.getDescendantAtPos(startLineStartPos);
  if (!node) {
    throw Error(`Expected code position "${startLineStartPos}" inside ${JSON.stringify(code)}`);
  }

  const { line } = srcFile.getLineAndColumnAtPos(startLineStartPos);
  const [first, second, third] = node.getAncestors();
  const isJsxCommentCtxt = third && (node instanceof JsxText || (
    areJsxNodes([first, second]) && node.getStartLineNumber() <= line
    && (areJsxNodes([third]))
      || first instanceof JsxSelfClosingElement
      || node.getKindName() === 'OpenBraceToken'
  ));

  const selectedCode = code.slice(startLineStartPos, endLineEndPos + 1);
  let nextSelection = selectedCode;
  console.log({ isJsxCommentCtxt, node, kind: node.getKindName(), ancestors: node.getAncestors() });


  if (isJsxCommentCtxt) {
    nextSelection = nextSelection.replace(/^(\s*)\{\/\*(.*)\*\/\}(\s*)$/s, '$1$2$3');
    if (nextSelection === selectedCode) {
      nextSelection = nextSelection.replace(/^(\s*)(.*)(\s*)$/s, '$1{/* $2 */}$3');
    } else {
      nextSelection.slice(-1) === ' ' && (nextSelection = nextSelection.slice(0, -1));
      nextSelection.slice(0, 1) === ' ' && (nextSelection = nextSelection.slice(1));
    }
  }

  return isJsxCommentCtxt
    ? { key: 'jsx-comment', nextSelection }
    : { key: 'js-comment', nextSelection: null };
}

export type ToggleTsxCommentResult = (
  | { key: 'jsx-comment'; nextSelection: string }
  | { key: 'js-comment'; nextSelection: null }
);

function areJsxNodes(nodes: Node[]) {
  return nodes.every(x => x.getKindName().startsWith('Jsx') && !(x instanceof JsxAttribute));
}
