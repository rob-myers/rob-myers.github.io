import { TtyXterm } from '@model/xterm/tty.xterm';

export interface XTermState {
  key: string;
  uiKey: string;
  userKey: string;
  sessionKey: string;
  ttyXterm: TtyXterm;
}

export function createXTermState(init: XTermState): XTermState {
  return { ...init };
}

export function computeXtermKey(uiKey: string, sessionKey: string) {
  return `${uiKey}@${sessionKey}`;
}
