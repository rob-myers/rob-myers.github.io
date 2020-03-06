import { ProcessSignal } from './process.model';
import { VoiceCommandSpeech } from '@model/xterm/voice.xterm';

export interface Message<Data> extends MessageEvent {
  data: Data;
}

/** Worker in parent thread */
export interface OsWorker extends Worker {
  postMessage(message: MessageFromOsParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromOsWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromOsWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void; 
}

/** A web worker */
export interface OsWorkerContext extends Worker {
  postMessage(message: MessageFromOsWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromOsParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: Message<MessageFromOsParent>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void; 
}

interface PingFromParent extends BaseMessage {
  key: 'ping';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong';
}

/**
 * xterm requests a new session from tty
 */
interface CreateSession extends BaseMessage {
  key: 'create-session';
  userKey: string;
  uiKey: string;
}
/**
 * tty informs xterm about newly created session
 */
interface CreatedSession extends BaseMessage {
  key: 'created-session';
  uiKey: string;
  sessionKey: string;
  canonicalPath: string;
}

/**
 * xterm requests session to end on dismount
 * TODO xterms connected to same session
 */
interface EndSession extends BaseMessage {
  key: 'end-session';
  sessionKey: string;
}

/**
 * xterm sends single input line to tty
 */
interface SendLineToTty extends BaseMessage {
  key: 'line-to-tty';
  sessionKey: string;
  xtermKey: string;
  line: string;
}
/**
 * tty informs xterm it received input line
 */
interface TtyReceivedLine extends BaseMessage {
  key: 'tty-received-line';
  sessionKey: string;
  uiKey: string;
}

/**
 * xterm sends signal to tty
 */
interface SendTtySignal extends BaseMessage {
  key: 'send-tty-signal';
  sessionKey: string;
  signal: ProcessSignal;
}

/**
 * tty sets xterm prompt
 */
interface SetXtermPrompt extends BaseMessage {
  key: 'set-xterm-prompt';
  sessionKey: string;
  prompt: string;
}

/**
 * tty writes lines to xterm
 */
interface WriteToXterm extends BaseMessage {
  key: 'write-to-xterm';
  sessionKey: string;
  messageUid: string;
  lines: string[];
}

/**
 * xterm informs tty it received lines
 */
interface XtermReceivedLines extends BaseMessage {
  key: 'xterm-received-lines';
  sessionKey: string;
  messageUid: string;
}

/**
 * tty clears xterm
 */
interface ClearXterm extends BaseMessage {
  key: 'clear-xterm';
  sessionKey: string;
}

/**
 * xterm tells tty its number of columns
 */
interface UpdateTtyCols extends BaseMessage {
  key: 'update-tty-cols';
  sessionKey: string;
  cols: number;
}

interface SendVoiceCommand extends BaseMessage {
  key: 'send-voice-cmd';
  command: VoiceCommandSpeech;
  uid: string;
}
interface SaidVoiceCommand extends BaseMessage {
  key: 'said-voice-cmd';
  uid: string;
}

interface CancelVoiceCommands extends BaseMessage {
  key: 'cancel-voice-cmds';
  processKey: string;
}

interface GetAllVoices extends BaseMessage {
  key: 'get-all-voices';
}
interface SendAllVoices extends BaseMessage {
  key: 'send-all-voices';
  voices: string[];
}

export type MessageFromOsParent = (
  | PingFromParent
  | SendLineToTty
  | SendTtySignal
  | XtermReceivedLines
  | UpdateTtyCols
  | CreateSession
  | EndSession
  | SaidVoiceCommand
  | SendAllVoices
);
  
export type MessageFromOsWorker = (
  | PongFromWorker
  | SetXtermPrompt
  | WriteToXterm
  | ClearXterm
  | TtyReceivedLine
  | CreatedSession
  | SendVoiceCommand
  | CancelVoiceCommands
  | GetAllVoices
);

interface BaseMessage {
  /** Message uid */
  key: string;
}

export function listenToWorkerUntil(
  worker: OsWorker,
  /** Return truthy iff should unregister */
  listener: (message: Message<MessageFromOsWorker>) => any,
) {
  worker.addEventListener('message', (message) => {
    if (listener(message)) {
      worker.removeEventListener('message', listener);
    }
  });
}

export function listenToParentUntil(
  worker: OsWorkerContext,
  /** Return truthy iff should unregister */
  listener: (message: Message<MessageFromOsParent>) => any,
) {
  worker.addEventListener('message', (message) => {
    if (listener(message)) {
      worker.removeEventListener('message', listener);
    }
  });
}
