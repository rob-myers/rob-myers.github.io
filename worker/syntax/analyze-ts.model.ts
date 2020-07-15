import { Project, ts, Node, JsxText, JsxAttribute, JsxSelfClosingElement } from 'ts-morph';
import { JsImportMeta, JsExportMeta } from '@model/code/patch-js-imports';
import { SourcePathError } from '@model/code/dev-env.model';

const project = new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });

/**
 * Analyze imports/exports of ts/tsx/js file.
 */
export function analyzeTsImportsExports(filename: string, code: string) {
  if (filename.endsWith('.tsx')) {
    // Add basic typings for React.FC so can recognise type.
    // Must apply as suffix to preserve import/export code intervals.
    code = [code, 'declare namespace React { type FC<P = {}> = (x: P) => {} }'].join('\n');
  }
  const srcFile = project.createSourceFile(filename, code, { overwrite: true });
  const [imports, exports] = [[] as JsImportMeta[], [] as JsExportMeta[]];

  srcFile.getImportDeclarations().forEach((item) => {
    const moduleSpecifier = item.getModuleSpecifier();
    const { line, column } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());

    imports.push({
      key: 'import-decl',
      /** Module specifier e.g. `./index` */
      path: {
        value: moduleSpecifier.getLiteralValue(),
        start: moduleSpecifier.getPos() + 2,
        startLine: line,
        startCol: column,
      },
      ...(item.getNamespaceImport()
        ? { namespace: item.getNamespaceImport()!.getText() }
        : item.getDefaultImport()
          ? { defaultAlias: item.getDefaultImport()!.getText() }
          : {
            names: item.getNamedImports().map((x) => ({
              name: x.getName(),
              alias: x.getAliasNode()?.getText() || null,
            }))
          }
      ),
    });
  });

  // e.g. export const foo = 'bar';
  srcFile.getExportSymbols().forEach((item) => {
    exports.push({
      key: 'export-symb',
      name: item.getName(),
      type: item.getValueDeclaration()?.getType().getText() || null,
    });
  });

  // e.g. export { foo } from './other-module'
  srcFile.getExportDeclarations().forEach((item) => {
    if (!item.hasModuleSpecifier()) {
      return console.warn('ignored unexpected export declaration without module specifier');
    }
    const moduleSpecifier = item.getModuleSpecifier()!;
    const { line, column } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());

    exports.push({
      key: 'export-decl',
      from: {
        value: moduleSpecifier.getLiteralValue(),
        start: moduleSpecifier.getPos() + 2,
        startLine: line,
        startCol: column,
      },
      ...(item.getNamedExports().length
        ? {
          names: item.getNamedExports().map((x) => ({
            name: x.getName(),
            alias: x.getAliasNode()?.getText() || null,
          }))
        } : { namespace: item.getNamespaceExport()?.getName()! }
      ),
    });
  });
  
  const isTyped = /\.tsx?$/.test(filename);

  // e.g. export default App
  srcFile.getExportAssignments().forEach((item) => {
    if (item.isExportEquals()) {
      return console.warn('ignored unexpected export assignment which is not default export');
    }
    exports.push({
      key: 'export-asgn',
      name: 'default',
      type: isTyped ? item.getDescendants()[2].getType().getText() : null,
    });
  });

  project.removeSourceFile(srcFile);

  return {
    filename,
    imports,
    exports,
  };
}

export function computeTsImportExportErrors(
  analyzed: ReturnType<typeof analyzeTsImportsExports>,
  _allFilenames: { [filename: string]: true },
) {
  const errors = [] as SourcePathError[];
  /**
   * TODO
   * - detect if path is not of form `./index`
   * - detect if ts file imports value from tsx
   * - detect if tsx file imports value from ts
   * - detect if tsx file exports non-react-component value
   */
  // NOTE for tsx no need to enforce React component imports:
  // they'll be enforced when exporting from original file.

  console.log({ ...analyzed, errors });
  return errors;
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
