import { Project } from 'ts-morph';
import { FileImportsMeta, FileExportsMeta } from '@components/dev-env/dev-env.model';

export function analyzeImportsExports(filename: string, code: string): {
  imports: FileImportsMeta;
  exports: FileExportsMeta;
} {
  const project = new Project({ compilerOptions: {} });
  const srcFile = project.createSourceFile(filename, code);

  const importItems = [] as FileImportsMeta['items'];
  const exportItems = [] as FileExportsMeta['items'];

  const importDecs = srcFile.getImportDeclarations();
  const exportDecs = srcFile.getExportDeclarations();
  const exportAssigns = srcFile.getExportAssignments();
  const exportSymbols = srcFile.getExportSymbols();

  // e.g. export const foo = 'bar';
  exportSymbols.forEach((item) => {
    exportItems.push({
      names: [{
        name: item.getName(), // alias always undefined
        alias: item.getAliasedSymbol()?.getName(),
      }],
    });
  });

  importDecs.forEach((item) => {
    const moduleSpecifier = item.getModuleSpecifier();
    importItems.push({
      path: moduleSpecifier.getLiteralValue(),
      pathStart: moduleSpecifier.getPos() - 1,
      pathEnd: moduleSpecifier.getEnd() + 1,
      names: item.getNamedImports().map(x => ({
        name: x.getName(),
        alias: x.getAliasNode()?.getText(),
      })),
    });
  });

  exportDecs.forEach((item) => {
    exportItems.push({
      names: item.getNamedExports().map((x) => ({
        name: x.getName(),
        alias: x.getAliasNode()?.getText(),
      })),
      namespace: item.getNamespaceExport() && true,
      from: item.getModuleSpecifierValue(),
    });
  });

  exportAssigns.forEach((item) => {
    exportItems.push({
      names: [{
        name: item.isExportEquals()
          ? item.getFirstChild()?.getText()!
          : 'default',
      }],
    });
  });

  return {
    exports: {
      key: filename,
      items: exportItems,
    },
    imports: {
      key: filename,
      items: importItems,
    },
  };
}
