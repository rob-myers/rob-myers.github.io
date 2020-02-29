import { TtyOutputCommand } from '@store/inode/tty.inode';

/** Worker in parent thread */
export interface OsWorker extends Worker {
  postMessage(message: MessageFromOsParent): void;
  addEventListener(type: 'message', listener: (message: MessageFromOsWorker) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: MessageFromOsWorker) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void; 
}

/** A web worker */
export interface OsWorkerContext extends Worker {
  postMessage(message: MessageFromOsWorker): void;
  addEventListener(type: 'message', listener: (message: MessageFromOsParent) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: MessageFromOsParent) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void; 
}

interface PingFromParent extends BaseMessage {
  key: 'ping';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong';
}

interface SendLineToTty extends BaseMessage {
  key: 'line-to-tty';
  sessionKey: string;
  xtermKey: string;
  line: string;
}
interface AckTtyLine extends BaseMessage {
  key: 'ack-tty-line';
  sessionKey: string;
  xtermKey: string;
}

interface SigTermTty extends BaseMessage {
  key: 'sig-term-tty';
  sessionKey: string;
}

interface SetXtermPrompt extends BaseMessage {
  key: 'set-xterm-prompt';
  sessionKey: string;
  prompt: string;
}

interface SendXtermCommands extends BaseMessage {
  key: 'send-xterm-cmds';
  sessionKey: string;
  messageUid: string;
  commands: Exclude<TtyOutputCommand, { key: 'resolve' }>[];
}
/** Acknowledge commands sent from tty to xterm */
interface AckXtermCommands extends BaseMessage {
  key: 'ack-xterm-cmds';
  sessionKey: string;
  messageUid: string;
}

interface ClearXterm extends BaseMessage {
  key: 'clear-xterm';
  sessionKey: string;
}

interface UpdateTtyCols extends BaseMessage {
  key: 'update-tty-cols';
  sessionKey: string;
  cols: number;
}

export type MessageFromOsParent = (
  | PingFromParent
  | SendLineToTty
  | SigTermTty
  | AckXtermCommands
  | UpdateTtyCols
);
  
export type MessageFromOsWorker = (
  | PongFromWorker
  | SetXtermPrompt
  | SendXtermCommands
  | ClearXterm
  | AckTtyLine
);

interface BaseMessage {
  /** Message uid */
  key: string;
}
