import { testNever } from "@model/generic.model";
import * as Sh from "./parse.service";

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
        .concat(node.Assigns, node.Opts, node.Variant, node.others);
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


