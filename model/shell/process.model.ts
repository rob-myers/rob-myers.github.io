import { OpenFileRequest } from "./file.model";

export type FromFdToOpenKey = Record<number, string>;

export type ProcessAct = (
  | ArrayAssign
  | Expanded
  | Unimplemented
  // ...
);

export const act = {
  arrayAsgn: (
    pairs: ArrayAssign['pairs'],
    associative: boolean,
  ): ArrayAssign => ({
    key: 'array-asgn', pairs, associative,
  }),
  expanded: (values: string | string[]): Expanded => ({
    key: 'expanded',
    values: values instanceof Array ? values : [values],
    value: values instanceof Array ? values.join(' ') : values,
  }),
  unimplemented: (): Unimplemented => ({
    key: 'unimplemented',
  }),
};

export interface ArrayAssign {
  key: 'array-asgn';
  pairs: { key: null | string; value: string }[];
  associative: boolean;
}

export interface Expanded {
  key: 'expanded';
  values: string[];
  /** This is values.join(' ') */
  value: string;
}

interface Unimplemented {
  key: 'unimplemented';
}

export enum SigEnum {
  SIGHUP='SIGHUP',
  SIGINT='SIGINT',
  SIGQUIT='SIGQUIT',
  SIGILL='SIGILL',
  SIGTRAP='SIGTRAP',
  SIGART='SIGART',
  SIGEMT='SIGEMT',
  SIGFPE='SIGFPE',
  SIGKILL='SIGKILL',
  SIGBUS='SIGBUS',
  SIGSEGV='SIGSEGV',
  SIGSYS='SIGSYS',
  SIGPIPE='SIGPIPE',
  SIGALRM='SIGALRM',
  SIGTERM='SIGTERM',
  SIGURG='SIGURG', 
  SIGSTOP='SIGSTOP',
  SIGTSTP='SIGTSTP',
  SIGCONT='SIGCONT',
  SIGCHLD='SIGCHLD',
  SIGTTIN='SIGTTIN',
  SIGTTOU='SIGTTOU',
  SIGIO='SIGIO',
  SIGXCPU='SIGXCPU',
  SIGXFSZ='SIGXFSZ',
  SIGVTALRM='SIGVTALRM',
  SIGPROF='SIGPROF',
  SIGWINCH='SIGWINCH',
  SIGINFO='SIGINFO',
  SIGUSR1='SIGUSR1',
  SIGUSR2='SIGUSR2',
}
