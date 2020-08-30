import { SigEnum } from './process.model';
import { testNever } from '@model/generic.model';
import useStore, { State as ShellState, Session } from '@store/shell.store';
import { VoiceCommandSpeech } from './voice.xterm';
import { TtyXterm } from './tty.xterm';
import { parseSh } from './parse.service';

export class TtyShell {

  private xterm!: TtyXterm;
  /** Lines received from a TtyXterm. */
  public inputs = [] as { line: string; resolve: () => void }[];
  /** Lines in current interactive parse */
  public buffer = [] as string[];

  /** Source code entered interactively, most recent last. */
  private history = [] as string[];
  private readonly maxLines = 500;
  
  private set!: ShellState['api']['set'];
  private get session(): Session {
    return useStore.getState().session[this.sessionKey];
  }

  constructor(
    public sessionKey: string,
    public canonicalPath: string,
  ) {}
  
  initialise(xterm: TtyXterm) {
    this.xterm = xterm;
    this.xterm.outgoing.subscribe(this.onMessage.bind(this));
    
    this.set = useStore.getState().api.set;
    const { service } = this.session;

    this.set(state => {
      const { ofd } =  state.session[this.sessionKey]
      // To read from tty we'll subscribe to its outgoing Subject
      ofd['rd-tty'] = service.createOfd('rd-tty', xterm.outgoing, { mode: 'RDONLY' });
      // To write from tty we'll subscribe to its incoming Subject
      ofd['wr-tty'] = service.createOfd('wr-tty', xterm.incoming, { mode: 'WRONLY' });
    });

    this.prompt('$ ');
  }

  private prompt(prompt: string) {
    this.xterm.incoming.next({
      key: 'send-xterm-prompt',
      prompt,
      sessionKey: this.sessionKey,
    });    
  }

  private onMessage(msg: MessageFromXterm) {
    switch (msg.key) {
      case 'req-history-line': {
        const { line, nextIndex } = this.getHistoryLine(msg.historyIndex);
        this.xterm.incoming.next({
          key: 'send-history-line',
          sessionKey: this.sessionKey,
          line,
          nextIndex,
        });
        break;
      }
      case 'send-line-to-shell': {
        this.inputs.push({
          line: msg.line,
          // xterm won't send another line until resolved
          resolve: () => this.xterm.incoming.next({
            key: 'tty-received-line',
            sessionKey: this.sessionKey,
          }),
        });
        this.tryParse();
        break;
      }
      case 'send-sig-to-shell': {
        if (msg.signal === SigEnum.SIGINT) {
          useStore.getState().api.signalSession(this.sessionKey, msg.signal);
        }
        break;
      }
      default: throw testNever(msg);
    }

  }

  private tryParse() {
    const input = this.inputs.pop();
    
    if (input) {
      this.buffer.push(input.line);
      const result = parseSh.tryParseBuffer(this.buffer.slice());

      switch (result.key) {
        case 'failed': {
          console.error(result.error.replace(/^Error: runtime error: src\.sh:/, ''));
          this.buffer.length = 0;
          break;
        }
        case 'complete': {
          /**
           * TODO transpile and run
           */
          this.buffer.length = 0;
          this.prompt('$ ');
          break;
        }
        case 'incomplete': {
          this.prompt('> ');
          break;
        }
      }
      input.resolve();
    }
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
      while (this.history.length > this.maxLines) this.history.shift();
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

interface SendLineToShell {
  key: 'send-line-to-shell';
  line: string;
}

interface SendSignalToShell {
  key: 'send-sig-to-shell';
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
  sessionKey: string;
  prompt: string;
}

/**
 * tty writes lines to xterm
 */
interface WriteToXterm {
  key: 'write-to-xterm';
  sessionKey: string;
  messageUid: string;
  lines: string[];
}

/**
 * tty clears xterm
 */
interface ClearXterm {
  key: 'clear-xterm';
  sessionKey: string;
}

/**
 * tty informs xterm it received input line
 */
interface TtyReceivedLine {
  key: 'tty-received-line';
  sessionKey: string;
}

interface SendHistoryLine {
  key: 'send-history-line';
  sessionKey: string;
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