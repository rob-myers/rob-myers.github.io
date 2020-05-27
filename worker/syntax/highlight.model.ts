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

      const start = node.getStart() - node.getLeadingTriviaWidth();
      const end = node.getTrailingTriviaEnd();
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

  console.log(classifications);
}

const permittedKinds = [
  'JsxOpeningElement',
  'JsxClosingElement',
  'JsxSelfClosingElement',
  'Identifier',
  'JsxText',
];

function filterNonJsxRelatedNodes(n: Node<ts.Node>) {
  // this is faster - we just dont want syntax list since they pollute a lot the JSX. 
  // return n.getKindName() !== 'SyntaxList';
  return permittedKinds.includes(n.getKindName());
}
