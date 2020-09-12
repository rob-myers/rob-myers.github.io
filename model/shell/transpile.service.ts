import { Observable, from, of, lastValueFrom } from 'rxjs';
import { reduce, map, tap } from 'rxjs/operators';
import globrex from 'globrex';
import shortId from 'shortid';

import { testNever, last } from '@model/generic.model';
import { awaitEnd } from './rxjs.model';
import { ProcessAct, Expanded, act, ArrayAssign } from './process.model';
import { ParamType, ParameterDef } from './parameter.model';
import * as Sh from '@model/shell/parse.service';
import { expandService as expand, expandService } from './expand.service';
import { varService as vs } from './var.service';
import { processService as ps } from './process.service';
import {  RedirectDef } from './file.model';
import { builtinService as bs } from './builtin.service';
import { srcService as ss } from './src.service';
import { NamedFunction } from './var.model';

class TranspileShService {

  transpile(parsed: Sh.File): Observable<ProcessAct> {
    const transpiled = this.File(parsed);
    console.log('TRANSPILED', transpiled);
    return transpiled;
  }

  /**
   * (( x = y / 2 , z = x * y ))
   */
  private ArithmCmd(node: Sh.ArithmCmd): Observable<Expanded> {    
    return from(async function* () {
      await ts.runArithmExpr(node.X);
      // Exit code 0 iff `input.number` is a non-zero integer
      node.exitCode = node.number && Number.isInteger(node.number) ? 0 : 1;
      yield act.expanded(`${node.number || 0}`);
    }());
  }

  /**
   * y=$(( 2 ** x ))
   */
  private ArithmExp(node: Sh.ArithmExp): Observable<Expanded> {
    return this.ArithmCmd(node as unknown as Sh.ArithmCmd);
  }

  /**
   * $(( x * y ))
   * $(( 2 * (x + 1) )),
   * (( x++ ))
   * x[1 + "2$i"]=y.
   */
  private ArithmExpr(node: Sh.ArithmExpr): Observable<Expanded> {
    const { pid } = node.meta;

    switch (node.type) {
      case 'BinaryArithm':
        return from(async function* () {
          if (node.Op === '?') {
            /**
             * Ternary i.e. `x ? y : z`.
             */
            const [left, other] = [node.X, node.Y as Sh.BinaryArithm];
            await ts.runArithmExpr(left); // Mutates input.number
            const right = node.number ? other.X : other.Y;
            await ts.runArithmExpr(right);
          } else {
            /**
             * Binary.
             */
            const [left, right] = [node.X, node.Y];
            await ts.runArithmExpr(left);
            const lNum = node.number!
            const lStr = node.string!;
            await ts.runArithmExpr(right);
            const rNum = node.number!

            switch (node.Op) {
              case '<': node.number = (lNum < rNum) ? 1 : 0; break;
              case '<=': node.number = (lNum <= rNum) ? 1 : 0; break;
              case '>': node.number = (lNum > rNum) ? 1 : 0; break;
              case '>=': node.number = (lNum >= rNum) ? 1 : 0; break;
              case '*': node.number = lNum * rNum; break;
              case '**': node.number = Math.pow(lNum, rNum); break;
              case '==': node.number = (lNum === rNum) ? 1 : 0; break;
              case '+=':
              case '-=':
              case '*=':
              case '/=':
              case '%=':
              case '&=':
              case '|=':
              case '^=':
              case '<<=':
              case '>>=':
              {
                switch (node.Op) {
                  case '+=': node.number = lNum + rNum; break;
                  case '-=': node.number = lNum - rNum; break;
                  case '*=': node.number = lNum * rNum; break;
                  case '/=': node.number = lNum / rNum; break;
                  case '%=': node.number = lNum % rNum; break;
                  case '&=': node.number = lNum & rNum; break;
                  case '|=': node.number = lNum | rNum; break;
                  case '^=': node.number = lNum ^ rNum; break;
                  case '<<=': node.number = lNum << rNum; break;
                  case '>>=': node.number = lNum >> rNum; break;
                  default: throw testNever(node.Op);
                }
                // Update variable
                vs.assignVar(pid, {
                  shell: true,
                  integer: true,
                  varName: lStr,
                  value: String(node.number),
                });
                break;
              }
              case '+': node.number = lNum + rNum; break;
              case '-': node.number = lNum - rNum; break;
              // Ternary '?' handled earlier.
              // Also arises in test expressions.
              case '=': {// Assign.
                node.number = rNum;
                vs.assignVar(pid, {
                  shell: true,
                  integer: true,
                  varName: lStr,
                  value: String(node.number),
                });                  
                // true <=> assigned value non-zero.
                // exitCode = Number.isInteger(this.value) && this.value ? 0 : 1;
                break;
              }
              case '%': node.number = lNum % rNum; break;
              case '^': node.number = lNum ^ rNum; break;
              case ',': node.number = rNum; break;
              case '/': node.number = Math.floor(lNum / rNum); break;
              /**
               * TODO
               */
              default: {
                // yield this.exit(2, `${def.symbol}: unrecognised binary arithmetic symbol`);
                // return;
                throw new ShError(`${node.Op}: unrecognised binary arithmetic symbol`, 2);
              }
            }
            node.string = `${node.number}`;
            node.exitCode = node.number ? 0 : 1;
          }
        }());
      case 'ParenArithm':
        // NOTE cannot pipe into tap because ts.ArithmExpr may be empty
        return from(async function* () {
          await awaitEnd(ts.ArithmExpr(node.X));
          node.string = node.X.string;
          node.number = node.X.number;
        }());
      case 'UnaryArithm':
        return from(async function* () {
          /**
           * Unary.
           */
          const child = node.X;
          await ts.runArithmExpr(child); // Mutates input.number
          const childNum = node.number!;
          const childStr = node.string!;

          switch (node.Op) {
            case '!': node.number = childNum ? 0 : 1; break;
            case '~': node.number = ~childNum; break;
            case '-': node.number = -childNum; break;
            case '+': node.number = childNum; break;
            case '++':
            case '--':
            {
              switch (node.Op) {
                case '++': node.number = childNum + 1; break;
                case '--': node.number = childNum - 1; break;
                default: throw testNever(node.Op);
              }
              vs.assignVar(pid, {
                shell: true,
                integer: true,
                varName: childStr,
                value: String(node.number),
              });
              /**
               * If unary operator is:
               * - postfix: then exit 1 <=> error or prev value zero.
               * - prefix: then exit 1 <=> error or next value zero.
               */
              node.exitCode = node.Post
                ? (Number.isInteger(childNum) && childNum) ? 0 : 1
                : (Number.isInteger(node.number) && node.number) ? 0 : 1;
              break;
            }
            default: {
              throw new ShError(`${node.Op}: unsupported unary arithmetic symbol`, 2);
            }
          }
        }());
      case 'Word':
        return this.Expand(node);
      default:
        throw testNever(node);
    }
  }

  private ArrayExpr({ Elems }: Sh.ArrayExpr): Observable<ArrayAssign> {
    return from(
      async function* () {
        const output = act.arrayAsgn([], false);
        let associative = false;
        for (const { Index, Value } of Elems){
          const key = Index ? (await lastValueFrom(ts.ArithmExpr(Index))).value : null;
          const { values } = await lastValueFrom(ts.Expand(Value));
          output.pairs.push(...values.map(value => ({ key, value })));
          associative = associative || isNaN(Number(key));
        }
        output.associative = associative;
        // console.log({ output });
        yield output;
      }());
  }

  private Assign({
    Name, Value, Append, Array: ArrayNode, Index, Naked,
    meta, declOpts = {},
  }: Sh.Assign): Observable<ProcessAct> {
    const { pid } = meta
    const varName = Name.Value;

    if (ArrayNode) {
      return from(async function* () {
        const { pairs, associative: assoc } = await lastValueFrom(ts.ArrayExpr(ArrayNode));
        const associative = declOpts.associative || assoc;

        if (associative) {
          /**
           * Associative array via `declare -A` or e.g. x=([a]=b)
           * We also forward associative flag.
           */
          const value = {} as Record<string, string | number>;
          for (const { key, value: v } of pairs) {
            if (!key) {
              ps.warn(pid, `${varName}: ${v}: must use subscript when assigning associative array`);
            } else {
              value[key] = declOpts.integer ? parseInt(v) || 0 : v;
            }
          }
          vs.assignVar(pid, { ...declOpts, associative, varName, shell: true, value });
        } else {
          /**
           * Vanilla array.
           */
          const values = [] as (string[] | number[]);
          let index = 0;
          pairs.map(({ key, value }) => {
            index = key ? (parseInt(key) || 0) : index;
            values[index] = declOpts.integer ? parseInt(value) || 0 : value;
            index++;
          });

          if (Append) {
            const prevValue = vs.lookupVar(pid, varName)
              .map(declOpts.integer ? Number : String);
            Array.isArray(prevValue) && (values as any[]).unshift(...prevValue);
          }

          vs.assignVar(pid, { ...declOpts, varName, shell: true, value: values });
        }
      }());
    } else if (Index) {
      return from(async function* () {
        // Run index
        const { value: index } = await lastValueFrom(ts.ArithmExpr(Index))
        // Unsure if naked is possible here
        const value = Naked
          ? undefined
          : Value
            ? (await lastValueFrom(ts.Expand(Value))).value
            : ''; // If {x[i]=} then no def.value so use ''
        vs.assignVar(pid, { ...declOpts, varName, shell: true, index, value });
      }());
    } else {
      /**
       * `x=foo` and also `declare -a x` and `declare -a x=foo`
       */
      return from(async function* () {
        /**
         * Naked if e.g. declare -i x.
         * Use `undefined` so we don't overwrite.
         */
        const value = Naked ? undefined
          : Value ? await lastValueFrom(ts.Expand(Value).pipe(
              reduce((agg, { values }) => agg.concat(values), [] as string[]),
              map((x) => x.join(' ')),
            ))
          : '';

        if (declOpts.array) {// declare -a x
          vs.assignVar(pid, { ...declOpts, varName, shell: true, value: value == null ? [] : [value] });
        } else if (declOpts.associative) {// declare -A x
          vs.assignVar(pid, { ...declOpts, varName, shell: true, value: value == null ? {} : { 0: value }  });
        } else {// x=foo or x+=foo
          vs.assignVar(pid, {
            ...declOpts,
            varName,
            shell: true,
            value,
            append: Append,
          });
        }
      }());
    }
  }

  private BinaryCmd(node: Sh.BinaryCmd) {
    /** All contiguous binary cmds for same operator */
    const cmds = ss.binaryCmds(node);
    /**
     * Restrict to leaves of binary expression, assuming expression
     * originally left-biased e.g. (((A * B) * C) * D) * E
     */
    const stmts = [cmds[0].X].concat(cmds.map(({ Y }) => Y));

    return from(async function*() {
      switch (node.Op) {
        case '&&': {
          // Assume thrown errors already caught
          for (const stmt of stmts) {
            await awaitEnd(ts.Stmt(stmt));
            node.exitCode = stmt.exitCode;
            if (node.exitCode) {
              break;
            }
          }
          break;
        }
        case '||': {
          // Assume thrown errors already caught
          for (const stmt of stmts) {
            await awaitEnd(ts.Stmt(stmt));
            node.exitCode = stmt.exitCode;
            if (node.exitCode === 0) {
              break;
            }
          }
          break;
        }
        case '|': {
          const background = !ps.isInteractiveShell(node);
          const spawns = stmts.map(stmt => ps.spawnProcess(node.meta.pid, stmt, background));
          const transpiles = spawns.map(({ parsed }) => ts.transpile(parsed));
          // const uid = shortId.generate();
          // const wires = spawns.slice(0, -1).map(i => fileService.makeWire(`/tmp/${uid}.${i}`));
          // wires.forEach((wire, i) => {
          //   ps.openFile(spawns[i].pid, { path: wire.key, fd: 1, mode: 'WRONLY' });
          //   ps.openFile(spawns[i + 1].pid, { path: wire.key, fd: 0, mode: 'RDONLY' });
          // });

          try {
            await Promise.all(transpiles.map(awaitEnd));
          } finally {
            ps.removeProcesses(spawns.map(({ pid }) => pid));  
            // wires.forEach(({ key }) => fileService.unlinkFile(key));
          }
          break;
        }
        default:
          throw new ShError(`binary command ${node.Op} unsupported`, 2);
      }

      ps.setExitCode(node.meta.pid, node.exitCode || 0);
    }());
  }

  private Block(node: Sh.Block) {
    return this.stmts(node, node.Stmts);
  }

  private CallExpr(node: Sh.CallExpr, extend: CommandExtension): Observable<ProcessAct> {
    return from(async function* () {
      node.exitCode = 0;
      const pid = node.meta.pid;
      const args = await ts.performShellExpansion(node.Args);
      console.log('args', args);
      
      try {
        const [command, ...cmdArgs] = args;
        let func: NamedFunction;
        ps.pushRedirectScope(pid);
        await ts.applyRedirects(node, extend.Redirs);

        if (args.length) {
          if (bs.isBuiltinCommand(command)) {
            // Run builtin
            await bs.runBuiltin(node, command, cmdArgs);
          } else if (func = vs.getFunction(pid, command)) {
            // Run function with local variables
            try {
              vs.pushVarScope(pid);
              await ts.assignVars(node, true);
              await ps.invokeFunction(pid, func, cmdArgs);
            } finally {
              vs.popVarScope(pid);
            }
          } else {
            throw new ShError(`${command}: command not found`, 127);
          }
        } else {
          // Assign vars in this process
          await ts.assignVars(node);
        }
      } catch (e) {
        ts.handleShError(node, e);
        node.parent!.exitCode = node.exitCode;
      } finally {
        ps.popRedirectScope(pid);
      }
    }());
  }

  /**
   * Construct a simple command (CallExpr), or a compound command.
   */
  private Command(node: null | Sh.Command, extend: CommandExtension): Observable<ProcessAct> {
    if (!node) {
      return this.unsupportedNode(extend.Redirs[0], 'pure redirects are unsupported');
    } else if (node.type === 'CallExpr') {
      // Run simple command
      return this.CallExpr(node, extend);
    }

    // Run compound command
    return from(async function*() {
      let cmd: Observable<ProcessAct> = null as any;
      node.exitCode = 0;
      const { Redirs, background, negated } = extend;

      try {
        switch (node.type) {
          case 'ArithmCmd': cmd = ts.ArithmCmd(node); break;
          case 'BinaryCmd': cmd = ts.BinaryCmd(node); break;
          case 'Block': cmd = ts.Block(node); break;
          // case 'CaseClause': child = this.CaseClause(Cmd); break;
          // case 'CoprocClause': {
          //   /**
          //    * TODO
          //    */
          //   child = this.CoprocClause(Cmd);
          //   break;
          // }
          case 'DeclClause': cmd = ts.DeclClause(node); break;
          // case 'ForClause': child = this.ForClause(Cmd); break;
          case 'FuncDecl': cmd = ts.FuncDecl(node); break;
          // case 'IfClause': child = this.IfClause(Cmd); break;
          // case 'LetClause': child = this.LetClause(Cmd); break;
          // case 'Subshell': child = this.Subshell(Cmd); break;
          // case 'TestClause': child = this.TestClause(Cmd); break;
          // case 'TimeClause': child = this.TimeClause(Cmd); break;
          // case 'WhileClause': child = this.WhileClause(Cmd); break;
          // default: throw testNever(Cmd);
          default: return;
        }
  
        if (background) {
          // TODO
          // yield* this.runInBackground(dispatch, processKey);
        } else {
          // TODO apply/remove redirections
          const redirects = Redirs.map((x) => ts.Redirect(x));
          await awaitEnd(cmd);
        }
      } catch (e) {
        ts.handleShError(node, e);
      }
    }());
  }

  /**
   * TODO first simplify/generalise variable handling,
   * i.e. permit arbitrary js objects.
   */
  private DeclClause(node: Sh.DeclClause) {
    switch (node.Variant.Value) {
      case 'declare': {
        return of();
        // return new DeclareBuiltin({ ...base, builtinKey: BuiltinOtherType.declare });
      }
      case 'export': {
        return of();
        // return new ExportBuiltin({ ...base, builtinKey: BuiltinSpecialType.export });
      }
      case 'local': {
        return of();
        // return new LocalBuiltin({ ...base, builtinKey: BuiltinOtherType.local });
      }
      case 'readonly': {
        return of();
        // return new ReadonlyBuiltin({ ...base, builtinKey: BuiltinSpecialType.readonly });
      }
      case 'typeset': {
        return of();
        // return new TypesetBuiltin({ ...base, builtinKey: BuiltinOtherType.typeset });
      }
      case 'nameref': // TODO
        return of();
      default:
        throw testNever(node.Variant.Value);
    }

  }

  /**
   * Expand a `Word`, which has `Parts`.
   */
  private Expand(node: Sh.Word): Observable<Expanded> {
    if (node.Parts.length > 1) {
      return from(async function*() {
        // Compute each part, storing flat result in node
        for (const wordPart of node.Parts) {
          const { value } = await lastValueFrom(ts.ExpandPart(wordPart));
          wordPart.string = value;
        }
        /*
        * Is the last value computed via a parameter/command-expansion,
        * and if so does it have trailing whitespace?
        */
        let lastTrailing = false;
        const values = [] as string[];

        for (const { type, string } of node.Parts) {
          const value = string!;
          if (type === 'ParamExp' || type === 'CmdSubst') {
            const vs = expandService.normalizeWhitespace(value!, false);// Do not trim
            // console.log({ value, vs });
            if (!vs.length) {
              continue;
            } else if (!values.length || lastTrailing || /^\s/.test(vs[0])) {
              // Freely add, although trim 1st and last
              values.push(...vs.map((x) => x.trim()));
            } else {
              // Either `last(vs)` a trailing quote, or it has no trailing space
              // Since vs[0] has no leading space we must join words
              values.push(values.pop() + vs[0].trim());
              values.push(...vs.slice(1).map((x) => x.trim()));
            }
            // Check last element (pre-trim)
            lastTrailing = /\s$/.test(last(vs) as string);
          } else if (!values.length || lastTrailing) {// Freely add
            values.push(value);
            lastTrailing = false;
          } else {// Must join
            values.push(values.pop() + value);
            lastTrailing = false;
          }
        }

        node.string = values.join(' '); // If part of ArithmExpr?
        yield act.expanded(values); // Need array?
      }());
    }
    return this.ExpandPart(node.Parts[0]).pipe(
      tap(({ value }) => node.string = value),
    );
  }

  private ExpandPart(node: Sh.WordPart): Observable<Expanded> {
    switch (node.type) {
      case 'ArithmExp':
        return this.ArithmExp(node);
      case 'CmdSubst': {
        return from(async function*() {
          const pid = node.meta.pid;
          const output = [] as string[];

          ps.pushRedirectScope(pid);
          const opened = ps.openFile(pid, { path: `/dev/cs/${pid}`, fd: 1 });
          const stopListening = opened.file.listen((msg) => output.push(vs.toStringOrJson(msg)));

          try {
            const transpiles = node.Stmts.map(stmt => ts.Stmt(stmt));
            for (const transpiled of transpiles) {
              await awaitEnd(transpiled);
            }
          } finally {
            stopListening();
            ps.popRedirectScope(pid); // Should close `opened`
          }

          yield act.expanded(output.join('\n').replace(/\n*$/, ''));
        }());
      }
      case 'DblQuoted':
        return from(async function*() {
          const output = [] as string[];

          for (const part of node.Parts) {
            const result = await lastValueFrom(ts.ExpandPart(part));
            if (ts.isSpecialParamExp(part)) {
              output.push(`${output.pop() || ''}${result.values[0] || ''}`, ...result.values.slice(1));
            } else {
              output.push(`${output.pop() || ''}${result.value || ''}`);
            }
          }

          yield act.expanded(output);
        }());
      case 'ExtGlob':
        return of(act.expanded([''])); // TODO
      case 'Lit':
        return of(act.expanded(expand.literal(node)));
      case 'ParamExp':
        return this.ParamExp(node);
      // case 'ProcSubst': {
      //   const { Pos, End, StmtList, Op, Rparen } = input;
      //   return new ProcessExpand({
      //     key: CompositeType.expand,
      //     expandKey: ExpandType.process,
      //     dir: Op === '<(' ? '<' : '>',
      //     cs: StmtList.Stmts.map((Stmt) => this.Stmt(Stmt)),
      //     sourceMap: this.sourceMap({ Pos, End },
      //       { key: 'right-bracket', pos: Rparen }),
      //     // Trailing comments only.
      //     comments: StmtList.Last.map<TermComment>(({ Hash, End, Text }) => ({
      //       sourceMap: this.sourceMap({ Pos: Hash, End }),
      //       text: Text,
      //     })),
      //   });
      // }
      case 'SglQuoted':
        return of(act.expanded(expand.singleQuotes(node)));
      // default: throw testNever(input);
      default:
        throw Error(`${node.type} unimplemented`);
    }
  }

  private File(node: Sh.File): Observable<ProcessAct> {
    return from(async function*() {
      try {
        await awaitEnd(ts.stmts(node, node.Stmts));
      } catch (e) {
        ts.handleShError(node, e);
      } 
    }());
  }

  private stmts(parent: Sh.ParsedSh, nodes: Sh.Stmt[]) {
    return from(async function*() {
      for (const node of nodes) {
        await awaitEnd(ts.Stmt(node));
        parent.exitCode = node.exitCode;
      }
      ps.setExitCode(parent.meta.pid, parent.exitCode || 0);
    }());
  }

  private FuncDecl(node: Sh.FuncDecl) {
    return from(async function*() {
      const func = vs.getFunction(node.meta.pid, node.Name.Value);
      if (func?.readonly) {
        throw new ShError(`${node.Name.Value}: readonly function`, 1);
      }
      const clonedBody = Sh.parseSh.clone(node.Body);
      const wrappedFile = Sh.parseSh.wrapInFile(clonedBody);
      vs.addFunction(node.meta.pid, node.Name.Value, { type: 'shell', node: wrappedFile });
    }());
  }

  private ParamExp(node: Sh.ParamExp): Observable<Expanded> {
    const { pid } = node.meta;
    const def: ParameterDef<Observable<Expanded>, Observable<Expanded>> =
      node.paramDef || this.transpileParam(node);
    node.paramDef = def; // Store in node too

    if (def.parKey === ParamType.special) {
      /**
       * Special parameters.
       */
      return from(function* () {
        switch (def.param) {
          case '@':
          case '*':
          case '#': {
            // Restrict to positive positionals
            const result = vs.getPositionals(pid);
            const posPositionals = result.slice(1);
            
            switch (def.param) {
              case '@': yield act.expanded(posPositionals); break;
              case '*': yield act.expanded(posPositionals.join(' ')); break;
              case '#': yield act.expanded(String(posPositionals.length)); break;
              default: throw testNever(def.param);
            }
            break;
          }
          case '?':
          case '-':
          case '$':
          case '!': {
            const process = ps.getProcess(pid);

            switch (def.param) {
              case '?':
                yield act.expanded(String(process.lastExitCode || 0));
                break;
              case '-': {// TODO opt flags from set?
                yield act.expanded('');
                break;
              }
              case '$': {
                if (ps.isInteractiveShell(process.parsed)) {
                  yield act.expanded(`${pid}`);
                } else {
                  const ancestralProc = ps.findAncestral(pid, ({ parsed }) => ps.isInteractiveShell(parsed))
                  yield act.expanded((ancestralProc!.pid).toString()); // Top-most process is session's shell
                }
                break;
              }
              case '!': {
                if (process.lastBgPid && ps.getProcess(process.lastBgPid)) {
                  yield act.expanded(`${process.lastBgPid}`);
                  break;
                }
                yield act.expanded(''); // Fallback
                break;
              }
              default: throw testNever(def.param);
            }
            break;
          }
          case '0': {
            yield act.expanded(vs.getPositionals(pid)[0]);
            break;
          }
          case '_': {
            yield act.expanded('behave-yr'); // TODO
            break;
          }
          default: throw testNever(def.param);
        }
      }());
    };
    /**
     * other parameters.
     */
    return from(async function* () {
      const index = def.index ? (await lastValueFrom(def.index)).value : null;
      const varValue = vs.lookupVar(pid, def.param);
      const paramValues = vs.getVarValues(index, varValue);

      switch (def.parKey) {
        /**
         * case: ${x^y}, ${x^^y}, ${x,y} or ${x,,y} (also ${x[1]^^}).
         */
        case ParamType.case: {
          const { all, to, pattern } = def;
          let re = /^.$/;// Pattern defaults to '?'
  
          if (pattern) {// Evaluate pattern and convert to RegExp
            const values = await lastValueFrom(pattern.pipe(
              reduce((agg, item) => (agg.concat(item.values)), [] as string[]),
            ));
            re = globrex(values.join(' '), { extended: true }).regex;
          }

          // Transform chars of each word.
          const transform = to === 'lower'
            ? (x: string) => x.toLowerCase()
            : (x: string) => x.toUpperCase();
          const text = paramValues.join('');
          const output = all
            ? text.split('').map((c) => re.test(c) ? transform(c) : c).join('')
            : (re.test(text[0]) ? transform(text[0]) : text[0]) + text.slice(1);
          yield act.expanded(output);
          break;
        }
        /**
         * default: ${x[:][-=?+]y} or ${x[0]:-foo}.
         */
        case ParamType.default: {
          const { alt, colon, symbol } = def;
          // If colon then applies if 'unset', or 'null' (i.e. empty-string).
          // Otherwise, only applies if unset.
          const applies = colon
            ? !paramValues.length || (paramValues.length === 1 && paramValues[0] === '')
            : !paramValues.length;
  
          switch (symbol) {
            case '-':
            case '=': {
              if (applies) {
                yield act.expanded(alt ? (await lastValueFrom(alt)).value : '');
                if (symbol === '=') {// Additionally assign to param
                  vs.assignVar(pid, { varName: def.param, shell: true, value: paramValues.join('') });
                }
              } else {
                yield act.expanded(paramValues.join(''));
              }
              break;
            }
            case '?': {
              if (applies) {
                node.exitCode = 1;
                return alt
                  ? ps.warn(pid, (await lastValueFrom(alt)).value)
                  : ps.warn(pid, `${def.param}: required but unset or null.`);
              } else {
                yield act.expanded(paramValues.join(''));
              }
              break;
            }
            case '+': {
              yield act.expanded(applies || !alt
                ? ''
                : (await lastValueFrom(alt)).value);
              break;
            }
            default: throw testNever(symbol);
          }
          break;
        }
        /**
         * keys: ${!x[@]} or ${!x[*]}.
         */
        case ParamType.keys: {
          const keys = vs.getVarKeys(varValue);
          if (def.split) {
            yield* keys.map(key => act.expanded(key));
          } else {
            yield act.expanded(keys.join(' '));
          }
          break;
        }
        /**
         * length: ${#x}, ${#x[i]}, ${#x[@]} or ${#x[*]}.
         */
        case ParamType.length: {
          const { of: Of } = def;
          if (Of === 'word') {
            // `paramValues` should be [] or ['foo'].
            yield act.expanded(String((paramValues[0] || '').length));
          } else {// of: 'values'.
            yield act.expanded(String(paramValues.length));
          }
          break;
        }
        /**
         * plain: ${x}, ${x[i]}, ${x[@]} or ${x[*]}.
         */
        case ParamType.plain: {
          // "${x[@]}" can produce multiple fields, so
          // cannot set this.value as plains.join(' ').
          if (index === '@') {
            yield act.expanded(paramValues);
          } else if (index === '*') {
            yield act.expanded(paramValues.join(' '));
          } else {
            yield act.expanded(paramValues.join(''));
          }
          break;
        }
        /**
         * pointer: ${!x} -- only basic support.
         */
        // /([a-z_][a-z0-9_])\[([a-z0-9_@*])+\]*/i
        case ParamType.pointer: {
          const nextParam = paramValues.join('');
          if (nextParam) {
            /**
             * Lookup param value without dynamic parsing.
             * Bash supports x='y[$z]'; echo ${!x};.
             * In particular, cannot point to array item.
             */
            const result = vs.lookupVar(pid, nextParam);
            yield act.expanded(vs.getVarValues(null, result).join(''));
          } else {
            yield act.expanded('');
          }
          break;
        }
        /**
         * positional: $1, $2, etc.
         */
        case ParamType.position: {
          yield act.expanded(paramValues.join(''));
          break;
        }
        /**
         * remove:
         * - prefix: ${x#y} or ${x##y}.
         * - suffix: ${x%y} or ${x%%y}.
         */
        case ParamType.remove: {
          if (def.pattern) {
            // Evaluate pattern, convert to RegExp.
            const { value } = await lastValueFrom(def.pattern);
            const baseRe = (globrex(value, { extended: true }).regex as RegExp)
              .source.slice(1, -1);// Sans ^ and $.
            // Match largest/smallest prefix/suffix.
            const regex = new RegExp(def.dir === 1
              ? (def.greedy ? `^${baseRe}.*` : `^${baseRe}.*?`)
              : (def.greedy ? `.*${baseRe}$` : `.*?${baseRe}$`));
            // Remove matching.
            yield act.expanded(paramValues.join('').replace(regex, ''));
          }
          break;
        }
        /**
         * replace: ${parameter/pattern/string}.
         * We support 'replace all' via //.
         * TODO support # (prefix), % (suffix).
         */
        case ParamType.replace: {
          const { all, orig, with: With } = def;
          const origValue = (await lastValueFrom(orig)).value;
          const subst = With
            ? (await lastValueFrom(With)).value
            : '';
          const regex = new RegExp(origValue, all ? 'g' : '');
          yield act.expanded(paramValues.join('').replace(regex, subst));
          break;
        }
        // /**
        //  * substring:
        //  * ${parameter:offset} e.g. ${x: -7}.
        //  * ${parameter:offset:length}.
        //  * Also ${@:i:j}, ${x[@]:i:j} or ${x[*]:i:j}.
        //  */
        // case ParamType.substring: {
        //   const { from, length } = def;
        //   yield* this.runChild({ child: from, ...base });
        //   const offset = parseInt(String(from.value)) || 0;
  
        //   if (length) {
        //     yield* this.runChild({ child: length, ...base });
        //   }
  
        //   const len = length
        //     ? parseInt(String(length.value)) || 0
        //     : paramValues.join(' ').length;
  
        //   if (def.param === '@' || def.param === '*') {
        //     if (len < 0) {
        //       yield this.exit(1, `${len}: substring expression < 0`);
        //     }
        //     const positionals = dispatch(osGetPositionalsThunk({ processKey })).slice();
        //     const values = from
        //       ? length
        //         ? positionals.slice(offset, offset + len)
        //         : positionals.slice(offset)
        //       : positionals.slice(1); // positive positionals
        //     this.values = def.param === '@' ? values : [values.join(' ')];
        //   } else if (index === '@' || index === '*') {
        //     if (len < 0) {
        //       yield this.exit(1, `${len}: substring expression < 0`);
        //     }
        //     const values = paramValues.slice(offset, offset + len);
        //     this.values = def.param === '@' ? values : [values.join(' ')];
        //   } else {
        //     this.value = len >= 0
        //       ? paramValues.join('').substr(offset, len)
        //       : paramValues.join('').slice(offset, len);
        //   }
        //   break;
        // }
        /**
         * variables: ${!param*} or ${!param@}.
         */
        case ParamType.vars: {
          const { split, param } = def;
          if (param.length) {
            const result = vs.findVarNames(pid, param);
            yield act.expanded(split ? result : result.join(' '));
          } else {
            yield act.expanded('');
          }
          break;
        }
        // default: throw testNever(def);
      }
      // return act.expanded([]); 
    }());
  }

  private Redirect(node: Sh.Redirect): Observable<ProcessAct> {
    const def: RedirectDef<Observable<Expanded>> = node.redirDef || this.transpileRedirect(node);
    node.redirDef = def; // Store in node too
    
    return from(async function* (){
      const { value } = await lastValueFrom(ts.Expand(node.Word));
      const { pid } = node.meta;

      /**
       * Handle duplication and moving.
       */
      switch (def.subKey) {
        case '<':
        case '>': {
          const fd = def.fd == null ? (def.subKey === '<' ? 0 : 1) : def.fd;
          if (def.mod === 'dup') {
            if (value === '-') {
              ps.ensureFd(pid, fd);
              ps.closeFd(pid, fd);
            } else {
              ps.ensureFd(pid, value);
              ps.duplicateFd(pid, parseInt(value), fd);
            }
            // Propagate any exit code
            node.exitCode = node.Word.exitCode || 0;
          } else if (def.mod === 'move') {
            ps.ensureFd(pid, value);
            ps.duplicateFd(pid, parseInt(value), fd);
            ps.closeFd(pid, parseInt(value));
            node.exitCode = node.Word.exitCode || 0;
          }
        }
      }

      const fd = 'fd' in def ? def.fd : undefined;
      switch (def.subKey) {
        case '<': {// mod: null, so fd<location
          ps.openFile(pid, { fd: fd == null ? 0 : fd, path: value });
          break;
        }
        case '>': {// mod: null | 'append', so fd>location or fd>>location.
          ps.openFile(pid, { fd: fd == null ? 1 : fd, path: value });
          break;
        }
        case '&>': {// &>location or &>>location, both at stdout and stderr.
          ps.openFile(pid, { fd: 1, path: value });
          ps.openFile(pid, { fd: 2, path: value });
          break;
        }
        case '<<':  // Here-doc
        case '<<<': // Here-string
        {
          const buffer = [] as string[];
          if (def.subKey === '<<') {// value is e.g. EOF
            const { value: hereValue } = await lastValueFrom(ts.Expand(node.Hdoc!));
            // Remove a single final newline if exists
            buffer.push(...hereValue.replace(/\n$/, '').split('\n'));
          } else {
            buffer.push(value); // ?
          }
          /**
           * Create temp file and unlink.
           * - https://www.oilshell.org/blog/2016/10/18.html
           * - TODO Write in new redirection scope?
           */
          const tempPath = `/tmp/here-doc.${shortId.generate()}.${pid}`;
          const opened = ps.openFile(pid, { fd: 10, path: tempPath });
          // ps.write(pid, 1, buffer)
          buffer.map(line => opened.write(line));
          ps.closeFd(pid, 10);
          ps.openFile(pid, { fd: def.fd || 0, path: tempPath });
          ps.unlinkFile(pid, tempPath);
          break;
        }
        case '<>': {// Open fd for read/write.
          ps.openFile(pid, { fd: fd == null ? 0 : fd, path: value });
          break;
        }
        default: throw testNever(def);
      }
    }());
  }

  private Stmt({ Negated, Background, Redirs, Cmd }: Sh.Stmt): Observable<ProcessAct> {
    return this.Command(Cmd, {
      Redirs,
      background: Background,
      negated: Negated,
    });
  }

  private async applyRedirects(parent: Sh.CallExpr, redirects: Sh.Redirect[]) {
    try {
      for (const redirect of redirects) {
        await awaitEnd(this.Redirect(redirect));
      }
    } catch (e) {
      this.handleShError(parent, e);
    }
  }

  private async assignVars(node: Sh.CallExpr, local = false) {
    try {
      for (const assign of node.Assigns) {
        assign.declOpts = assign.declOpts || {};
        assign.declOpts.local = local;
        await awaitEnd(this.Assign(assign));
      }
    } catch (e) {
      this.handleShError(node, e);
    }
  }

  private handleShError(node: Sh.ParsedSh, e: any) {
    if (e === null) {
      // We throw null when terminating via Ctrl-C
      throw null;
    } else if (e instanceof ShError) {
      // console.error(`${sessionKey}: pid ${pid}: ${e.message}`);
      ps.warn(node.meta.pid, e.message);
      node.exitCode = e.exitCode;
    } else {
      console.error(`${node.meta.sessionKey}: pid ${node.meta.pid}: internal error: ${e.message}`);
      console.error(e);
      ps.warn(node.meta.pid, `internal error: ${e.message}`);
      node.exitCode = 2;
    }
    ps.setExitCode(node.meta.pid, node.exitCode);
  }

  private extractSpecialArithmExpr(arithmExpr: null | Sh.ArithmExpr): null | '@' | '*' {
    if (
      arithmExpr?.type === 'Word'
      && (arithmExpr.Parts.length === 1)
      && arithmExpr.Parts[0].type === 'Lit'
    ) {
      const { Value } = arithmExpr.Parts[0] as Sh.Lit;
      if (Value === '@') {
        return '@';
      } else if (Value === '*') {
        return '*';
      }
    }
    return null;
  }

  /** Only $@ and ${x[@]} can expand to multiple args */
  private isSpecialParamExp(node: Sh.WordPart) {
    return node.type === 'ParamExp' && (
      node.paramDef!.parKey === ParamType.special
      || (node.paramDef!.parKey === ParamType.plain && node.paramDef!.index?.value === '@' )
    );
  }

  private isWordPart(node: Sh.ParsedSh): node is Sh.WordPart {
    return !!(wordPart as Record<string, true>)[node.type];
  }
  
  /** No file expansion because only permit absolute paths */
  private async performShellExpansion(Args: Sh.Word[]): Promise<string[]> {
    const expanded = [] as string[];

    for (const word of Args) {
      const result = await lastValueFrom(this.Expand(word));
      const single = word.Parts.length === 1 ? word.Parts[0] : null;

      if (word.exitCode) {
        throw new ShError('failed to expand word', word.exitCode);
      } else if (single?.type === 'SglQuoted') {
        expanded.push(result.value); // No filename expansion for '' and $''.
      } else if (single?.type === 'ParamExp' || single?.type === 'CmdSubst') {
        // Normalize command and parameter expansion,
        // e.g. ' foo \nbar ' -> ['foo', 'bar'].
        expanded.push(...expandService.normalizeWhitespace(result.value));
      } else {
        expanded.push(...result.values);
      }
    }
    return expanded;
  }

  /**
   * Sets node.parent.{string,number}.
   */
  private async runArithmExpr(node: Sh.ExpandType) {
    let textValue: string;
    if (this.isWordPart(node)) {// WordPart expands to multiple values
      textValue = (await lastValueFrom(this.ExpandPart(node))).value;
    } else {// ArithmExpr expands to exactly one string/number
      await awaitEnd(this.ArithmExpr(node)); 
      textValue = node.string!;
    }

    let value = parseInt(textValue);
    if (Number.isNaN(value)) {// Try looking up variable
      const varValue = vs.expandVar(node.meta.pid, textValue);
      value = parseInt(varValue) || 0;
    }

    // Propagate string and evaluated number upwards
    (node.parent! as Sh.BaseNode).string = textValue;
    (node.parent! as Sh.BaseNode).number = value;
  }

  transpileParam(node: Sh.ParamExp): ParameterDef<Observable<Expanded>, Observable<Expanded>> {
    const { Excl, Exp, Index, Length, Names, Param, Repl, Short, Slice } = node;
    const base = {
      param: Param.Value,
      short: Short,
      index: Index ? this.ArithmExpr(Index) : undefined,
    };
  
    if (Excl) {// ${!...}
      if (Index) {
        const special = this.extractSpecialArithmExpr(Index);
        if (special) {// ${!x[@]}, ${x[*]}
          return { ...base, parKey: ParamType['keys'], split: special === '@' };
        } else {// Indirection ${!x[n]} or ${!x["foo"]}
          return { ...base, parKey: ParamType['pointer'] };
        }
      } else if (Names) {// ${!x*}, ${!x@}
        return { ...base, parKey: ParamType['vars'], split: (Names === '@') };
      } else {// Indirection ${!x}
        return { ...base, parKey: ParamType['pointer'] };
      }
    } else {// No exclamation
      if (Exp) {
        const pattern = Exp.Word ? this.Expand(Exp.Word) : null;
        const alt = pattern;
        switch (Exp.Op) {
          case '^': return { ...base, parKey: ParamType.case, pattern, to: 'upper', all: false }; break;
          case '^^': return { ...base, parKey: ParamType.case, pattern, to: 'upper', all: true };  break;
          case ',': return { ...base, parKey: ParamType.case, pattern, to: 'lower', all: false }; break;
          case ',,': return { ...base, parKey: ParamType.case, pattern, to: 'lower', all: true }; break;
          // remove
          case '%': return { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: 1 }; break;
          case '%%': return { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: 1 }; break;
          case '#': return { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: -1 }; break;
          case '##': return { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: -1 }; break;
          // default
          case '+': return { ...base, parKey: ParamType.default, alt, symbol: '+', colon: false }; break;
          case ':+': return { ...base, parKey: ParamType.default, alt, symbol: '+', colon: true }; break;
          case '=': return { ...base, parKey: ParamType.default, alt, symbol: '=', colon: false }; break;
          case ':=': return { ...base, parKey: ParamType.default, alt, symbol: '=', colon: true }; break;
          case '?': return { ...base, parKey: ParamType.default, alt, symbol: '?', colon: false }; break;
          case ':?': return { ...base, parKey: ParamType.default, alt, symbol: '?', colon: true }; break;
          case '-': return { ...base, parKey: ParamType.default, alt, symbol: '-', colon: false }; break;
          case ':-': return { ...base, parKey: ParamType.default, alt, symbol: '-', colon: true }; break;
          // ...
          default: throw new Error(
            `Unsupported operation '${Exp.Op}' in parameter expansion of '${Param.Value}'.`);
        }
      } else if (Length) {// ${#x}, ${#x[2]}, ${#x[@]}
        const isSpecial = Boolean(this.extractSpecialArithmExpr(Index));
        return { ...base, parKey: ParamType['length'], of: isSpecial ? 'values' : 'word' };
      } else if (Repl) {// ${x/y/z}, ${x//y/z}, ${x[foo]/y/z}
        return { ...base, parKey: ParamType['replace'], all: Repl.All,
          orig: this.Expand(Repl.Orig),
          with: Repl.With ? this.Expand(Repl.With) : null,
        };
      } else if (Slice) {// ${x:y:z}, ${x[foo]:y:z}
        return { ...base, parKey: ParamType['substring'],
          from: this.ArithmExpr(Slice.Offset),
          length: Slice.Length ? this.ArithmExpr(Slice.Length) : null,
        };
  
      } else if (Index) {// ${x[i]}, ${x[@]}, ${x[*]}
        // NOTE ${x[@]} can split fields in double quotes.
        return { ...base, parKey: ParamType['plain'] };
      } else if (base.param === String(parseInt(base.param))) {
        return { ...base, parKey: ParamType['position'] };
      } else {
        switch (base.param) {
          // special
          case '@':
          case '*':
          case '#':
          case '?':
          case '-':
          case '$':
          case '!':
          case '0':
          case '_': {
            return { ...base, parKey: ParamType['special'], param: base.param };
          }// plain
          default: {
            return { ...base, parKey: ParamType['plain'] };
          }
        }
      }
    }
  }

  transpileRedirect(node: Sh.Redirect): RedirectDef<Observable<Expanded>> {
    const { N, Word, Hdoc } = node;
    const fd = N ? Number(N.Value) : undefined;

    switch (node.Op) {
      case '<':
        return { subKey: '<', mod: null, fd };
      case '<&': {
        const [part] = Word.Parts;
        // See 3.6.8 of:
        // https://www.gnu.org/software/bash/manual/bash.html#Redirections
        if (part && part.type === 'Lit' && part.Value.endsWith('-')) {
          return { subKey: '<', mod: 'move', fd };
        }
        return { subKey: '<', mod: 'dup', fd };
      }
      case '>':
        return { subKey: '>', mod: null, fd };
      case '>>':
        return { subKey: '>', mod: 'append', fd };
      case '>&': {
        const [part] = Word.Parts;
        if (part && part.type === 'Lit' && part.Value.endsWith('-')) {
          return { subKey: '>', mod: 'move', fd };
        }
        return { subKey: '>', mod: 'dup', fd };
      }
      case '<<':
        return { subKey: '<<', fd, here: this.Expand(Hdoc!) };
      case '<<<':
        return { subKey: '<<<', fd };
      case '<>':
        return { subKey: '<>', fd, };
      default:
        throw new Error(`Unsupported redirection symbol '${node.Op}'.`);
    }
  }

  private unsupportedNode(node: Sh.ParsedSh, msg: string) {
    return from(function*() {
      ts.handleShError(node, new ShError(msg, 2));
    }());
  }

}
interface CommandExtension {
  Redirs: Sh.Redirect[];
  background: boolean;
  negated: boolean;
}

export interface CommandCtxt {
  Redirs: Observable<ProcessAct>[];
  background: boolean;
  negated: boolean;
}

export class ShError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public internalCode?: 'P_EXIST' | 'PP_NO_EXIST' | 'F_NO_EXIST' | 'NOT_A_DIR',
  ) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ShError.prototype);
  }
}

const arithmOp = {
  'BinaryArithm': true,
  'UnaryArithm': true,
  'ParenArithm': true,
  // 'Word': true,
};

const wordPart = {
  'Lit': true,
  'SglQuoted': true,
  'DblQuoted': true,
  'ParamExp': true,
  'CmdSubst': true,
  'ArithmExp': true,
  'ProcSubst': true,
  'ExtGlob': true,
};


export const transpileSh = new TranspileShService;

const ts = transpileSh; // Local shortcut