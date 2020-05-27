import { Project, ts, Node, TypeGuards } from 'ts-morph';

export interface Classification {
  startColumn: number;
  endColumn: number;
  kind: string;
  startLineNumber: number;
  endLineNumber: number;
  parentKind?: string;
  extra?: string[];
}

export async function computeClassifications(code: string, classifications: Classification[]) {
  const project = new Project({
    compilerOptions: {
      jsx: ts.JsxEmit.React,
    }
  });
  const srcFile = project.createSourceFile('main.tsx', code);
  const lines = code.split('\n').map(line => line.length);

  srcFile.getDescendants()
    .filter((x) => filterNonJsxRelatedNodes(x))
    .forEach(node => {
      const parent = node.getParent();
      const parentKind = parent && parent.getKindName();
      const kind = node.getKindName();
      const extra = getExtra(node);

      getNodeRangesForMonaco(node, lines).forEach(r => {
        classifications.push(
          {
            ...r,
            kind,
            parentKind,
            extra,
          }
        );
      });
    });
}

function filterNonJsxRelatedNodes(n: Node<ts.Node>) {
  // this is faster - we just dont want syntax list since they pollute a lot the JSX. 
  return n.getKindName() !== 'SyntaxList';
}

function getExtra(node: Node) {
  const extras = [];
  if (TypeGuards.isJsxTagNamedNode(node)) {
    extras.push(node.getTagNameNode().getText().match(/^[a-z]/) ? 'JSXIntrinsicElement' : 'JSXNonIntrinsicElement');
  }
  const parent = node.getParent();
  if (parent && TypeGuards.isJsxTagNamedNode(parent)) {
    extras.push(parent.getTagNameNode().getText().match(/^[a-z]/) ? 'JSXIntrinsicElementChild' : 'JSXNonIntrinsicElementChild');
  }
  return extras.length ? extras : undefined;
}

function getNodeRangesForMonaco(node: Node, lines: number[]) {
  const ranges = getParentRanges(node);
  return ranges.map(({ start, end }) => {
    const { offset, line: startLineNumber } = getLineNumberAndOffset(start, lines);
    const { line: endLineNumber } = getLineNumberAndOffset(end, lines);
    return {
      startLineNumber,
      endLineNumber,
      startColumn: start + 1 - offset,
      endColumn: end + 1 - offset,
    };
  });
}

function getLineNumberAndOffset(start: number, lines: number[]) {
  let line = 0;
  let offset = 0;
  while (offset + lines[line] < start) {
    offset += lines[line] + 1;
    line += 1;
  }
  return { line: line + 1, offset };
}

function getParentRanges(node: Node) {
  const ranges = [];
  const [start, end] = [
    node.getStart() - node.getLeadingTriviaWidth(),
    node.getEnd() + node.getTrailingTriviaWidth(),
  ];
  
  let lastEnd = start;
  node.forEachChild(child => {
    const [start, end] = [child.getStart(), child.getEnd()];
    ranges.push({
      start: lastEnd,
      end: start
    });
    lastEnd = end;
  });
  if (lastEnd !== end) {
    ranges.push({
      start: lastEnd,
      end
    });
  }
  return ranges;
}
