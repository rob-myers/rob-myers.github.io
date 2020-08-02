import { parse, stringify } from 'scss-parser';
import { filenameToClassPrefix, ModuleSpecifierInterval, resolvePath } from '@model/dev-env/dev-env.model';

interface ScssAstNode {
  type: string;
  start?: { column: number; cursor: number; line: number };
  next?: { column: number; cursor: number; line: number };
  value: ScssAstNode[] | string;
}

export function prefixScssClasses(scssContents: string, filename: string) {
  const prefix = filenameToClassPrefix(filename);
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

    if (node.type === 'atrule') {// Resolve paths
      const [first, second, third] = node.value as ScssAstNode[];
      if ((first.type === 'atkeyword' && first.value === 'import' && second.type === 'space'
        && (third.type === 'string_double' || third.type === 'string_single')
      ) && third.start) {
        (node as any).value[2] = { ...(node as any).value[2], value: resolvePath(filename, third.value as string) };
      }
    }
  }, ast);

  return stringify(ast);
}

export function extractScssImportIntervals(scssContents: string) {
  const importIntervals = [] as ModuleSpecifierInterval[];
  const ast = parse(scssContents);

  traverseScss((node) => {
    if (node.type === 'atrule') {
      const [first, second, third] = node.value as ScssAstNode[];
      if ((first.type === 'atkeyword' && first.value === 'import' && second.type === 'space'
        && (third.type === 'string_double' || third.type === 'string_single')
      ) && third.start) {
        // Remember import filename code interval
        const value = third.value as string;
        importIntervals.push({
          value,
          interval: {
            start: third.start.cursor,
            end: third.start.cursor + value.length - 1,
            startLine: third.start.line,
            startCol: third.start.column - 1,
            endLine: third.start.line,
            endCol: third.start.column + value.length - 1,
          },
        });
      }
    }
  }, ast);

  return importIntervals;
}

function traverseScss(act: (node: ScssAstNode) => void, node: ScssAstNode) {
  act(node);
  Array.isArray(node.value) && node.value.forEach((child) => traverseScss(act, child));
}
