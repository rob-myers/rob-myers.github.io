import { Project } from 'ts-morph';
import { JsImportMeta, JsExportMeta, ModuleSpecifierMeta } from '@model/code/patch-js-imports';

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
