import { testNever } from '@model/generic.model';
import useStore, { Session } from '@store/shell.store';
import { parseSh } from './parse.service';
import { SigEnum } from './process.model';
import { FsFile } from './file.model';
import { VoiceCommandSpeech } from './voice.xterm';
import { TtyXterm, ansiReset, ansiPrompt } from './tty.xterm';
import { processService as ps, processService } from './process.service';
import { srcService } from './src.service';

export class TtyShell {

  public xterm!: TtyXterm;
  /** Lines received from a TtyXterm. */
  private inputs = [] as { line: string; resolve: () => void }[];
  private input = null as null | { line: string; resolve: () => void };
  /** Lines in current interactive parse */
  private buffer = [] as string[];
  /** Source code entered interactively, most recent last. */
  private history = [] as string[];
  private readonly maxLines = 500;

  private session!: Session;
  private oneTimeReaders = [] as ((msg: any) => void)[];

  constructor(
    public sessionKey: string,
    public canonicalPath: string,
    public io: FsFile<MessageFromXterm, MessageFromShell>,
  ) {}
  
  initialise(xterm: TtyXterm) {
    this.xterm = xterm;
    this.io.listen(this.onMessage.bind(this));
    this.prompt('$');
    this.session = useStore.getState().session[this.sessionKey];
  }

  private prompt(prompt: string) {
    this.io.write({
      key: 'send-xterm-prompt',
      prompt: `${ansiPrompt}${prompt}${ansiReset} `,
    });    
  }

  private getHistoryLine(lineIndex: number) {
    const maxIndex = this.history.length - 1;
    return {
      line: this.history[maxIndex - lineIndex] || '',
      nextIndex: lineIndex < 0 ? 0 : lineIndex > maxIndex ? maxIndex : lineIndex,
    };
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
        /**
         * TODO foreground `read` can override this.
         */
        if (this.oneTimeReaders.length) {
          this.oneTimeReaders.shift()!(msg.line);
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
      case 'send-sig': {
        console.log('received signal', { msg, sessionKey: this.sessionKey });
        if (msg.signal === SigEnum.SIGINT) {
          // Terminate and cleanup all processes in foreground process group
          const processes = processService.getProcessesInGroup(this.session.sid);
          processes.forEach(({ pid: memberPid }) => {
            // Cleaning causes throw from leaf to root.
            // We don't invoke process.subscription.unsubscribe().
            processService.cleanup(memberPid);
            
          });
          this.buffer.length = 0;
          this.oneTimeReaders.length = 0;
          this.prompt('$');
        }
        break;
      }
      default: throw testNever(msg);
    }

  }

  readOnceFromTty(reader: (msg: any) => void) {
    this.oneTimeReaders.push(reader);
    this.input?.resolve();
    this.input = null;
  }

  private storeSrcLine(srcLine: string) {
    if (srcLine) {
      this.history.push(srcLine);
      while (this.history.length > this.maxLines)
        this.history.shift();
    }
  }

  private async tryParse() {
    this.input = this.inputs.pop() || null;
    
    if (this.input) {
      try {// Catching Ctrl-C of ps.runInShell
        this.buffer.push(this.input.line);
        const result = parseSh.tryParseBuffer(this.buffer.slice()); // Can't error
  
        switch (result.key) {
          case 'failed': {
            const errMsg = `mvdan-sh: ${result.error.replace(/^src\.sh:/, '')}`;
            console.error(errMsg);
            processService.warn(this.session.sid, errMsg);
            processService.setExitCode(this.session.sid, 1);
            this.buffer.length = 0;
            this.prompt('$');
            break;
          }
          case 'complete': {
            this.buffer.length = 0;
            // store in .history device
            const singleLineSrc = srcService.src(result.parsed);
            this.storeSrcLine(singleLineSrc);

            await ps.runInShell(result.parsed, this.sessionKey);
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
      } finally {
        // Can we assume other processes in foreground have terminated?
        processService.clearCleanups(this.session.sid);
        this.input?.resolve();
        this.input = null;
      }
    }
  }
}

export type MessageFromXterm = (
  | RequestHistoryLine
  | SendLineToShell
  | SendSignalToShell
);

interface RequestHistoryLine {
  key: 'req-history-line',
  historyIndex: number;
}

/**
 * We'll always send exactly one line.
 */
interface SendLineToShell {
  key: 'send-line';
  line: string;
}

interface SendSignalToShell {
  key: 'send-sig';
  signal: SigEnum;
}

export type MessageFromVoiceXterm = (
  | SaidVoiceCommand
  | SendAllVoices
);

interface SaidVoiceCommand {
  key: 'said-voice-cmd';
  uid: string;
}

interface SendAllVoices {
  key: 'send-all-voices';
  voices: string[];
}

export type MessageFromShell = (
  | SendXtermPrompt
  | SendXtermError
  | ClearXterm
  | TtyReceivedLine
  | SendHistoryLine
  | SendVoiceCommand
  | CancelVoiceCommands
  | GetAllVoices
);

/**
 * tty sends and sets xterm prompt
 */
interface SendXtermPrompt {
  key: 'send-xterm-prompt';
  prompt: string;
}

export interface SendXtermError {
  key: 'error';
  msg: string;
}

/**
 * tty clears xterm
 */
interface ClearXterm {
  key: 'clear-xterm';
}

/**
 * tty informs xterm it received input line
 */
interface TtyReceivedLine {
  key: 'tty-received-line';
}

interface SendHistoryLine {
  key: 'send-history-line';
  line: string;
  nextIndex: number;
}

interface SendVoiceCommand {
  key: 'send-voice-cmd';
  command: VoiceCommandSpeech;
  uid: string;
}

interface CancelVoiceCommands {
  key: 'cancel-voice-cmds';
  processKey: string;
}

interface GetAllVoices {
  key: 'get-all-voices';
}