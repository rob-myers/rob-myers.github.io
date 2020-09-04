import { testNever, last } from "@model/generic.model";
import * as Sh from "./parse.service";
import { ParamType } from "./parameter.model";

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
    case 'Block': return [node.StmtList];
    case 'CStyleLoop': return [node.Cond, node.Init, node.Post];
    case  'CallExpr': return ([] as Sh.ParsedSh[])
      .concat(node.Args, node.Assigns);
    case 'CaseClause': return ([] as Sh.ParsedSh[])
      .concat(node.Items, node.Word);
    case 'CaseItem': return  ([] as Sh.ParsedSh[])
      .concat(node.Patterns, node.StmtList);
    case 'CmdSubst': return [node.StmtList];
    case 'Comment': return [];
    case 'CoprocClause': return [node.Stmt];
    case 'DblQuoted': return node.Parts;
    case 'DeclClause': return ([] as Sh.ParsedSh[])
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

export function traverse(node: Sh.ParsedSh, act: (node: Sh.ParsedSh) => void) {
  act(node);
  getChildren(node).forEach(child => traverse(child, act));
}

export function withParents<T extends Sh.ParsedSh>(root: T) {
  traverse(root, (node) => {
    getChildren(node).forEach(child => (child as Sh.BaseNode).parent = node);
  });
  return root;
}

export function binaryCmds(cmd: Sh.BinaryCmd): Sh.BinaryCmd[] {
  const { X, Y, Op } = cmd;
  if (X.Cmd && X.Cmd.type === 'BinaryCmd' && X.Cmd.Op === Op) {
    return [...binaryCmds(X.Cmd), cmd];
  } else if (Y.Cmd && Y.Cmd.type === 'BinaryCmd' && Y.Cmd.Op === Op) {
    return [cmd, ...binaryCmds(Y.Cmd)];
  }
  return [cmd];
}

/**
 * Given parse tree, compute source code.
 * The source code has no newlines so it can be used as history.
 */
export function src(node: Sh.ParsedSh | null): string {
  if (!node) {
    return '';
  }
  switch (node.type) {
    case 'BinaryCmd': {
      const cmds = binaryCmds(node);
      const stmts = [cmds[0].X].concat(cmds.map(({ Y }) => Y));
      return stmts.map(c => src(c)).join(` ${node.Op} `);
    }

    case 'BinaryArithm':
      return [node.X, node.Y].map(c => src(c)).join(` ${node.Op} `);
    case 'UnaryArithm':
      return node.Post ? `${src(node.X)}${node.Op}` : `${node.Op}${src(node.X)}`;
    case 'ParenArithm':
      return `(${src(node.X)})`;
    case 'Word':
      return node.Parts.map(c => src(c)).join('');
    
    case 'ArrayExpr': {
      const contents = node.Elems.map(({ Index, Value }) =>
        Index ? `[${src(Index)}]=${src(Value)}` : src(Value));
      return `(${contents.join(' ')})`;
    }
    case 'Assign': {
      const varName = node.Name.Value;
      if (node.Array) {
        return `${varName}=${src(node.Array)}`;
      } else if (node.Index) {
        return `${varName}[${src(node.Index)}]${
          node.Append ? '+' : ''
        }=${src(node.Value)}`;
      }
      return `${varName}${node.Append ? '+' : ''}=${src(node.Value || null)}`;
    }

    case 'Block': {
      const { Stmts } = node.StmtList;
      // Handle `{ echo foo & }`
      const terminal = isBackgroundNode(last(Stmts)!) ? '' : ';';
      return `{ ${ seqSrc(Stmts) }${terminal} }`;
    }

    case 'CallExpr': //  TODO ?
      return [
        node.Assigns.map(c => src(c)).join(' '),
        node.Args.map(c => src(c)).join(' '),
      ].filter(Boolean).join(' ');

    case 'Stmt':
      return [
        node.Negated && '!',
        src(node.Cmd),
        node.Redirs.map(c => src(c)).join(' '),
        node.Background && '&',
      ].filter(Boolean).join(' ');

    case 'CaseClause': {
      const cases = node.Items.map(({ Patterns, Op, StmtList }) => ({
        globs: Patterns,
        terminal: Op,
        child: StmtList,
      }));
      return [
        'case',
        src(node.Word),
        'in',
        cases.map(({ child, globs, terminal }) => [
          `${globs.map(g => src(g)).join('|')})`,
          src(child),
          terminal,
        ].join(' ')),
      ].filter(Boolean).join(' ');
    }

    case 'CoprocClause':
      return [
        'coproc',
        node.Name?.Value,
        src(node.Stmt),
      ].filter(Boolean).join(' ');

    case 'DeclClause':
      // Needs clarification
      return [
        node.Variant,
        node.Opts.map(c => src(c)).join(' '),
        node.Assigns.map(c => src(c)).join(' '),
        node.others.map(c => src(c)).join(' '),
      ].filter(Boolean).join(' ');

    case 'ArithmExp':
      return `${
        /**
         * TODO get type below correct
         * Have (( foo )) iff parent is 'compound'
         */
        node.parent?.type  === 'Stmt' ? '' : '$'
      }(( ${src(node.X)} ))`;

    case 'CmdSubst':
      return `$( ${seqSrc(node.StmtList.Stmts)} )`;

    case 'DblQuoted':
      return `"${node.Parts.map(c => src(c)).join('')}"`;

    case 'ExtGlob':
      return node.Pattern.Value.replace(/\n/g, ''); // ignore newlines

    // Literals inside heredocs are handled earlier
    case 'Lit': {
      const parent = node.parent!;
      const value = node.Value.replace(/\\\n/g, '');
      if (node.parent?.type === 'DblQuoted') {// Need $$ for literal $
        return value.replace(/\n/g, '"$$\'\\n\'"');
      }
      return node.Value;
    }

    case 'ParamExp': {
      const def = node.paramDef!;
      const param = `${def.param}${def.index ? `[${src(def.index)}]` : ''}`;

      switch (def.parKey) {
        case ParamType.case:
          return `\${${param}${
            (def.to === 'lower' ? ',' : '^').repeat(def.all ? 2 : 1)
          }${def.pattern ? src(def.pattern) : ''}}`;
        case ParamType.default:
          return `\${${param}${def.colon ? `:${def.symbol}${src(def.alt)}` : ''}}`;
        case ParamType.keys:
          return `\${!${param}[${def.split ? '@' : '*'}]}`;
        case ParamType.length:
          return `\${${param}}${def.of === 'values' ? '[@]' : ''}`;
        case ParamType.plain:
          return `\${${param}}`;
        case ParamType.pointer:
          return `\${!${param}}`;
        case ParamType.position:
          return param.length === 1 ? `$${param}` : `\${${param}}`;
        case ParamType.remove:
          return `\${${param}${
            (def.dir === 1 ? '#' : '%').repeat(def.greedy ? 2 : 1)
          }${src(def.pattern)}}`;
        case ParamType.replace:
          return `\${${param}${def.all ? '//' : '/'}${src(def.orig)}/${src(def.with)}}`;
        case ParamType.special:
          return `$${def.param}`;
        case ParamType.substring: {
          const from = Number(src(def.from));
          const length = src(def.length);
          return `\${${param}:${from < 0 ? ' ' : ''}${from}${length ? `:${length}` : ''}}`;
        }
        case ParamType.vars:
          return `\${!${param}${def.split ? '@' : '*'}}`;
        default: throw testNever(def);
      }
    }

    case 'ProcSubst': {
      const dir = node.Op === '<(' ? '<' : '>';
      return `${dir}( ${seqSrc(node.StmtList.Stmts)} )`;
    }

    case 'SglQuoted': {
      const inner = node.Value.replace(/\n/g, '$$\'\\n\'');
      return node.Dollar ? `$'${inner}'` : inner;
    }
      
    case 'FuncDecl':
      return `${node.Name}() ${src(node.Body)}`;
    
    case 'IfClause': {
      const ifClauses = collectIfClauses(node);
      const lastIndex = ifClauses.length - 1;
      const cs = ifClauses.map(({ Cond, Pos, ThenPos, Then }, i) => ({
        test: i === lastIndex ? null : Cond,
        child: Then,
      }));
      return cs.map(({ test, child }, i) => test
        ? `${!i ? 'if' : 'elif'} ${src(test)}; then ${src(child)}; `
        : `else ${child}; `
      ).concat('fi').join('');
    }

    case 'LetClause':
      return `let ${node.Exprs.map(c => src(c)).join(' ')}`;

    case 'Redirect': {
      const def = node.redirDef!;
      switch (def.subKey) {
        case '<': {
          return `${def.fd || ''}<${def.mod ? '&' : ''}${src(node.Word) }${
            def.mod === 'move' ? '-' : ''}`;
        }
        case '>': {
          return `${def.fd || ''}${def.mod === 'append' ? '>>' : def.mod ? '>&' : '>'}${
            src(node.Word) }${def.mod === 'move' ? '-' : ''}`;
        }
        case '&>': {
          return `${def.append ? '&>>' : '&>'}${src(node.Word)}`;
        }
        /**
         * Transform heredoc to fit on 1 line.
         */
        case '<<': {
          let srcCode = src(def.here);
          if (srcCode.endsWith('\n')) {// echo will add a newline
            srcCode = srcCode.slice(0, -1);
          }
          return `${def.fd || ''}< <( echo "${srcCode.replace(/\n/g, '"$$\'\\n\'"')}" )`;
        }
        case '<<<': {
          return `${def.fd || ''}<<<${src(node.Word)}`;
        }
        case '<>': {
          return `${def.fd || ''}<>${src(node.Word)}`;
        }
        default: throw testNever(def);
      }
    }

    case 'File':
      return src(node.StmtList);

    case 'StmtList':
      // Handle `echo foo & echo bar`
      return seqSrc(node.Stmts);

    case 'Subshell':
      return `( ${
        node.StmtList.Stmts.map(c => src(c)).join('; ')
      } )`;

    case 'TestClause':
      return `[[ ${src(node.X)} ]]`;

    case 'BinaryTest':
      return [node.X, node.Y].map(c => src(c)).join(` ${node.Op} `);
    case 'UnaryTest':
      return `${node.Op} ${src(node.X)}`;
    case 'ParenTest':
      return `(${src(node.X)})`;

    case 'TimeClause':
      return `time ${node.PosixFormat ? '-p ' : ''}${src(node.Stmt)}`;

    case 'ForClause': {
      const { Do, Loop } = node;
      if (Loop.type === 'CStyleLoop') {
        return `for (( ${
          src(Loop.Init)
        }; ${
          src(Loop.Cond)
        }; ${
          src(Loop.Post)
        } )); do ${
          seqSrc(Do.Stmts, true)
        }done`;
      }
      return `for ${Loop.Name} in ${
        Loop.Items.map(c => src(c)).join(' ')
      }; do ${
        seqSrc(Do.Stmts, true)
      }done`;
    }

    case 'WhileClause': {
      return `while ${seqSrc(node.Cond.Stmts, true)}do ${
        seqSrc(node.Do.Stmts, true)
      }done`;
    }

    // Unreachable
    case 'CStyleLoop':
    case 'Comment':
    case 'WordIter':
    case 'ArrayElem':
    case 'CaseItem':
    case 'ArithmCmd': // <== ?
      return '';

    default:
      throw testNever(node);
  }
}

/**
 * Collect contiguous if-clauses.
 */
function collectIfClauses(cmd: Sh.IfClause): Sh.IfClause[] {
  return cmd.Else ? [cmd, ...collectIfClauses(cmd.Else)] : [cmd];
}

function isBackgroundNode(node: Sh.ParsedSh) {
  return node.type === 'Stmt' && node.Background;
}

function seqSrc(nodes: Sh.ParsedSh[], trailing = false) {
  const srcs = [] as string[];
  nodes.forEach((c) => srcs.push(src(c), isBackgroundNode(c) ? ' ' : '; '));
  return (trailing ? srcs : srcs.slice(0, -1)).join('');
}