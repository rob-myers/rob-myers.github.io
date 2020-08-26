import { Subject } from 'rxjs';
import { SigEnum } from './process.model';
import { TtyINode } from '@model/inode/tty.inode';
import { HistoryINode } from '@model/inode/history.inode';
import { VoiceCommandSpeech } from './voice.xterm';

export class TtyHandler {
  out: Subject<MessageFromTty>;
  inode: TtyINode;
  sessionKey: string;

  constructor(ttyId: number) {
    this.out = new Subject; 

    const userKey = 'root';
    const groupKey = userKey;
    const canonicalFilename = `tty-${ttyId}`;
    const canonicalPath = `/dev/${canonicalFilename}`;
    const sessionKey = `${userKey}@${canonicalFilename}`;
    this.sessionKey = sessionKey;

    const historyINode = new HistoryINode({ userKey, groupKey });

    this.inode = new TtyINode({
      userKey,
      groupKey,
      canonicalPath,
      historyINode,
      sendSignal: (_signal) => {}, // NOOP
      setPrompt: (_prompt) => {}, // NOOP
      clearXterm: () => this.out.next({
        key: 'clear-xterm',
        sessionKey,
      }),
      writeToXterm: (lines, messageUid) => this.out.next({
        key: 'write-to-xterm',
        sessionKey,
        messageUid,
        lines,
      }),
    });
  }

  ackReceivedLines(messageUid: string) {
    Object.keys(this.inode.resolveLookup).forEach((key) => {
      if (key === messageUid) {
        this.inode.resolveLookup[messageUid]();
        delete this.inode.resolveLookup[messageUid];
      }
    });
  }

  lineToTty(line: string) {
    this.inode.inputs.push({
      line,
      resolve: () => this.out.next({
        key: 'tty-received-line',
        sessionKey: this.sessionKey,
      })
    });
    this.inode.awakenFirstPendingReader();
  }

  requestHistoryLine(historyIndex: number) {
    const { line, nextIndex } = this.inode.def.historyINode.getLine(historyIndex);
    this.out.next({
      key: 'send-history-line',
      sessionKey: this.sessionKey,
      line,
      nextIndex,
    });
  }

  saidVoiceCommand(_uid: string) {
    // NOOP
  }

  sendAllVoices(voices: string[]) {
    // NOOP
  }

  sendTtySignal(signal: SigEnum) {
    if (signal === SigEnum.SIGINT) {
      this.inode.sendSigInt();
    }
  }

}

export type MessageFromTty = (
  | SetXtermPrompt
  | WriteToXterm
  | ClearXterm
  | TtyReceivedLine
  | SendHistoryLine
  | SendVoiceCommand
  | CancelVoiceCommands
  | GetAllVoices
);

/**
 * tty sets xterm prompt
 */
interface SetXtermPrompt {
  key: 'set-xterm-prompt';
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