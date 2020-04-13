import { SigEnum } from './process.model';
import { VoiceCommandSpeech } from '@model/xterm/voice.xterm';
import { BaseMessage, Message } from '@model/worker.model';

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

interface WorkerOsReady extends BaseMessage {
  key: 'worker-os-ready';
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
export interface CreatedSession extends BaseMessage {
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
  signal: SigEnum;
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

interface RequestHistoryLine extends BaseMessage {
  key: 'request-history-line';
  sessionKey: string;
  /** Non-negative integer */
  historyIndex: number;
}
interface SendHistoryLine extends BaseMessage {
  key: 'send-history-line';
  sessionKey: string;
  line: string;
  nextIndex: number;
}

interface SaveOperatingSystem extends BaseMessage {
  key: 'save-os';
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
  | RequestHistoryLine
  | SaveOperatingSystem
);
  
export type MessageFromOsWorker = (
  | PongFromWorker
  | WorkerOsReady
  | SetXtermPrompt
  | WriteToXterm
  | ClearXterm
  | TtyReceivedLine
  | CreatedSession
  | SendVoiceCommand
  | CancelVoiceCommands
  | GetAllVoices
  | SendHistoryLine
);

// Shortcut
type MsgFrmWrk<Key> = Extract<MessageFromOsWorker, { key: Key }>

export async function awaitWorker<Key extends MessageFromOsWorker['key']>(
  key: Key,
  worker: OsWorker,
  /** Return truthy iff message received */
  isMessage: (message: MsgFrmWrk<Key>) => boolean = () => true,
  act?: (message: MsgFrmWrk<Key>) => void
): Promise<MsgFrmWrk<Key>> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromOsWorker>) => {
      if (message.data.key === key) {
        const data = message.data as MsgFrmWrk<Key>;
        if (isMessage(data)) {
          worker.removeEventListener('message', listener);
          act && act(data);
          resolve(data);
        }
      }
    };
    worker.addEventListener('message', listener);
  });
}

// Shortcut
type MsgFrmPar<Key> = Extract<MessageFromOsParent, { key: Key }>

export async function awaitParent<Key extends MessageFromOsParent['key']>(
  key: Key,
  worker: OsWorkerContext,
  /** Return truthy iff message received */
  isMessage: (message: MsgFrmPar<Key>) => boolean = () => true,
  act?: (message: MsgFrmPar<Key>) => void
): Promise<MsgFrmPar<Key>> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromOsParent>) => {
      if (message.data.key === key) {
        const data = message.data as MsgFrmPar<Key>;
        if (isMessage(data)) {
          worker.removeEventListener('message', listener);
          act && act(data);
          resolve(data);
        }
      }
    };
    worker.addEventListener('message', listener);
  });
}
