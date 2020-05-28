import { Project, ts, Node, TypeGuards as _ } from 'ts-morph';

export interface Classification {
  kind: string;
  parentKind?: string;
  extra?: string[];
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
}

/**
 * TODO new approach which precisely isolates
 */
export async function computeClassifications(code: string, classifications: Classification[]) {
  const project = new Project({
    compilerOptions: { jsx: ts.JsxEmit.React },
  });
  const srcFile = project.createSourceFile('main.tsx', code);

  srcFile.getDescendants()
    .filter((x) => filterNonJsxRelatedNodes(x))
    .forEach(node => {
      const parent = node.getParent();
      const parentKind = parent && parent.getKindName();
      const kind = node.getKindName();
      let start: number, end: number;

      switch (kind) {
        case 'JsxText': {
          start = node.getStart() - node.getLeadingTriviaWidth();
          end = node.getTrailingTriviaEnd();
          break;
        }
        default: {
          start = node.getStart();
          end = node.getEnd();
          break;
        }
      }

      const { line: startLineNumber, column: startColumn } = srcFile.getLineAndColumnAtPos(start);
      const { line: endLineNumber, column: endColumn } = srcFile.getLineAndColumnAtPos(end);

      classifications.push(
        {
          startLineNumber,
          endLineNumber,
          startColumn,
          endColumn,
          kind,
          parentKind,
          extra: undefined,
        }
      );
    });

  // console.log(classifications);
}

const permittedKinds = {
  'JsxOpeningElement': true,
  'JsxClosingElement': true,
  'JsxSelfClosingElement': true,
  'Identifier': true,
  'JsxText': true,
  'JsxAttribute': true,
  'DotToken': true,
  'PropertyAccessExpression': true,
  'OpenBraceToken': true,
  'CloseBraceToken': true,
};

function filterNonJsxRelatedNodes(n: Node<ts.Node>) {
  // this is faster - we just dont want syntax list since they pollute a lot the JSX. 
  // return n.getKindName() !== 'SyntaxList';
  return n.getKindName() in permittedKinds;
}
