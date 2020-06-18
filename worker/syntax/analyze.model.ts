import { Project } from 'ts-morph';

export function analyzeImportsExports(filename: string, code: string) {
  const project = new Project({
    compilerOptions: {},
  });
  const srcFile = project.createSourceFile(filename, code);

  const imports = srcFile.getImportDeclarations();
  const exportDecs = srcFile.getExportDeclarations();
  const exportAssigns = srcFile.getExportAssignments();
  const exportSymbols = srcFile.getExportSymbols();

  /**
   * TODO collect this information
   */

  // e.g. export const foo = 'bar';
  console.log({ exportSymbols: exportSymbols.map(x => ({
    name: x.getName(),
    isAlias: x.isAlias(),
    aliased: x.getAliasedSymbol()?.getName() || null,
  }))});

  console.log({ filename, code, imports, exportDecs, exportAssigns });

  imports.forEach(x  => {
    console.log({
      kind: 'import',
      // e.g. `react` sans quotes
      moduleSpecifier: x.getModuleSpecifier().getLiteralValue(),
      // e.g. `* as React`
      importClause: x.getImportClause()?.getText() || null,
    });
  });

  exportDecs.forEach(x => {
    console.log({
      kind: 'export-dec',
      namespaceExport: x.getNamespaceExport()?.getText() || null,
      moduleSpecifier: x.getModuleSpecifierValue() || null,
      namedExports: x.getNamedExports().map(y => ({
        name: y.getName(),
        alias: y.getAliasNode()?.getText() || null,
      }))
    });
  });

  exportAssigns.forEach((x) => {
    console.log({
      kind: 'export-assign',
      default: !x.isExportEquals(),
      name: x.isExportEquals()
        ? x.getFirstChild()?.getText()
        : null
    });
  });
}
