import { SigEnum } from './process.model';

export class VirtualTty {
  postMessage(_input: MessageFromOsParent) {
    /**
     * TODO
     */
  }
}

export type MessageFromOsParent = (
  // | PingFromParent
  | SendLineToTty
  | SendTtySignal
  | XtermReceivedLines
  | UpdateTtyCols
  // | CreateSession
  // | EndSession
  | RequestHistoryLine
  // | SaveOperatingSystem
);

/**
 * xterm sends single input line to tty
 */
interface SendLineToTty {
  key: 'line-to-tty';
  sessionKey: string;
  xtermKey: string;
  line: string;
}

/**
 * xterm sends signal to tty
 */
interface SendTtySignal {
  key: 'send-tty-signal';
  sessionKey: string;
  signal: SigEnum;
}

/**
 * xterm informs tty it received lines
 */
interface XtermReceivedLines {
  key: 'xterm-received-lines';
  sessionKey: string;
  messageUid: string;
}

/**
 * xterm tells tty its number of columns
 */
interface UpdateTtyCols {
  key: 'update-tty-cols';
  sessionKey: string;
  cols: number;
}

interface RequestHistoryLine {
  key: 'request-history-line';
  sessionKey: string;
  /** Non-negative integer */
  historyIndex: number;
}

export type MessageFromOsWorker = (
  // | PongFromWorker
  // | WorkerOsReady
  | SetXtermPrompt
  | WriteToXterm
  | ClearXterm
  | TtyReceivedLine
  // | CreatedSession
  | SendHistoryLine
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
  uiKey: string;
}

interface SendHistoryLine {
  key: 'send-history-line';
  sessionKey: string;
  line: string;
  nextIndex: number;
}
