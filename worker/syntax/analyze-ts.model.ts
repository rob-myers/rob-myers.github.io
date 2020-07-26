import { Project, ts, Node, JsxText, JsxAttribute, JsxSelfClosingElement } from 'ts-morph';
import * as Dev from '@model/dev-env/dev-env.model';

let project: Project;

interface AnalyzedImportsExports {
  filename: string;
  imports: Dev.TsImportMeta[];
  exports: Dev.TsExportMeta[];
}

/**
 * Analyze imports/exports of ts/tsx/js file.
 */
export function analyzeCodeImportsExports(filename: string, as: 'js' | 'src', code: string): AnalyzedImportsExports {
  project = project || new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });

  if (filename.endsWith('.tsx') && as === 'src') {
    // Add basic typings for React.FC so can recognise type.
    // Must apply as suffix to preserve import/export code intervals.
    code = [code, 'declare namespace React { type FC<P = {}> = (x: P) => {} }'].join('\n');
  }
  const srcFile = project.createSourceFile(filename, code, { overwrite: true });
  const [imports, exports] = [[] as Dev.TsImportMeta[], [] as Dev.TsExportMeta[]];

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
    if (!item.getValueDeclaration() || !item.getDeclarations()[0]) {
      // Ignore e.g.
      // - export interface Foo {}
      // - export { foo } from './bar' (handled by export-decl)
      // - export default App (handled by export-asgn)
      // console.log({ item, name: item.getName() });
      return;
    }

    const node = item.getDeclarations()[0].getFirstChild()!;
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
  const errors = [] as Dev.SourceFileError[];
  const pathIntervals = ([] as { meta: Dev.ModuleSpecifierInterval; kind: 'import' | 'export' }[]).concat(
    analyzed.imports
      .filter((x) => !Dev.isRuntimeNpmModule(x.from.value))
      .map(x => ({ meta: x.from, kind: 'import' })),
    analyzed.exports.filter(Dev.isTsExportDecl).map(x => ({ meta: x.from, kind: 'export' })),
  );
  /**
   * Cannot detect tsx importing ts (or ts importing tsx) yet because don't
   * know types from other file. We'll analyze transpiled js later instead.
   */
  for (const { meta: { value, interval }, kind } of pathIntervals) {
    if (!Dev.projectAliasRegex.test(value) && !Dev.isRelativePath(value)) {
      errors.push(kind === 'import'
        ? { key: 'require-import-relative', interval, label: value }
        : { key: 'require-export-relative', interval, label: value });
    }

    const resolved = Dev.resolvePath(analyzed.filename, value);
    // console.log({ absPath: analyzed.filename, moduleSpecifier: value, resolved  })

    if (value.endsWith('.scss')) {
      if (!(resolved in filenames)) {
        errors.push({ key: 'require-scss-exists', interval, label: value });
      }
    } else if (!(`${resolved}.tsx` in filenames) && !(`${resolved}.ts` in filenames)) {
      errors.push({ key: 'require-file-exists', interval, label: value });
    }
  }

  if (analyzed.filename.endsWith('.tsx')) {
    /**
     * Require tsx to export types or react components only.
     * We handle `export { foo } from './bar` later, when transpiled.
     */
    for (const exp of analyzed.exports) {
      if (exp.key === 'export-symb' && !exp.type?.startsWith('React.FC<')) {
        errors.push({ key: 'only-export-cmp', interval: exp.interval, label: exp.name });
      } else if (exp.key === 'export-asgn' && !exp.type?.startsWith('React.FC<')) {
        errors.push({ key: 'only-export-cmp', interval: exp.interval, label: 'default' });
      }
    }
  }
  return errors;
}

/**
 * Cyclic dependency errors are computed elsewhere.
 */
export function computeJsImportExportErrors(
  analyzed: AnalyzedImportsExports,
  filenames: { [filename: string]: true },
) {
  const errors = [] as Dev.JsPathError[];
  const imports = analyzed.imports.filter((x) => !Dev.isRuntimeNpmModule(x.from.value));
  const { filename } = analyzed;

  if (filename.endsWith('.tsx')) {
    imports.filter(({ from }) =>
      !from.value.endsWith('.scss') && !(`${Dev.resolvePath(filename, from.value)}.tsx` in filenames))
      .forEach((meta) => errors.push({ key: 'only-import-tsx', path: meta.from.value, resolved: Dev.resolvePath(filename, meta.from.value) }));
    analyzed.exports.forEach((meta) =>
      meta.key === 'export-decl' && !(`${Dev.resolvePath(filename, meta.from.value)}.tsx` in filenames) &&
    errors.push({ key: 'only-export-tsx', path: meta.from.value, resolved: Dev.resolvePath(filename, meta.from.value) }));
  }

  if (filename.endsWith('.ts')) {
    imports.filter(({ from }) =>
      !from.value.endsWith('.scss') && !(`${Dev.resolvePath(filename, from.value)}.ts` in filenames)).forEach((meta) =>
      errors.push({ key: 'only-import-ts', path: meta.from.value, resolved: Dev.resolvePath(filename, meta.from.value) }));
    analyzed.exports.forEach((meta) =>
      meta.key === 'export-decl' && !(`${Dev.resolvePath(filename, meta.from.value)}.ts` in filenames) &&
    errors.push({ key: 'only-export-ts', path: meta.from.value, resolved: Dev.resolvePath(filename, meta.from.value) }));
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
  project = project || new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });
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
