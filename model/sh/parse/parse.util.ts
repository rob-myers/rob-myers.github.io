import cloneWithRefs from 'lodash.clonedeep';
import getopts from 'getopts';
import { testNever, last } from "model/generic.model";
import type * as Sh from "./parse.model";

/**
 * Clone creates completely fresh tree, sharing internal refs as before.
 * In particular, every node has the same node.meta.
 */
export function cloneParsed<T extends Sh.ParsedSh>(parsed: T): T {
  return cloneWithRefs(parsed);
}

export function getChildren(node: Sh.ParsedSh): Sh.ParsedSh[] {
  switch (node.type) {
    case 'ArithmCmd': return [node.X];
    case 'ArithmExp': return [node.X];
    case 'ArrayElem': return [
      ...node.Index ? [node.Index] : [],
      node.Value,
    ];
    case 'ArrayExpr': return node.Elems;
    case 'Assign': return [
      ...node.Array ? [node.Array] : [],
      ...node.Index ? [node.Index] : [],
      ...node.Value ? [node.Value] : [],
    ];
    case 'BinaryArithm': 
    case 'BinaryCmd':
    case 'BinaryTest': return [node.X, node.Y];
    case 'Block': return node.Stmts;
    case 'CStyleLoop': return [node.Cond, node.Init, node.Post];
    case  'CallExpr': return ([] as Sh.ParsedSh[])
      .concat(node.Args, node.Assigns);
    case 'CaseClause': return ([] as Sh.ParsedSh[])
      .concat(node.Items, node.Word);
    case 'CaseItem': return  ([] as Sh.ParsedSh[])
      .concat(node.Patterns, node.Stmts);
    case 'CmdSubst': return node.Stmts;
    case 'Comment': return [];
    case 'CoprocClause': return [node.Stmt];
    case 'DblQuoted': return node.Parts;
    case 'DeclClause': return ([] as Sh.ParsedSh[])
        .concat(node.Args, node.Variant);
    case 'ExtGlob': return [];
    case 'File': return node.Stmts;
    case 'ForClause': return [...node.Do, node.Loop];
    case 'FuncDecl': return [node.Body, node.Name];
    case 'IfClause': return [
      ...node.Cond,
      ...node.Then,
      ...node.Else ? [node.Else] : [],
    ];
    case 'LetClause': return node.Exprs;
    case 'Lit': return [];
    case 'ParamExp': return [
      ...(node.Exp?.Word ? [node.Exp.Word] : []),
      ...(node.Index ? [node.Index] : []),
      node.Param,
      ...(node.Repl ? [node.Repl.Orig] : []),
      ...(node.Repl?.With ? [node.Repl.With] : []),
      ...(node.Slice ? [node.Slice.Offset] : []),
      ...(node.Slice?.Length ? [node.Slice.Length] : [])
    ];
    case 'ParenArithm': return [node.X];
    case 'ParenTest': return [node.X];
    case 'ProcSubst': return node.Stmts;
    case 'Redirect': return [
      ...(node.Hdoc ? [node.Hdoc] : []),
      ...(node.N ? [node.N] : []),
      node.Word,
    ];
    case 'SglQuoted': return [];
    case 'Stmt': return [
      ...node.Cmd ? [node.Cmd] : [],
      ...node.Redirs,
    ];
    case 'Subshell': return node.Stmts;
    case 'TestClause': return [node.X];
    case 'TimeClause': return [
      ...node.Stmt ? [node.Stmt] : [],
    ];
    case 'UnaryArithm':
    case 'UnaryTest': return [node.X];
    case 'WhileClause': return node.Cond.concat(node.Do);
    case 'Word': return node.Parts;
    case 'WordIter': return node.Items;
    default: throw testNever(node);
  }
}

export function getOpts(args: string[], options?: getopts.Options) {
  /** Changes e.g. -a1 to -1a (avoid short-opt-assigns) */
  const sortedOpts = args.filter(x => x[0] === '-').map(x => Array.from(x).sort().join(''));
  const operands = args.filter(x => x[0] !== '-');
  return {
    opts: simplifyGetOpts(getopts(sortedOpts, options)),
    operands,
  };
}

function findAncestral(node: Sh.ParsedSh, predicate: (ancestor: Sh.ParsedSh) => boolean) {
  let ancestor = node as null | Sh.ParsedSh;
  while (ancestor = ancestor!.parent) {
    if (predicate(ancestor)) {
      break;
    }
  }
  return ancestor;
}

export function hasAncestralIterator(node: Sh.ParsedSh) {
  return findAncestral(node, ({ type }) =>
    type === 'ForClause' || type === 'WhileClause'
  );
}

/**
 * `getopts` handles dup options by providing an array.
 * We restrict it to the final item. We also store list
 * of extant option names as value of key `__optKeys`.
 */
function simplifyGetOpts(parsed: getopts.ParsedOptions) {
  const output = parsed as getopts.ParsedOptions & { operands: string[] };
  Object.keys(parsed).forEach((key) => {
    output.__optKeys = [];
    if (key !== '_') {
      Array.isArray(parsed[key]) && (output[key] = last(parsed[key]) as any);
      output.__optKeys.push(key);
    }
  });
  return output;
}

/** Traverse descendents including `node` itself */
export function traverseParsed(node: Sh.ParsedSh, act: (node: Sh.ParsedSh) => void) {
  act(node);
  getChildren(node).forEach(child => traverseParsed(child, act));
}

export function withParents<T extends Sh.ParsedSh>(root: T) {
  traverseParsed(root, (node) => {
    getChildren(node).forEach(child => (child as Sh.BaseNode).parent = node);
  });
  return root;
}

/**
 * Convert node to a FileWithMeta,
 * so it can be used to drive a process.
 */
export function wrapInFile(node: Sh.Stmt | Sh.CmdSubst | Sh.Subshell): Sh.FileWithMeta {
  return {
    type: 'File',
    Stmts: node.type === 'Stmt'
      ? [node]
      : node.Stmts,
    meta: node.meta,
  } as Sh.FileWithMeta;
}

/** Collect contiguous if-clauses. */
export function collectIfClauses(cmd: Sh.IfClause): Sh.IfClause[] {
  return cmd.Else ? [cmd, ...collectIfClauses(cmd.Else)] : [cmd];
}
