import { SigEnum } from "./io.model";

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
 * After the xterm receives line(s) from user,
 * it sends them to the shell using this message.
 */
interface SendLineToShell {
  key: 'send-line';
  line: string;
}

interface SendSignalToShell {
  key: 'send-sig';
  signal: SigEnum;
}

export type MessageFromShell = (
  | SendXtermPrompt
  | SendXtermError
  | ClearXterm
  | TtyReceivedLine
  | SendHistoryLine
);

/** tty sends and sets xterm prompt */
interface SendXtermPrompt {
  key: 'send-xterm-prompt';
  prompt: string;
}

export interface SendXtermError {
  key: 'error';
  msg: string;
}

/** tty clears xterm */
interface ClearXterm {
  key: 'clear-xterm';
}

/** tty informs xterm it received input line */
interface TtyReceivedLine {
  key: 'tty-received-line';
}

interface SendHistoryLine {
  key: 'send-history-line';
  line: string;
  nextIndex: number;
}
