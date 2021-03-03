import type * as Sh from './parse.model';
import { Observable, from, lastValueFrom, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import shortid from 'shortid';
import safeJsonStringify from 'safe-json-stringify';

import { last } from 'model/generic.model';
import useSession from 'store/session.store';
import { NamedFunction } from './var.model';
import { expand, Expanded, literal, normalizeWhitespace, ShError, singleQuotes } from './sh.util';
import { cmdService } from './cmd.service';
import { srcService } from './src.service';
import { RedirectDef, redirectNode } from './io.model';
import { wrapInFile } from './parse.util';
import { FifoDevice } from './fifo.device';

type Obs = Observable<any>;
class SemanticsService {

  private handleInternalError(node: Sh.ParsedSh, e: any, prefix?: string) {
    const message = [prefix, e.message].filter(Boolean).join(': ');
    console.error(`${node.meta.sessionKey}: internal error: ${message}`);
    console.error(e);
    useSession.api.warn(node.meta.sessionKey, message);
    node.exitCode = 2;
    // useSession.api.setExitCode(node.meta.sessionKey, node.exitCode);
  }

  private handleShError(node: Sh.ParsedSh, e: any, prefix?: string) {
    if (e === null) {
      throw null; // Propagate Ctrl-C
    } else if (e instanceof ShError) {
      if (e.exitCode === 0) {
        throw e; // Propagate break/continue/return
      }
      const message = [prefix, e.message].filter(Boolean).join(': ');
      console.error(`ShError: ${node.meta.sessionKey}: ${message}`);
      useSession.api.warn(node.meta.sessionKey, message);
      node.exitCode = e.exitCode;
      // useSession.api.setExitCode(node.meta.sessionKey, node.exitCode);
    } else {
      this.handleInternalError(node, e, prefix);
    }
  }

  private async *stmts(parent: Sh.ParsedSh, nodes: Sh.Stmt[]) {
    for (const node of nodes) {
      yield* sem.Stmt(node);
      parent.exitCode = node.exitCode;
    } // Exit code propagates from children
    // useSession.api.setExitCode(parent.meta.sessionKey, parent.exitCode || 0);
  }

  /**
   * We normalise textual input e.g. via parameter substitution,
   * in order to construct a simple/compound command we can run.
   */
  private async performShellExpansion(Args: Sh.Word[]): Promise<string[]> {
    const expanded = [] as string[];

    for (const word of Args) {
      const result = await lastValueFrom(this.Expand(word));
      const single = word.Parts.length === 1 ? word.Parts[0] : null;

      if (word.exitCode) {
        throw new ShError('failed to expand word', word.exitCode);
      } else if (single?.type === 'SglQuoted') {
        // No filename expansion for '' and $''.
        expanded.push(result.value);
      } else if (single?.type === 'ParamExp' || single?.type === 'CmdSubst') {
        // Normalize command and parameter expansion,
        // e.g. ' foo \nbar ' -> ['foo', 'bar'].
        expanded.push(...normalizeWhitespace(result.value));
      } else {
        expanded.push(...result.values);
      }
    }
    return expanded;
  }

  transpile(parsed: Sh.File): Obs {
    return from((async function*(){
      try {
        yield* sem.File(parsed);
      } catch (e) {
        if (e === null) {
          throw e;
        }
        sem.handleInternalError(parsed, e);
      }
    })())
  }

  /**
   * NOTE redirections are parsed/transpiled but currently have no effect.
   */
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
        if (part?.type === 'Lit' && part.Value.endsWith('-')) {
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
        if (part?.type === 'Lit' && part.Value.endsWith('-')) {
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

  private async *BinaryCmd(node: Sh.BinaryCmd) {
    /** All contiguous binary cmds for same operator */
    const cmds = srcService.binaryCmds(node);
    // Restrict to leaves of binary expression, assuming expression
    // originally left-biased e.g. (((A * B) * C) * D) * E
    const stmts = [cmds[0].X].concat(cmds.map(({ Y }) => Y));

    switch (node.Op) {
      case '&&': {// Assume thrown errors already caught
        for (const stmt of stmts) {
          yield* sem.Stmt(stmt);
          node.exitCode = stmt.exitCode;
          if (node.exitCode) break;
        }
        break;
      }
      case '||': {
        // Assume thrown errors already caught
        for (const stmt of stmts) {
          yield* sem.Stmt(stmt);
          node.exitCode = stmt.exitCode;
          if (node.exitCode === 0) break;
        }
        break;
      }
      case '|': {
        const fifos = [] as FifoDevice[];
        try {
          for (const [index, stmt] of stmts.slice(0, -1).entries()) {
            const fifo = useSession.api.createFifo(`/dev/fifo-${index}-${shortid.generate()}`);
            fifos.push(fifo);
            redirectNode(stmt, 'stdOut', fifo.key);
            redirectNode(stmts[index + 1], 'stdIn', fifo.key);
          }
          const files = stmts.map(stmt => wrapInFile(stmt));
          const stdOuts = stmts.map(stmt => useSession.api.resolve(stmt.meta.stdOut));

          await Promise.all(files.map((file, i) =>
            new Promise<void>(async (resolve, reject) => {
              try {
                const generator = this.File(file);
                for await (const item of generator) {
                  await stdOuts[i].writeData(item);
                }
                stdOuts[i].finishedWriting();
                stdOuts[i - 1]?.finishedReading();
                /**
                 * By default, shells do not stop executing when some
                 * subcommand fails: they instead write an error to stderr.
                 * But pipelines should fail whenever a pipe-child does.
                 */
                node.exitCode = file.exitCode;
                file.exitCode ? reject() : resolve();
              } catch (error) {
                reject(error);
              }
            }),
          ));

        } catch (error) {
            error && sem.handleInternalError(node, error);
        } finally {
          fifos.forEach(fifo => {
            fifo.finishedWriting();
            useSession.api.removeFifo(fifo.key);
          });
        }
        break;
      }
      default:
        throw new ShError(`binary command ${node.Op} unsupported`, 2);
    }
    // useSession.api.setExitCode(node.meta.sessionKey, node.exitCode || 0);
  }

  private Block(node: Sh.Block) {
    return this.stmts(node, node.Stmts);
  }

  private async *CallExpr(node: Sh.CallExpr) {
    node.exitCode = 0;
    const args = await sem.performShellExpansion(node.Args);
    console.log('simple command', args);

    try {
      const [command, ...cmdArgs] = args;
      let func: NamedFunction | undefined;

      if (args.length) {
        if (cmdService.isCmd(command)) {
          yield* cmdService.runCmd(node, command, cmdArgs);
        } else if (func = useSession.api.getFunc(node.meta.sessionKey, command)) {
          await cmdService.invokeFunc(node, func, cmdArgs);
        } else {
          throw new ShError('command not found', 127);
        }
      }
    } catch (e) {
      sem.handleShError(node, e, args[0]);
    }
  }

  /** Construct a simple command or a compound command. */
  private async *Command(node: Sh.Command, _Redirs: Sh.Redirect[]) {
    const device = useSession.api.resolve(node.meta.stdOut);

    if (node.type === 'CallExpr') {// Run simple command
      for await (const item of this.CallExpr(node)) {
        device.writeData(item);
      }
      return;
    }

    // Run compound command
    let cmd: AsyncGenerator<any, void, unknown> = null as any;

    switch (node.type) {
      case 'Block': cmd = sem.Block(node); break;
      case 'BinaryCmd': cmd = sem.BinaryCmd(node); break;
      // default: throw testNever(Cmd);
      default: return;
    }

    try {
      for await (const item of cmd) {
        device.writeData(item);
      }
    } catch (e) {
      sem.handleShError(node, e);
    }
  }

  /** Expand a `Word` which has `Parts`. */
  private Expand(node: Sh.Word): Observable<Expanded> {
    if (node.Parts.length > 1) {
      return from(async function*() {
        for (const wordPart of node.Parts) {
          wordPart.string = (await lastValueFrom(sem.ExpandPart(wordPart))).value;
        }
        /*
        * Is the last value computed via a parameter/command-expansion,
        * and, if so, does it have trailing whitespace?
        */
        let lastTrailing = false;
        const values = [] as string[];
  
        for (const { type, string } of node.Parts) {
          const value = string!;
          if (type === 'ParamExp' || type === 'CmdSubst') {
            const vs = normalizeWhitespace(value!, false); // Do not trim
            if (!vs.length) continue;
            else if (!values.length || lastTrailing || /^\s/.test(vs[0])) {
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
        yield expand(values); // Need array?
      }());
    }
    return this.ExpandPart(node.Parts[0])
      .pipe(tap(({ value }) => node.string = value));
  }

  private ExpandPart(node: Sh.WordPart): Observable<Expanded> {
    switch (node.type) {
      case 'DblQuoted':
        return from(async function*() {
          const output = [] as string[];
          for (const part of node.Parts) {
            const result = await lastValueFrom(sem.ExpandPart(part));
            output.push(`${output.pop() || ''}${result.value || ''}`);
          }
          yield expand(output);
        }());
      case 'Lit':
        return of(expand(literal(node)));
      case 'SglQuoted':
        return of(expand(singleQuotes(node)));
      case 'CmdSubst': {
        return from(async function*() {
          const device = useSession.api.createFifo(
            `/dev/fifo-cmd-${shortid.generate()}`);
          redirectNode(node, 'stdOut', device.key);
          const stmts = node.Stmts.map(stmt => sem.Stmt(stmt));
          for (const stmt of stmts) for await (const _ of stmt) {}
          
          const outputs = device.readAll().map(x =>
            typeof x === 'string' ? x : safeJsonStringify(x)  
          );
          useSession.api.removeFifo(device.key);
          yield expand(outputs.join('\n').replace(/\n*$/, ''));
        }());
      }
      case 'ArithmExp':
      case 'ExtGlob':
      case 'ParamExp':
      case 'ProcSubst':
      default:
        throw Error(`${node.type} unimplemented`);
    }
  }

  private File(node: Sh.File) {
    return sem.stmts(node, node.Stmts);
  }

  private async *Stmt(stmt: Sh.Stmt) {
    if (!stmt.Cmd) {
      sem.handleShError(stmt.Redirs[0], new ShError('pure redirects are unsupported', 2));
    } else if (stmt.Background) {
      // const cloned = Object.assign(cloneParsed(stmt), { Background: false } as Sh.Stmt);
      // const file = wrapInFile(cloned);
      // sem.transpile(file).subscribe();
      // stmt.exitCode = stmt.Negated ? 1 : 0;
    } else {// Run a simple or compound command
      yield* sem.Command(stmt.Cmd, stmt.Redirs);
      stmt.exitCode = stmt.Cmd.exitCode;
      if (stmt.Negated) {
        stmt.exitCode = 1 - Number(!!stmt.Cmd.exitCode);
      }
    }
  }
}

export const semanticsService = new SemanticsService;

const sem = semanticsService; // Local shortcut
