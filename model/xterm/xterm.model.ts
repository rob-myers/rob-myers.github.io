import { Redacted } from '@model/redux.model';
import { Terminal } from 'xterm';

export interface XTermState {
  key: string;
  sessionKey: string;
  xterm: null | Redacted<Terminal>;
}

export function createXTermState(key: string, sessionKey: string): XTermState {
  return {
    key,
    sessionKey,
    xterm: null,
  };
}
