import { testNever } from '@model/generic.model';
import useStore, { Session } from '@store/shell.store';
import { parseSh } from './parse.service';
import { SigEnum } from './process.model';
import { FsFile } from './file.model';
import { VoiceCommandSpeech } from './voice.xterm';
import { TtyXterm } from './tty.xterm';
import { processService as ps, processService } from './process.service';
import { srcService } from './src.service';

export class TtyShell {

  public xterm!: TtyXterm;
  /** Lines received from a TtyXterm. */
  private inputs = [] as { line: string; resolve: () => void }[];
  /** Lines in current interactive parse */
  private buffer = [] as string[];
  /** Source code entered interactively, most recent last. */
  private history = [] as string[];
  private readonly maxLines = 500;
  
  private get session(): Session {
    return useStore.getState().session[this.sessionKey];
  }

  constructor(
    public sessionKey: string,
    public canonicalPath: string,
    public io: FsFile<MessageFromXterm, MessageFromShell>,
  ) {}
  
  initialise(xterm: TtyXterm) {
    this.xterm = xterm;
    this.io.listen(this.onMessage.bind(this));
    this.prompt('$ ');
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
      case 'send-lines': {
        this.inputs.push({
          line: msg.lines[0],
          // xterm won't send another line until resolved
          resolve: () => this.io.write({
            key: 'tty-received-line',
          }),
        });
        this.tryParse();
        break;
      }
      case 'send-sig': {
        console.log('received signal', { msg, sessionKey: this.sessionKey });
        if (msg.signal === SigEnum.SIGINT) {
          processService.stopProcess(this.session.sid);
          this.session.cancels.reverse().forEach(cancel => cancel());
          this.prompt('$ ');
        }
        break;
      }
      default: throw testNever(msg);
    }

  }

  private async tryParse() {
    const input = this.inputs.pop();
    
    if (input) {
      try {// Catching Ctrl-C of ps.runInShell
        this.buffer.push(input.line);
        const result = parseSh.tryParseBuffer(this.buffer.slice()); // Can't error
  
        switch (result.key) {
          case 'failed': {
            console.error(result.error.replace(/^Error: runtime error: src\.sh:/, ''));
            this.buffer.length = 0;
            this.prompt('$ ');
            break;
          }
          case 'complete': {
            this.buffer.length = 0;
            // store in .history device
            const singleLineSrc = srcService.src(result.parsed);
            this.storeSrcLine(singleLineSrc);

            await ps.runInShell(result.parsed, this.sessionKey);
            this.prompt('$ ');
            break;
          }
          case 'incomplete': {
            this.prompt('> ');
            break;
          }
        }
      } catch (e) {
        // Cancelled via Ctrl+C
      } finally {
        this.session.cancels.length = 0;
        input.resolve();
      }
    }
  }

  private prompt(prompt: string) {
    this.io.write({
      key: 'send-xterm-prompt',
      prompt: `\u001b[37m${prompt}\x1b[0m`, // White prompt
    });    
  }

  private getHistoryLine(lineIndex: number) {
    const maxIndex = this.history.length - 1;
    return {
      line: this.history[maxIndex - lineIndex] || '',
      nextIndex: lineIndex < 0 ? 0 : lineIndex > maxIndex ? maxIndex : lineIndex,
    };
  }

  private storeSrcLine(srcLine: string) {
    if (srcLine) {
      this.history.push(srcLine);
      while (this.history.length > this.maxLines)
        this.history.shift();
    }
  }
}

export type MessageFromXterm = (
  | RequestHistoryLine
  | SendLinesToShell
  | SendSignalToShell
);

interface RequestHistoryLine {
  key: 'req-history-line',
  historyIndex: number;
}

/**
 * We'll always send exactly one line.
 * Use 'send-lines' to fit global convention.
 */
interface SendLinesToShell {
  key: 'send-lines';
  lines: string[];
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
  | WriteToXterm
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

/**
 * tty writes lines to xterm
 */
interface WriteToXterm {
  key: 'send-lines';
  messageUid: string;
  lines: string[];
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