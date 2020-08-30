import { testNever } from "@model/generic.model";
import { ParsedSh, BaseNode } from "./parse.service";

export function getChildren(node: ParsedSh): ParsedSh[] {
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
    case 'Block': return [node.StmtList];
    case 'CStyleLoop': return [node.Cond, node.Init, node.Post];
    case  'CallExpr': return ([] as ParsedSh[])
      .concat(node.Args, node.Assigns);
    case 'CaseClause': return ([] as ParsedSh[])
      .concat(node.Items, node.Word);
    case 'CaseItem': return  ([] as ParsedSh[])
      .concat(node.Patterns, node.StmtList);
    case 'CmdSubst': return [node.StmtList];
    case 'Comment': return [];
    case 'CoprocClause': return [node.Stmt];
    case 'DblQuoted': return node.Parts;
    case 'DeclClause': return ([] as ParsedSh[])
        .concat(node.Assigns, node.Opts, node.Variant, node.others);
    case 'ExtGlob': return [];
    case 'File': return [node.StmtList];
    case 'ForClause': return [node.Do, node.Loop];
    case 'FuncDecl': return [node.Body, node.Name];
    case 'IfClause': return [
      node.Cond,
      node.Then,
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
    case 'ProcSubst': return [node.StmtList];
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
    case 'StmtList': return node.Stmts;
    case 'Subshell': return [node.StmtList];
    case 'TestClause': return [node.X];
    case 'TimeClause': return [
      ...node.Stmt ? [node.Stmt] : [],
    ];
    case 'UnaryArithm':
    case 'UnaryTest': return [node.X];
    case 'WhileClause': return [node.Cond, node.Do];
    case 'Word': return node.Parts;
    case 'WordIter': return node.Items;
    default: throw testNever(node);
  }
}

export function traverse(node: ParsedSh, act: (node: ParsedSh) => void) {
  act(node);
  getChildren(node).forEach(child => traverse(child, act));
}

export function withParents<T extends ParsedSh>(root: T) {
  traverse(root, (node) => {
    getChildren(node).forEach(child => (child as BaseNode).parent = node);
  });
  return root;
}

/**
 * Given interactive input to shell, interpret escape sequences.
 * TODO Refactor as single pass of string.
 */
export function interpretEscapeSequences(input: string): string {
  const value = JSON.stringify(input)
    // Unicode utf-16 e.g. '\\\\u001b' -> '\\u001b'.
    .replace(/\\\\u([0-9a-f]{4})/g, '\\u$1')
    // Replace double backslashes by their unicode.
    .replace(/\\\\\\\\/g, '\\u005c')
    // '\\\\e' -> '\\u001b'.
    .replace(/\\\\e/g, '\\u001b')
    // Hex escape-code (0-255) e.g. '\\\\x1b' -> '\\u001b'.
    .replace(/\\\\x([0-9a-f]{2})/g, '\\u00$1')
    // e.g. '\\\\n' -> '\\n'.
    .replace(/\\\\([bfnrt])/g, '\\$1')
    // Vertical tab '\\\\v' -> '\u000b'
    .replace(/\\\\v/g, '\\u000b')
    // Alert/Bell '\\\\a' -> '\u0007'
    .replace(/\\\\a/g, '\\u0007')
    // Octal escape-code (0-255) e.g. '\\\\047' -> '\\u0027'.
    // - Out-of-bounds become `?`.
    .replace(/\\\\([0-7]{3})/g,
      (_, submatch) => {
        const decimal = parseInt(submatch, 8);
        return decimal < 256
          ? `\\u00${decimal.toString(16)}`
          : '?';
      });

  return JSON.parse(value) as string;
}