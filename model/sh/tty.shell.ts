import { testNever } from 'model/generic.model';
import { Device, ShellIo, SigEnum } from './io/io.model';
import { FileWithMeta } from './parse/parse.model';
import { MessageFromShell, MessageFromXterm } from './tty.model';
import type * as Sh from './parse/parse.model';

import useSession from 'store/session.store';
import { ParseService } from './parse/parse.service';
import { srcService } from './parse/src.service';
import { semanticsService } from './semantics.service';
import { TtyXterm } from './tty.xterm';

// Lazyload saves ~220kb initially
let parseService = { tryParseBuffer: (_) => ({ key: 'failed', error: 'not ready' })} as ParseService;
import('./parse/parse.service').then(x => parseService = x.parseService);

export class TtyShell implements Device {

  public key: string;
  public xterm!: TtyXterm;
  /** Lines received from a TtyXterm. */
  private inputs = [] as { line: string; resolve: () => void }[];
  private input = null as null | { line: string; resolve: () => void };
  /** Lines in current interactive parse */
  private buffer = [] as string[];
  private readonly maxLines = 500;
  private lastPrompt = null as null | string;
  
  private oneTimeReaders = [] as ((msg: any) => void)[];
  
  constructor(
    public sessionKey: string,
    public io: ShellIo<MessageFromXterm, MessageFromShell>,
    /** Source code entered interactively, most recent last. */
    private history: string[],
  ) {
    this.key = `/dev/tty-${sessionKey}`;
  }
  
  initialise(xterm: TtyXterm) {
    this.xterm = xterm;
    this.io.read(this.onMessage.bind(this));
    // session has pid = ppid = pgid = 0
    useSession.api.createProcess({
      sessionKey: this.sessionKey,
      ppid: 0,
      pgid: 0,
      src: 'init',
    })
    this.prompt('$');
  }

  /** `prompt` must not contain non-readable characters e.g. ansi color codes */
  private prompt(prompt: string) {
    this.lastPrompt = prompt;
    this.io.write({
      key: 'send-xterm-prompt',
      prompt: `${prompt} `,
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
          this.oneTimeReaders.shift()!(msg.line);
          this.io.write({ key: 'tty-received-line' });
        } else {
          this.inputs.push({
            line: msg.line, // xterm won't send another line until resolved
            resolve: () => this.io.write({ key: 'tty-received-line' }),
          });
          this.tryParse();
        }
        break;
      }
      case 'send-sig': {
        if (msg.signal === SigEnum.SIGINT) {
          this.buffer.length = 0;
          this.oneTimeReaders.length = 0;

          const processes = useSession.api.getProcessGroup(0);
          processes.forEach((process) => {
            process.status = 'interrupted';
            process.cleanups.forEach(cleanup => cleanup());
            process.cleanups.length = 0;
          });

          if (this.lastPrompt === '>') {
            this.prompt('$');
          }
        }
        break;
      }
      default:
        throw testNever(msg);
    }
  }

  /** Spawn a process. */
  async spawn(parsed: FileWithMeta, leading = false) {
    const { meta } = parsed;
    if (leading) {
      useSession.api.updateProcess(0, { status: 'running', resume: null });
    } else {
      meta.pid = useSession.api.createProcess({
        ppid: meta.pid,
        pgid: meta.pgid,
        sessionKey: meta.sessionKey,
        src: srcService.src(parsed),
      });
    }

    const device = useSession.api.resolve(meta.stdOut, meta.pid);
    const generator = semanticsService.File(parsed);

    try {
      for await (const item of generator) {
        await device.writeData(item);
      }
    } catch (e) {
      throw e;
    } finally {
      !leading && useSession.api.removeProcess(meta.pid);
    }
  }

  private async tryParse() {
    this.input = this.inputs.pop() || null;
    if (!this.input) return;

    try {// Catch errors from `this.spawn`

      this.buffer.push(...this.input.line.split('¶'));
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
          useSession.api.updateProcess(0, { src: singleLineSrc });
          Object.assign<Sh.BaseMeta, Sh.BaseMeta>(result.parsed.meta, {
            sessionKey: this.sessionKey,
            pid: 0,
            ppid: 0,
            pgid: 0,
            stdIn: this.key,
            stdOut: this.key,
          });
          await this.spawn(result.parsed, true);

          this.prompt('$');
          break;
        }
        case 'incomplete': {
          this.prompt('>');
          break;
        }
      }
    } catch (e) {
      console.error('error propagated to TtyShell', e);
      this.prompt('$');
    } finally {
      this.input?.resolve();
      this.input = null;
    }
  }

  private storeSrcLine(srcLine: string) {
    const prev = this.history.pop();
    prev && this.history.push(prev);
    if (prev !== srcLine) {
      this.history.push(srcLine);
      while (this.history.length > this.maxLines)
        this.history.shift();
      useSession.api.persist(this.sessionKey, {
        history: this.history.slice(),
      });
    }
  }

  readOnceFromTty(reader: (msg: any) => void) {
    this.oneTimeReaders.push(reader);
    this.input?.resolve();
    this.input = null;
  }

  //#region Device
  public readData() {
    return Promise.resolve({ eof: true });
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
