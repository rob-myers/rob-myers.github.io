import type * as Sh from "./parse.model";
import { last, testNever } from "model/generic.model";
import { semanticsService } from "../semantics.service";

export class SrcService {

  private onOneLine = true;

  binaryCmds(cmd: Sh.BinaryCmd): Sh.BinaryCmd[] {
    const { X, Y, Op } = cmd;
    if (X.Cmd && X.Cmd.type === 'BinaryCmd' && X.Cmd.Op === Op) {
      return [...this.binaryCmds(X.Cmd), cmd];
    } else if (Y.Cmd && Y.Cmd.type === 'BinaryCmd' && Y.Cmd.Op === Op) {
      return [cmd, ...this.binaryCmds(Y.Cmd)];
    }
    return [cmd];
  }
  
  /** Collect contiguous if-clauses. */
  private collectIfClauses(cmd: Sh.IfClause): Sh.IfClause[] {
    return cmd.Else ? [cmd, ...this.collectIfClauses(cmd.Else)] : [cmd];
  }
  
  private isBackgroundNode(node: Sh.ParsedSh) {
    return node.type === 'Stmt' && node.Background;
  }

  public multilineSrc = (node: Sh.ParsedSh | null) => {
    this.onOneLine = false;
    const src = this.src(node)
    this.onOneLine = true;
    return src;
  }
  
  private seqSrc = (nodes: Sh.ParsedSh[], trailing = false) => {
    if (this.onOneLine) {
      const srcs = [] as string[];
      nodes.forEach((c) => srcs.push(this.src(c), this.isBackgroundNode(c) ? ' ' : '; '));
      return (trailing ? srcs : srcs.slice(0, -1)).join('');
    }
    return nodes.map(x => this.src(x)).join('\n');
  }

  /**
   * Given parse tree compute source code.
   * We ensure the source code has no newlines so it can be used as history.
   */
  src = (node: Sh.ParsedSh | null): string => {
    if (!node) {
      return '';
    }
    switch (node.type) {
      case 'ArithmCmd':
        return `(( ${this.src(node.X)} ))`;
      case 'BinaryCmd': {
        const cmds = this.binaryCmds(node);
        const stmts = [cmds[0].X].concat(cmds.map(({ Y }) => Y));
        return stmts.map(c => this.src(c)).join(` ${node.Op}${
          !this.onOneLine && node.Op !== '|' ? '\r\n' : ''
        } `);
      }

      case 'BinaryArithm': {
        if (typeof node.number === 'number') return `${node.number}`;
        return [node.X, node.Y].map(c => this.src(c)).join(`${node.Op}`);
      }
      case 'UnaryArithm': {
        if (typeof node.number === 'number') return `${node.number}`;
        return node.Post ? `${this.src(node.X)}${node.Op}` : `${node.Op}${this.src(node.X)}`;
      }
      case 'ParenArithm': {
        if (typeof node.number === 'number') return `${node.number}`;
        return `(${this.src(node.X)})`;
      }
      case 'Word': {
        if (typeof node.string === 'string') return node.string;
        return node.Parts.map(c => this.src(c)).join('');
      }
      
      case 'ArrayExpr': {
        const contents = node.Elems.map(({ Index, Value }) =>
          Index ? `[${this.src(Index)}]=${this.src(Value)}` : this.src(Value));
        return `(${contents.join(' ')})`;
      }
      case 'Assign': {
        const varName = node.Name.Value;
        if (node.Array) {
          return `${varName}=${this.src(node.Array)}`;
        } else if (node.Index) {
          return `${varName}[${this.src(node.Index)}]${
            node.Append ? '+' : ''
          }=${this.src(node.Value)}`;
        }
        return `${varName}${node.Append ? '+' : ''}=${this.src(node.Value || null)}`;
      }

      case 'Block': {
        const { Stmts } = node;
        // Handle `{ echo foo & }`
        const terminal = this.isBackgroundNode(last(Stmts)!) ? '' : ';';
        if (this.onOneLine) {
          return `{ ${ this.seqSrc(Stmts) }${terminal} }`;
        } else {
          return `{\n${
            this.seqSrc(Stmts).split('\n').map(x => `  ${x}`).join('\n')
          }\n}`;
        }
      }

      case 'CallExpr':
        return [
          node.Assigns.map(c => this.src(c)).join(' '),
          node.Args.map(c => this.src(c)).join(' '),
        ].filter(Boolean).join(' ');

      case 'Stmt':
        return [

          node.Negated && '!',
          this.src(node.Cmd),
          node.Redirs.map(c => this.src(c)).join(' '),
          node.Background && '&',
        ].filter(Boolean).join(' ');

      case 'CaseClause': {
        const cases = node.Items.map(({ Patterns, Op, Stmts }) => ({
          globs: Patterns,
          terminal: Op,
          child: Stmts,
        }));
        return [
          'case',
          this.src(node.Word),
          'in',
          cases.flatMap(({ child, globs, terminal }) => [
            `${globs.map(g => this.src(g)).join(' | ')})`,
            this.seqSrc(child),
            terminal,
          ]).join(' '),
          'esac'
        ].filter(Boolean).join(' ');
      }

      case 'CoprocClause':
        return [
          'coproc',
          node.Name?.Value,
          this.src(node.Stmt),
        ].filter(Boolean).join(' ');

      case 'DeclClause':
        // Needs clarification
        return [
          node.Variant,
          node.Opts.map(c => this.src(c)).join(' '),
          node.Assigns.map(c => this.src(c)).join(' '),
          node.others.map(c => this.src(c)).join(' '),
        ].filter(Boolean).join(' ');

      case 'ArithmExp':
        return `${
          /**
           * TODO get type below correct
           * Have (( foo )) iff parent is 'compound'
           */
          node.parent?.type  === 'Stmt' ? '' : '$'
        }(( ${this.src(node.X)} ))`;

      case 'CmdSubst':
        return `$( ${this.seqSrc(node.Stmts)} )`;

      case 'DblQuoted':
        return `"${node.Parts.map(c => this.src(c)).join('')}"`;

      case 'ExtGlob':
        return node.Pattern.Value.replace(/\n/g, ''); // ignore newlines

      // Literals inside heredocs are handled earlier
      case 'Lit': {
        const value = node.Value.replace(/\\\n/g, '');
        if (node.parent?.type === 'DblQuoted') {// Need $$ for literal $
          return value.replace(/\n/g, '\r\n');
        }
        return node.Value;
      }

      // Unhandled cases are viewed as vanilla case
      case 'ParamExp': {
        if (node.Exp?.Op === ':-') {
          return `\${${node.Param.Value}:-${this.src(node.Exp.Word)}}`;
        }
        return `\${${node.Param.Value}}`;
      }

      case 'ProcSubst': {
        const dir = node.Op === '<(' ? '<' : '>';
        return `${dir}( ${this.seqSrc(node.Stmts)} )`;
      }

      case 'SglQuoted': {
        const inner = node.Value.replace(/\n/g, '');
        return `${node.Dollar ? '$' : ''}'${inner}'`;
      }
        
      case 'FuncDecl':
        return `${node.Name.Value}() ${this.src(node.Body)}`;
      
      case 'IfClause': {
        return this.collectIfClauses(node).map(({ Cond, Then }, i) =>
          Cond.length
            ? `${!i ? 'if' : 'elif'} ${this.seqSrc(Cond)}; then ${this.seqSrc(Then)}; `
            : `else ${this.seqSrc(Then)}; `
        ).concat('fi').join('');
      }

      case 'LetClause':
        return `let ${node.Exprs.map(c => this.src(c)).join(' ')}`;

      case 'Redirect': {
        const def = semanticsService.transpileRedirect(node);

        switch (def.subKey) {
          case '>':
            return `${def.fd || ''}${def.mod === 'append' ? '>>' : def.mod ? '>&' : '>'}${
              this.src(node.Word) }${def.mod === 'move' ? '-' : ''}`;
          default:
            throw testNever(def as never);
        }
      }

      case 'File':
        return this.seqSrc(node.Stmts);

      case 'Subshell':
        return `( ${
          node.Stmts.map(c => this.src(c)).join('; ')
        } )`;

      case 'TestClause':
        return `[[ ${this.src(node.X)} ]]`;

      case 'BinaryTest':
        return [node.X, node.Y].map(c => this.src(c)).join(` ${node.Op} `);
      case 'UnaryTest':
        return `${node.Op} ${this.src(node.X)}`;
      case 'ParenTest':
        return `(${this.src(node.X)})`;

      case 'TimeClause':
        return `time ${node.PosixFormat ? '-p ' : ''}${this.src(node.Stmt)}`;

      case 'ForClause': {
        const { Do, Loop } = node;
        if (Loop.type === 'CStyleLoop') {
          return `for (( ${
            this.src(Loop.Init)
          }; ${
            this.src(Loop.Cond)
          }; ${
            this.src(Loop.Post)
          } )); do ${
            this.seqSrc(Do, true)
          }done`;
        }
        return `for ${Loop.Name.Value} in ${
          Loop.Items.map(c => this.src(c)).join(' ')
        }; do ${
          this.seqSrc(Do, true)
        }done`;
      }

      case 'WhileClause': {
        return `${node.Until ? 'until' : 'while'} ${this.seqSrc(node.Cond, true)}do ${
          this.seqSrc(node.Do, true)
        }done`;
      }

      // Unreachable
      case 'CStyleLoop':
      case 'Comment':
      case 'WordIter':
      case 'ArrayElem':
      case 'CaseItem':
        return '';

      default:
        throw testNever(node);
    }
  }

}

export const srcService = new SrcService;
