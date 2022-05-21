import type * as Sh from './parse/parse.model';
import { testNever } from 'model/generic.model';
import { Device, ReadResult, ShellIo, SigEnum } from './io/io.model';
import { MessageFromShell, MessageFromXterm } from './tty.model';

import useSession, { ProcessMeta, ProcessStatus } from './session.store';
import { ParseService } from './parse/parse.service';
import { srcService } from './parse/src.service';
import { wrapInFile } from './parse/parse.util';
import { semanticsService } from './semantics.service';
import { TtyXterm } from './tty.xterm';
import { ProcessError } from './sh.util';

export class TtyShell implements Device {

  public key: string;
  public xterm!: TtyXterm;
  /** Lines received from a TtyXterm. */
  private inputs = [] as { line: string; resolve: () => void }[];
  private input = null as null | { line: string; resolve: () => void };
  /** Lines in current interactive parse */
  private buffer = [] as string[];
  private readonly maxLines = 500;
  private process!: ProcessMeta;

  private oneTimeReaders = [] as {
    resolve: (msg: any) => void;
    reject: () => void;
  }[];
 
  constructor(
    public sessionKey: string,
    public io: ShellIo<MessageFromXterm, MessageFromShell>,
    /** Source code entered interactively, most recent last. */
    private history: string[],
  ) {
    this.key = `/dev/tty-${sessionKey}`;
  }
  
  async initialise(xterm: TtyXterm) {
    this.xterm = xterm;
    this.io.read(this.onMessage.bind(this));

    // session corresponds to leading process where pid = ppid = pgid = 0
    useSession.api.createProcess({
      sessionKey: this.sessionKey,
      ppid: 0,
      pgid: 0,
      src: '',
    });
    this.process = useSession.api.getSession(this.sessionKey).process[0];

    if (!parseService.parse) {// Wait for parse.service
      await new Promise<void>(resolve => initializers.push(resolve));
    }

    await this.runProfile();

    this.prompt('$');
  }

  private onMessage(msg: MessageFromXterm) {
    switch (msg.key) {
      case 'req-history-line': {
        const { line, nextIndex } = this.getHistoryLine(msg.historyIndex);
        this.io.write({
          key: 'send-history-line',
          line,
          nextIndex,
        });
        break;
      }
      case 'send-line': {
        if (this.oneTimeReaders.length) {
          this.oneTimeReaders.shift()!.resolve(msg.line);
          this.io.write({ key: 'tty-received-line' });
        } else {
          this.inputs.push({
            line: msg.line,
            // xterm won't send another line until resolved
            resolve: () => this.io.write({ key: 'tty-received-line' }),
          });
          this.tryParse();
        }
        break;
      }
      case 'send-kill-sig': {
        this.buffer.length = 0;
        this.oneTimeReaders.forEach(({ reject }) => reject());
        this.oneTimeReaders.length = 0;
        if (this.process.status !== ProcessStatus.Running) {
          this.prompt('$');
        } else {
          semanticsService.handleTopLevelProcessError(
            new ProcessError(SigEnum.SIGKILL, 0, this.sessionKey),
          );
        }
        break;
      }
      default:
        throw testNever(msg);
    }
  }

  /** Spawn a process, assigning pid to non-leading ones */
  async spawn(
    parsed: Sh.FileWithMeta,
    opts: { leading?: boolean, posPositionals?: string[] } = {},
  ) {
    const { meta } = parsed;

    if (opts.leading) {
      this.process.status = ProcessStatus.Running;
    } else {
      const { ppid, pgid } = meta;
      const { positionals } = useSession.api.getProcess(meta);
      const process = useSession.api.createProcess({
        ppid,
        pgid,
        sessionKey: meta.sessionKey,
        src: srcService.src(parsed),
        posPositionals: opts.posPositionals || positionals.slice(1),
      });
      meta.pid = process.key;
      // console.warn(ppid, 'launched', meta.pid, process, JSON.stringify(meta.fd));
    }

    try {
      for await (const _ of semanticsService.File(parsed));
      parsed.meta.verbose && console.warn(`${meta.sessionKey}${meta.pgid ? ' (background)' : ''}: ${meta.pid}: exit ${parsed.exitCode}`);
    } catch (e) {
      if (e instanceof ProcessError) {
        console.error(`${meta.sessionKey}${meta.pgid ? ' (background)' : ''}: ${meta.pid}: ${e.code}`)
      }
      throw e;
    } finally {
      // const process = useSession.api.getProcess(meta);
      // process.cleanups.forEach(cleanup => cleanup());
      !opts.leading && useSession.api.removeProcess(meta.pid, this.sessionKey);
    }
  }

  private async tryParse() {
    this.input = this.inputs.pop() || null;
    if (!this.input) return;

    try {// Catch errors from `this.spawn`

      this.buffer.push(this.input.line);
      const result = parseService.tryParseBuffer(this.buffer.slice());

      switch (result.key) {
        case 'failed': {
          const errMsg = `mvdan-sh: ${result.error.replace(/^src\.sh:/, '')}`;
          console.error(errMsg);
          this.io.write({ key: 'error', msg: errMsg });
          this.buffer.length = 0;
          this.prompt('$');
          break;
        }
        case 'complete': {
          this.buffer.length = 0;
          // Store command in history
          const singleLineSrc = srcService.src(result.parsed);
          singleLineSrc && this.storeSrcLine(singleLineSrc);

          // Run command
          this.process.src = singleLineSrc;
          this.provideContextToParsed(result.parsed);
          await this.spawn(result.parsed, { leading: true });

          this.prompt('$');
          break;
        }
        case 'incomplete': {
          this.prompt('>');
          break;
        }
      }
    } catch (e) {
      if (e instanceof ProcessError) {
        semanticsService.handleTopLevelProcessError(e);
      } else {
        console.error('unexpected error propagated to tty.shell', e);
      }
      this.prompt('$');
    } finally {
      this.input?.resolve();
      this.input = null;
      this.process.status = ProcessStatus.Suspended;
    }
  }

  /** `prompt` must not contain non-readable characters e.g. ansi color codes */
  private prompt(prompt: string) {
    this.io.write({
      key: 'send-xterm-prompt',
      prompt: `${prompt} `,
    });    
  }

  /** Input is a lookup `{ foo: '{ echo foo; }' }` */
  loadShellFuncs(funcDefs: { [funcName: string]: string }) {
    for (const [funcName, funcBody] of Object.entries(funcDefs)) {
      try {
        const parsed = parseService.parse(`${funcName} () ${funcBody.trim()}`);
        const parsedBody = (parsed.Stmts[0].Cmd as Sh.FuncDecl).Body;
        const wrappedBody = wrapInFile(parsedBody);
        useSession.api.addFunc(this.sessionKey, funcName, wrappedBody);
      } catch (e) {
        console.error(`loadShellFuncs: failed to load function "${funcName}"`);
        console.error(e);
      }
    }
  }

  private async runProfile() {
    const profile = useSession.api.getVar(this.sessionKey, 'PROFILE') || '';
    const parsed = parseService.parse(profile);
    this.provideContextToParsed(parsed);
    await this.spawn(parsed, { leading: true });
  }

  private provideContextToParsed(parsed: Sh.FileWithMeta) {
    Object.assign<Sh.BaseMeta, Sh.BaseMeta>(parsed.meta, {
      sessionKey: this.sessionKey,
      pid: 0,
      ppid: 0,
      pgid: 0,
      fd: { 0: this.key, 1: this.key, 2: this.key },
      stack: [],
      verbose: false, // TODO runtime configurable
    });
  }

  private getHistoryLine(lineIndex: number) {
    const maxIndex = this.history.length - 1;
    return {
      line: this.history[maxIndex - lineIndex] || '',
      nextIndex: lineIndex < 0 ? 0 : lineIndex > maxIndex ? maxIndex : lineIndex,
    };
  }

  getHistory() {
    return this.history.slice();
  }

  private storeSrcLine(srcLine: string) {
    const prev = this.history.pop();
    prev && this.history.push(prev);
    if (prev !== srcLine) {
      this.history.push(srcLine);
      while (this.history.length > this.maxLines) this.history.shift();
      useSession.api.persist(this.sessionKey);
    }
  }

  //#region Device
  public async readData(): Promise<ReadResult> {
    try {
      return await new Promise((resolve, reject) => {
        this.oneTimeReaders.push({
          resolve: (msg: string) => resolve({ data: msg }),
          reject,
        });
        this.input?.resolve();
        this.input = null;
      });
    } catch {
      return { eof: true };
    }
  }
  public async writeData(data: any) {
    this.io.write(data);
  }
  public finishedWriting() {
    // NOOP
  }
  public finishedReading() {
    // NOOP
  }
  //#endregion
}

// Lazyload saves ~220kb initially
let parseService = { tryParseBuffer:
  (_) => ({ key: 'failed', error: 'not ready' })} as ParseService;
const initializers = [] as (() => void)[]; 
import('./parse/parse.service').then(x => {
  parseService = x.parseService;
  initializers.forEach(initialize => initialize());
  initializers.length = 0;
});
