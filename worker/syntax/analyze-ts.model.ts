import { Project, ts, Node, JsxText, JsxAttribute, JsxSelfClosingElement } from 'ts-morph';
import { TsImportMeta, TsExportMeta } from '@model/code/patch-js-imports';
import { SourcePathError, JsPathError } from '@model/code/dev-env.model';

const project = new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });

interface AnalyzedImportsExports {
  filename: string;
  imports: TsImportMeta[];
  exports: TsExportMeta[];
}

/**
 * Analyze imports/exports of ts/tsx/js file.
 */
export function analyzeCodeImportsExports(filename: string, as: 'js' | 'src', code: string): AnalyzedImportsExports {
  if (filename.endsWith('.tsx') && as === 'src') {
    // Add basic typings for React.FC so can recognise type.
    // Must apply as suffix to preserve import/export code intervals.
    code = [code, 'declare namespace React { type FC<P = {}> = (x: P) => {} }'].join('\n');
  }
  const srcFile = project.createSourceFile(filename, code, { overwrite: true });
  const [imports, exports] = [[] as TsImportMeta[], [] as TsExportMeta[]];

  srcFile.getImportDeclarations().forEach((item) => {
    const moduleSpecifier = item.getModuleSpecifier();
    const { line: startLine, column: startCol } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());
    const { line: endLine, column: endCol } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getEnd());

    imports.push({
      key: 'import-decl',
      from: {
        /** Module specifier e.g. `./index` */
        value: moduleSpecifier.getLiteralValue(),
        interval: {
          start: moduleSpecifier.getPos() + 2,
          end: moduleSpecifier.getEnd(),
          startLine,
          startCol,
          endLine,
          endCol,
        },
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
    if (!item.getValueDeclaration()) {
      // Ignore e.g.
      // - export interface Foo {}
      // - export { foo } from './bar' (handled by export-decl)
      // - export default App (handled by export-asgn)
      // console.log({ item, name: item.getName() });
      return;
    }
    const node = item.getValueDeclaration()!;
    const { line: startLine, column: startCol } = srcFile.getLineAndColumnAtPos(node.getStart());
    const { line: endLine, column: endCol } = srcFile.getLineAndColumnAtPos(node.getEnd());

    exports.push({
      key: 'export-symb',
      name: item.getName(),
      type: node.getType().getText() || null,
      interval: {
        start: node.getPos(),
        end: node.getEnd(),
        startLine,
        startCol,
        endLine,
        endCol,
      },
    });
  });

  // e.g. export { foo } from './other-module'
  // e.g. export * from './other-module'
  srcFile.getExportDeclarations().forEach((item) => {
    if (!item.hasModuleSpecifier()) {
      return console.warn('ignored unexpected export declaration without module specifier');
    }
    const moduleSpecifier = item.getModuleSpecifier()!;
    const { line: startLine, column: startCol } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getStart());
    const { line: endLine, column: endCol } = srcFile.getLineAndColumnAtPos(moduleSpecifier.getEnd());

    exports.push({
      key: 'export-decl',
      from: {
        value: moduleSpecifier.getLiteralValue(),
        interval: {
          start: moduleSpecifier.getPos() + 2,
          end: moduleSpecifier.getEnd(),
          startLine,
          startCol,
          endLine,
          endCol,
        },
      },
      ...(item.getNamedExports().length
        ? {
          names: item.getNamedExports().map((x) => ({
            name: x.getName(),
            alias: x.getAliasNode()?.getText() || null,
          }))
        } : { namespace: item.getNamespaceExport()?.getName() || '*' }
      ),
    });
  });
  
  // e.g. export default App
  srcFile.getExportAssignments().forEach((item) => {
    if (item.isExportEquals()) {
      return console.warn('ignored unexpected export assignment which is not default export');
    }
    const identifier = item.getDescendants()[2];
    const { line: startLine, column: startCol } = srcFile.getLineAndColumnAtPos(identifier.getStart());
    const { line: endLine, column: endCol } = srcFile.getLineAndColumnAtPos(identifier.getEnd());

    exports.push({
      key: 'export-asgn',
      name: 'default',
      type: as === 'src' ? identifier.getType().getText() : null,
      interval: {
        start: identifier.getPos(),
        end: identifier.getEnd(),
        startLine,
        startCol,
        endLine,
        endCol,
      },
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
  analyzed: AnalyzedImportsExports,
  filenames: { [filename: string]: true },
) {
  const errors = [] as SourcePathError[];
  const imports = analyzed.imports.filter(x => x.from.value !== 'react');
  
  /**
   * Cannot detect tsx importing ts (or ts importing tsx) yet because don't
   * know types from other file. We'll analyze transpiled js later instead.
   */
  for (const { from: { value, interval } } of imports) {
    if (!value.startsWith('./')) {
      errors.push({ key: 'require-import-relative', info: 'local imports must be relative', interval, label: value });
    } else if (value.endsWith('.scss') && !(value.slice(2) in filenames)) {
      errors.push({ key: 'require-scss-exists', info: 'scss file not found', interval, label: value });
    }
  }

  if (analyzed.filename.endsWith('.tsx')) {
    /**
     * Require tsx to export types or react components only.
     * We handle `export { foo } from './bar` later, when transpiled.
     */
    for (const exp of analyzed.exports) {
      if (exp.key === 'export-symb' && exp.type !== 'React.FC<{}>') {
        errors.push({ key: 'only-export-cmp', info: 'tsx export values must be react components', interval: exp.interval, label: exp.name });
      } else if (exp.key === 'export-asgn' && exp.type !== 'React.FC<{}>') {
        errors.push({ key: 'only-export-cmp', info: 'tsx export values must be react components', interval: exp.interval, label: 'default' });
      }
    }
  }
  return errors;
}

export function computeJsImportExportErrors(
  analyzed: AnalyzedImportsExports,
  filenames: { [filename: string]: true },
) {
  const errors = [] as JsPathError[];
  const imports = analyzed.imports.filter(x => x.from.value !== 'react');

  if (analyzed.filename.endsWith('.tsx')) {
    imports.filter(({ from }) => !from.value.endsWith('.scss') && !(`${from.value.slice(2)}.tsx` in filenames))
      .forEach((meta) =>errors.push({ key: 'only-import-tsx', info: 'tsx files can only import values from other tsx files', path: meta.from.value, }));
    analyzed.exports.forEach((meta) => meta.key === 'export-decl' && !(`${meta.from.value.slice(2)}.tsx` in filenames) &&
      errors.push({ key: 'only-export-tsx', info: 'tsx files can only export values from other tsx files', path: meta.from.value }));
  }

  if (analyzed.filename.endsWith('.ts')) {
    imports.filter(({ from }) => !from.value.endsWith('.scss') && !(`${from.value.slice(2)}.ts` in filenames)).forEach((meta) =>
      errors.push({ key: 'only-import-ts', info: 'ts files can only import values from other ts files', path: meta.from.value }));
    analyzed.exports.forEach((meta) => meta.key === 'export-decl' && !(`${meta.from.value.slice(2)}.ts` in filenames) &&
      errors.push({ key: 'only-export-ts', info: 'ts files can only export values from other ts files', path: meta.from.value }));
  }

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
  // console.log({ isJsxCommentCtxt, node, kind: node.getKindName(), ancestors: node.getAncestors() });

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
