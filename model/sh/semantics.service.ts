import type * as Sh from './parse/parse.model';
import { nanoid } from 'nanoid';
import safeJsonStringify from 'safe-json-stringify';

import { last } from 'model/generic.model';
import useSession, { ProcessStatus } from 'store/session.store';
import { NamedFunction } from './var.model';
import { createKillError, expand, Expanded, literal, matchFuncFormat, normalizeWhitespace, ProcessError, ShError, singleQuotes } from './sh.util';
import { cmdService } from './cmd.service';
import { srcService } from './parse/src.service';
import { preProcessWrite, redirectNode, SigEnum } from './io/io.model';
import { cloneParsed, collectIfClauses, wrapInFile } from './parse/parse.util';
import { FifoDevice } from './io/fifo.device';

class SemanticsService {

  private async *assignVars(node: Sh.CallExpr) {
    for (const assign of node.Assigns) {
      yield* this.Assign(assign);
    }
  }

  private async applyRedirects(parent: Sh.Command, redirects: Sh.Redirect[]) {
    try {
      for (const redirect of redirects) {
        redirect.exitCode = 0;
        await this.Redirect(redirect);
      }
    } catch (e) {
      parent.exitCode = redirects.find(x => x.exitCode)?.exitCode??1;
      throw e;
    }
  }

  private expandParameter(meta: Sh.BaseMeta, varName: string): string {
    if (/^\d+$/.test(varName)) {// Positional
      return useSession.api.getPositional(meta.pid, meta.sessionKey, Number(varName));
    }
    // Otherwise we're retrieving a variable
    const varValue = useSession.api.getVar(meta.sessionKey, varName);
    if (varValue === undefined || typeof varValue === 'string') {
      return varValue || '';
    }
    return safeJsonStringify(varValue);
  }

  private handleShError(node: Sh.ParsedSh, e: any, prefix?: string) {
    if (e instanceof ProcessError) {
      throw e; // Propagate signal (KILL)
    } else if (e instanceof ShError) {
      const message = [prefix, e.message].filter(Boolean).join(': ');
      useSession.api.warn(node.meta.sessionKey, message);
      console.error(`ShError: ${node.meta.sessionKey}: ${message}`);
      node.exitCode = e.exitCode;
    } else {
      const message = [prefix, e?.message].filter(Boolean).join(': ');
      useSession.api.warn(node.meta.sessionKey, message);
      console.error(`Internal ShError: ${node.meta.sessionKey}: ${message}`);
      console.error(e);
      node.exitCode = 2;
    }
  }

  handleTopLevelProcessError(e: ProcessError) {
    if (e.code === SigEnum.SIGKILL) {
      // Kill all processes in process group
      const process = useSession.api.getProcess(
        { pid: e.pid, sessionKey: e.sessionKey } as Sh.BaseMeta,
      );
      if (process) {
        const processes = useSession.api.getProcesses(e.sessionKey, process.pgid);
        processes.forEach((process) => {
          process.status = ProcessStatus.Killed;
          process.cleanups.forEach(cleanup => cleanup());
          process.cleanups.length = 0;
        });
      }
    }
  }

  private async lastExpanded(generator: AsyncGenerator<Expanded>) {
    let lastExpanded = undefined as Expanded | undefined;
    for await (const expanded of generator) lastExpanded = expanded;
    return lastExpanded!;
  }

  private async *stmts(parent: Sh.ParsedSh, nodes: Sh.Stmt[]) {
    for (const node of nodes) {
      yield* sem.Stmt(node);
      parent.exitCode = node.exitCode;
    }
  }

  /**
   * We normalise textual input e.g. via parameter substitution,
   * in order to construct a simple/compound command we can run.
   */
  private async performShellExpansion(Args: Sh.Word[]): Promise<string[]> {
    const expanded = [] as string[];
    for (const word of Args) {
      const result = await this.lastExpanded(this.Expand(word));
      const single = word.Parts.length === 1 ? word.Parts[0] : null;
      if (word.exitCode) {
        throw new ShError('failed to expand word', word.exitCode);
      } else if (single?.type === 'SglQuoted') {
        expanded.push(result.value);
      } else if (single?.type === 'ParamExp' || single?.type === 'CmdSubst') {
        // e.g. ' foo \nbar ' -> ['foo', 'bar'].
        normalizeWhitespace(result.value).forEach(x => expanded.push(x));
      } else {
        result.values.forEach(x => expanded.push(x));
      }
    }
    return expanded;
  }

  private async *Assign({ meta, Name, Value, Naked }: Sh.Assign) {
    useSession.api.setVar(meta.sessionKey, Name.Value,
      !Naked && Value
        ? (await this.lastExpanded(sem.Expand(Value))).value
        : ''
    );
  }

  private async *BinaryCmd(node: Sh.BinaryCmd) {
    /** All contiguous binary cmds for same operator */
    const cmds = srcService.binaryCmds(node);
    // Restrict to leaves of binary tree, assuming it was
    // originally left-biased e.g. (((A * B) * C) * D) * E
    const stmts = [cmds[0].X].concat(cmds.map(({ Y }) => Y));

    switch (node.Op) {
      case '&&': {
        for (const stmt of stmts) {
          yield* sem.Stmt(stmt);
          if (node.exitCode = stmt.exitCode) break;
        }
        break;
      }
      case '||': {
        for (const stmt of stmts) {
          yield* sem.Stmt(stmt);
          if (!(node.exitCode = stmt.exitCode)) break;
        }
        break;
      }
      case '|': {
        const fifos = [] as FifoDevice[];
        const clones = stmts.map(x => {
          const clone = wrapInFile(cloneParsed(x));
          clone.meta.ppid = node.meta.pid; // (pid, pgid) are set in spawn
          return clone;
        });

        try {
          const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
          for (const [i, file] of clones.slice(0, -1).entries()) {
            // At most one pipeline can be running in any process
            const fifoKey = `/dev/fifo-${file.meta.pid}-${i}`;
            fifos.push(useSession.api.createFifo(fifoKey));
            clones[i + 1].meta.fd[0] = file.meta.fd[1] = fifoKey;
          }
          const stdOuts = clones.map(({ meta }) => useSession.api.resolve(1, meta));

          const process = useSession.api.getProcess(node.meta)
          const results = await Promise.allSettled(clones.map((file, i) =>
            new Promise<void>(async (resolve, reject) => {
              try {
                process.cleanups.push(() => reject()); // Handle Ctrl-C
                await ttyShell.spawn(file);
                stdOuts[i].finishedWriting();
                stdOuts[i - 1]?.finishedReading();
                if (node.exitCode = file.exitCode) {
                  throw new ShError(`pipe ${i}`, node.exitCode);
                }
                resolve();
              } catch (e) {
                // console.log('inner pipeline error', i, e)
                reject(e);
              }
            }),
          ));

          if (results.some(x => x.status === 'rejected')) {
            // Terminate children and this process on pipeline error
            clones.map(({ meta }) => useSession.api.getProcess(meta))
              // Processes may have terminated, including their descendants.
              // Perhaps we should try to cleanup their descendants too?
              .forEach(x => x && (x.status = ProcessStatus.Killed) && x.cleanups.forEach(cleanup => cleanup()));
            throw createKillError(node.meta);
          }

        } finally {
          fifos.forEach(fifo => {
            fifo.finishedWriting(); // TODO clarify
            useSession.api.removeDevice(fifo.key);
          });
        }
        break;
      }
      default:
        throw new ShError(`binary command ${node.Op} unsupported`, 2);
    }
  }

  private Block(node: Sh.Block) {
    return this.stmts(node, node.Stmts);
  }

  private async *CallExpr(node: Sh.CallExpr) {
    node.exitCode = 0;
    const args = await sem.performShellExpansion(node.Args);
    const [command, ...cmdArgs] = args;
    node.meta.verbose && console.log('simple command', args);
    
    if (args.length) {
      let func: NamedFunction | undefined;
      if (cmdService.isCmd(command)) {
        yield* cmdService.runCmd(node, command, cmdArgs);
      } else if (func = useSession.api.getFunc(node.meta.sessionKey, command)) {
        await cmdService.launchFunc(node, func, cmdArgs);
      } else {
        try {// Try to `get` things instead
          for (const arg of args) {
            const result = cmdService.get(node, [arg]);
            if (result[0] !== undefined || matchFuncFormat(arg)) {
              yield* result;
            } else {
              // Throw if get undefined, unless invoked func
              throw Error();
            }
          }
        } catch {
          throw new ShError('not found', 127);
        }
      }
    } else {
      yield* sem.assignVars(node);
    }

  }

  /** Construct a simple command or a compound command. */
  private async *Command(node: Sh.Command, Redirs: Sh.Redirect[]) {
    try {
      await sem.applyRedirects(node, Redirs);
      
      let generator: AsyncGenerator<any, void, unknown>;
      if (node.type === 'CallExpr') {
        generator = this.CallExpr(node);
      } else {
        switch (node.type) {
          case 'Block': generator = this.Block(node); break;
          case 'BinaryCmd': generator = this.BinaryCmd(node); break;
          case 'DeclClause': generator = this.DeclClause(node); break;
          case 'FuncDecl': generator = this.FuncDecl(node); break;
          case 'IfClause': generator = this.IfClause(node); break;
          case 'TimeClause': generator = this.TimeClause(node); break;
          case 'Subshell': generator = this.Subshell(node); break;
          case 'WhileClause': generator = this.WhileClause(node); break;
          default: throw new ShError('not implemented', 2);
        }
      }
      const process = useSession.api.getProcess(node.meta);
      const device = useSession.api.resolve(1, node.meta);
      if (!device) {// Pipeline already failed
        throw createKillError(node.meta);
      }
      // Actually run the code
      for await (const item of generator) {
        await preProcessWrite(process, device);
        await device.writeData(item);
      }
    } catch (e) {
      const command = node.type === 'CallExpr' ? node.Args[0].string || 'unknown CallExpr' : node.type;
      const error = e instanceof ShError ? e : new ShError('', 1, e as Error);
      error.message = `${node.meta.stack.concat(command).join(': ')}: ${(e as Error).message || e}`;
      if (command === 'run' && node.meta.stack.length === 0) {
        // When directly using `run`, append helpful error message
        error.message += `\n\rformat \`run {async_generator}\` e.g. run \'({ api:{read} }) { yield "foo"; yield await read(); }\'`;
      }
      sem.handleShError(node, e);
    }
  }

  private async *DeclClause(node: Sh.DeclClause) {
    if (node.Variant.Value === 'declare') {
      if (node.Args.length) {
        // TODO support options e.g. interpret as json
        for (const assign of node.Args) yield* this.Assign(assign);
      } else {
        node.exitCode = 0;
        yield* cmdService.runCmd(node, 'declare', []);
      }
    } else {
      throw new ShError(`Commmand: DeclClause: ${node.Variant.Value} unsupported`, 2);
    }
  }

  /**
   * Expand a `Word` which has `Parts`.
   */
  private async *Expand(node: Sh.Word) {
    if (node.Parts.length > 1) {
      for (const wordPart of node.Parts) {
        wordPart.string = (await this.lastExpanded(sem.ExpandPart(wordPart))).value;
      }
      /** Is last value a parameter/command-expansion AND has trailing whitespace? */
      let lastTrailing = false;
      /** Items can be arrays via brace expansion of literals */
      const values = [] as (string | string[])[];

      for (const part of node.Parts) {
        const value = part.string!;
        const brace = part.type === 'Lit' && (part as any).braceExp;

        if (part.type === 'ParamExp' || part.type === 'CmdSubst') {
          const vs = normalizeWhitespace(value!, false); // Do not trim
          if (!vs.length) {
            continue;
          } else if (!values.length || lastTrailing || vs[0].startsWith(' ')) {
            // Freely add, although trim 1st and last
            values.push(...vs.map((x) => x.trim()));
          } else if (last(values) instanceof Array) {
            values.push((values.pop() as string[]).map(x => `${x}${vs[0].trim()}`));
            values.push(...vs.slice(1).map((x) => x.trim()));
          } else {
            // Either `last(vs)` a trailing quote, or it has no trailing space
            // Since vs[0] has no leading space we must join words
            values.push(values.pop() + vs[0].trim());
            values.push(...vs.slice(1).map((x) => x.trim()));
          }
          lastTrailing = last(vs)!.endsWith(' ');
        } else if (!values.length || lastTrailing) {// Freely add
          values.push(brace ? value.split(' ') : value);
          lastTrailing = false;
        } else if (last(values) instanceof Array) {
          values.push(brace
            ? (values.pop() as string[]).flatMap(x => value.split(' ').map(y =>`${x}${y}`))
            : (values.pop() as string[]).map(x => `${x}${value}`)
          );
          lastTrailing = false;
        } else if (brace) {
          const prev = values.pop() as string;
          values.push(value.split(' ').map(x => `${prev}${x}`));
          lastTrailing = false;
        } else {
          values.push(values.pop() + value);
          lastTrailing = false;
        }
      }

      const allValues = values.flatMap(x => x);
      node.string = allValues.join(' ');
      yield expand(allValues);
    } else {
      for await (const expanded of this.ExpandPart(node.Parts[0])) {
        node.string = expanded.value;
        yield expanded;
      }
    }
  }

  private async *ExpandPart(node: Sh.WordPart) {
    switch (node.type) {
      case 'DblQuoted': {
        const output = [] as string[];
        for (const part of node.Parts) {
          const result = await this.lastExpanded(sem.ExpandPart(part));
          if (part.type === 'ParamExp' && part.Param.Value === '@') {
            output.push(`${output.pop() || ''}${result.values[0] || ''}`, ...result.values.slice(1));
          } else {
            output.push(`${output.pop() || ''}${result.value || ''}`);
          }
        }
        yield expand(output);
        return;
      }
      case 'Lit': {
        const literals = literal(node);
        /**
         * HACK node.braceExp
         */
        (literals.length > 1) && Object.assign(node, { braceExp: true });
        yield expand(literals);
        break;
      }
      case 'SglQuoted': {
        yield expand(singleQuotes(node));
        break;
      }
      case 'CmdSubst': {
        const cloned = wrapInFile(cloneParsed(node));
        const fifoKey = `/dev/fifo-cmd-${nanoid()}`;
        const device = useSession.api.createFifo(fifoKey);
        cloned.meta.fd[1] = device.key;

        const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
        await ttyShell.spawn(cloned);

        try {
          yield expand(device.readAll()
            .map(x => typeof x === 'string' ? x : safeJsonStringify(x))
            .join('\n').replace(/\n*$/, ''),
          );
        } finally {
          useSession.api.removeDevice(device.key);
        }
        break;
      }
      case 'ParamExp': {
        yield* this.ParamExp(node);
        return;
      }
      case 'ArithmExp':
      case 'ExtGlob':
      case 'ProcSubst':
      default:
        throw Error(`${node.type} unimplemented`);
    }
  }

  File(node: Sh.File) {
    return sem.stmts(node, node.Stmts);
  }

  private async *FuncDecl(node: Sh.FuncDecl) {
    const clonedBody = cloneParsed(node.Body);
    const wrappedFile = wrapInFile(clonedBody);
    useSession.api.addFunc(node.meta.sessionKey, node.Name.Value, wrappedFile);
  }

  private async *IfClause(node: Sh.IfClause) {
    for (const { Cond, Then } of collectIfClauses(node)) {
      if (Cond.length) {// if | elif i.e. have a test
        yield* sem.stmts(node, Cond);

        if (last(Cond)!.exitCode === 0) {// Test succeeded
          yield* sem.stmts(node, Then);
          node.exitCode = last(Then)?.exitCode || 0;
          return;
        }
      } else {// else
        yield* sem.stmts(node, Then);
        node.exitCode = last(Then)?.exitCode || 0;
        return;
      }
    }
  }

  /**
   * - positionals $0, $1, ...
   * - all positionals "${@}"
   * - vanilla $x, ${foo}
   * - default when empty ${foo:-bar}
   */
  private async *ParamExp(
    { meta, Param, Slice, Repl, Length, Excl, Exp }: Sh.ParamExp
  ): AsyncGenerator<Expanded, void, unknown> {
    if (Excl || Length || Repl || Slice) {
      throw new ShError(`ParamExp: ${Param.Value}: unsupported operation`, 2);
    } else if (Exp) {
      switch (Exp.Op) {
        case ':-': {
          const value = this.expandParameter(meta, Param.Value);
          yield value === '' && Exp.Word
            ? await this.lastExpanded(this.Expand(Exp.Word))
            : expand(value)
          break;
        }
        default:
          throw new ShError(`ParamExp: ${Param.Value}: unsupported operation`, 2);
      }
    } else if (Param.Value === '@') {
      yield expand(useSession.api.getProcess(meta).positionals.slice(1));
    } else {
      yield expand(this.expandParameter(meta, Param.Value));
    }
  }

  private async Redirect(node: Sh.Redirect) {
    if (node.Op === '>' || node.Op === '>>') {
      const { value } = await this.lastExpanded(sem.Expand(node.Word));
      if (value === '/dev/null') {
        return redirectNode(node.parent!, { 1: '/dev/null' });
      } else {
        const varDevice = useSession.api.createVarDevice(
          node.meta.sessionKey,
          value,
          node.Op === '>' ? 'last' : 'array',
        );
        return redirectNode(node.parent!, { 1: varDevice.key });
      }
    }
    throw new ShError(`${node.Op}: unsupported redirect`, 127);
  }

  private async *Stmt(stmt: Sh.Stmt) {
    if (!stmt.Cmd) {
      throw new ShError('pure redirects are unsupported', 2);
    } else if (stmt.Background && (stmt.meta.pgid === 0)) {
      /**
       * Run a background process without awaiting.
       */
      const { ttyShell } = useSession.api.getSession(stmt.meta.sessionKey);
      const file = wrapInFile(cloneParsed(stmt));
      file.meta.ppid = stmt.meta.pid;
      file.meta.pgid = useSession.api.getSession(stmt.meta.sessionKey).nextPid;
      ttyShell.spawn(file).catch((e) => {
          if (e instanceof ProcessError) {
            this.handleTopLevelProcessError(e);
          } else {
            console.error('background process error', e);
          }
        });
      stmt.exitCode = stmt.Negated ? 1 : 0;
    } else {
      /**
       * Run a simple or compound command.
       */
      yield* sem.Command(stmt.Cmd, stmt.Redirs);
      stmt.exitCode = stmt.Cmd.exitCode;
      stmt.Negated && (stmt.exitCode = 1 - Number(!!stmt.Cmd.exitCode));
    }
  }

  private async *Subshell(node: Sh.Subshell) {
    const cloned = wrapInFile(cloneParsed(node));
    const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
    await ttyShell.spawn(cloned);
  }

  private async *TimeClause(node: Sh.TimeClause) {
    const before = Date.now(); // Milliseconds since epoch
    if (node.Stmt) {
      yield* sem.Stmt(node.Stmt);
    }
    useSession.api.resolve(1, node.meta).writeData(
      `real\t${Date.now() - before}ms`
    );
  }

  /**
   * TODO
   * - infinite loop safety
   * - implement/handle `break`
   */
  private async *WhileClause(node: Sh.WhileClause) {
      while (true) {
        try {
          yield* sem.stmts(node, node.Cond)
          if (node.Until ? !node.exitCode : node.exitCode) {
            break;
          }
          yield* sem.stmts(node, node.Do);
          // console.log(node.Do)
        } catch (e) {
          console.log('saw', e)
          throw e;
        }
      }
  }
}

export const semanticsService = new SemanticsService;

/** Local shortcut */
const sem = semanticsService;
