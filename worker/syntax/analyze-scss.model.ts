import { parse, stringify } from 'scss-parser';
import { filenameToClassPrefix } from '@model/code/dev-env.model';

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
  }, ast);

  return stringify(ast);
}

export interface ScssImportPathInterval {
  value: string;
  line: number;
  startCol: number;
  endCol: number;
}

export function extractScssImportIntervals(scssContents: string) {
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
