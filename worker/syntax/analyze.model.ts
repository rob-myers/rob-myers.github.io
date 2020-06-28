import { Project } from 'ts-morph';
import { JsImportMeta, JsExportMeta, ModuleSpecifierMeta } from '@model/code/patch-js-imports';

import { parse, stringify } from 'scss-parser';

/**
 * Analyze imports/exports of typescript file.
 */
export function analyzeImportsExports(filename: string, code: string) {
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

interface ScssAstNode {
  type: string;
  start?: { column: number; cursor: number; line: number };
  next?: { column: number; cursor: number; line: number };
  value: ScssAstNode[] | string;
}

export function prefixScssClasses(scssContents: string, filename: string) {
  const prefix = `${filename.replace(/\./g, '_')}__`;
  const ast = parse(scssContents);
  
  traverseScss((node) => {
    if (node.type === 'class') {// Apply prefixing
      const classNode = node as ScssAstNode & { value: [ScssAstNode & { value: string }] };
      classNode.value[0] = { ...classNode.value[0], value: `${prefix}${classNode.value[0].value}`};
    }

    if (node.type === 'selector' && (node.value as ScssAstNode[])[0]?.type === 'number') {
      /**
       * Monaco disallows selectors starting with a number via
       * `scss(css-rcurlyexpected)`. We throw to keep in sync.
       */
      throw Error('selector cannot start with a number');
    }
  }, ast);

  const prefixedScss = stringify(ast);

  return {
    prefixedScss,
    importIntervals: extractScssImportIntervals(prefixedScss),
  };
}

export interface ScssImportPathInterval {
  value: string;
  line: number;
  startCol: number;
  endCol: number;
}

function extractScssImportIntervals(scssContents: string) {
  const importIntervals = [] as ScssImportPathInterval[];
  const ast = parse(scssContents);

  traverseScss((node) => {
    if (node.type === 'atrule') {
      const [first, second, third] = node.value as ScssAstNode[];
      (first.type === 'atkeyword' && first.value === 'import' && second.type === 'space'
        && (third.type === 'string_double' || third.type === 'string_single')
      ) && importIntervals.push({
        // Remember import filename code interval
        value: third.value as string,
        line: third.start!.line,
        startCol: third.start!.column - 1,
        endCol: third.start!.column + (third.value as string).length,
      });
    }
  }, ast);

  return importIntervals;
}

function traverseScss(act: (node: ScssAstNode) => void, node: ScssAstNode) {
  act(node);
  Array.isArray(node.value) && node.value.forEach((child) => traverseScss(act, child));
}
