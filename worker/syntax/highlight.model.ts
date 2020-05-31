import { Project, ts, Node } from 'ts-morph';

export interface Classification {
  kind: string;
  parentKind?: string;
  extra?: string[];
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
}

interface PendingItem {
  kind: string;
  start: number;
  end: number;
}

const jsxTagKind = {
  'JsxOpeningElement': true,
  'JsxClosingElement': true,
  'JsxSelfClosingElement': true,
};

export async function computeClassifications(code: string, classifications: Classification[]) {
  const project = new Project({
    compilerOptions: { jsx: ts.JsxEmit.React },
  });
  const srcFile = project.createSourceFile('main.tsx', code);
  const pending = [] as PendingItem[];

  try {
    srcFile.getDescendants()
      .filter((x) => filterNonJsxRelatedNodes(x))
      .forEach(node => {
        const parent = node.getParent();
        const parentKind = parent && parent.getKindName();
        const kind = node.getKindName();
        pending.length = 0;
  
        switch (kind) {
          case 'JsxText': {
            pending.push({
              kind: 'jsx-text',
              start: node.getStart() - node.getLeadingTriviaWidth(),
              end: node.getTrailingTriviaEnd(),
            });
            break;
          }
          case 'Identifier': {
            if (parentKind && parentKind in jsxTagKind) {
              const kind = /^[A-Z]/.test(node.getText()) ? 'jsx-component' : 'jsx-tag';
              pending.push({ kind, start: node.getStart(), end: node.getEnd() });
            } else if (parentKind === 'JsxAttribute') {
              pending.push({ kind: 'jsx-attribute', start: node.getStart(), end: node.getEnd() });
            } else if (parentKind === 'PropertyAccessExpression' && !!node.getPreviousSibling()) {
              pending.push({ kind: 'jsx-property', start: node.getStart(), end: node.getEnd() });
            }
            break;
          }
          case 'OpenBraceToken':
          case 'CloseBraceToken': {
            if (parentKind === 'JsxExpression') {
              pending.push({ kind: 'jsx-brace', start: node.getStart(), end: node.getEnd() });
            }
            break;
          }
          default: {// TESTING
            // console.log({ kind, parentKind, grandParentKind: parent?.getParent()?.getKindName() });
            // pending.push({ kind, start: node.getStart(), end: node.getEnd() });
            break;
          }
        }
  
        pending.forEach(({ kind, start, end }) => {
          const { line: startLineNumber, column: startColumn } = srcFile.getLineAndColumnAtPos(start);
          const { line: endLineNumber, column: endColumn } = srcFile.getLineAndColumnAtPos(end);
          classifications.push({
            startLineNumber,
            endLineNumber,
            startColumn,
            endColumn,
            kind,
            parentKind,
            extra: undefined,
          });
        });
      });
  } catch (e) {
    console.error(`Syntax highlighting failed (${e.message})`);
    console.error(e);
  }
  // console.log(classifications);
}

function filterNonJsxRelatedNodes(node: Node<ts.Node>) {
  // this is faster - we just dont want syntax list since they pollute a lot the JSX. 
  return node.getKindName() !== 'SyntaxList';
}
