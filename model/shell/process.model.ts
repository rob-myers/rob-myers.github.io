export type FromFdToOpenKey = Record<number, string>;

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

export type ProcessAct = (
  | Expanded
  | Unimplemented
  | WorldCoords
  // ...
);

export const act = {
  unimplemented: (): Unimplemented => ({ key: 'unimplemented' }),
  expanded: (values: string | string[]): Expanded =>
    ({ key: 'expanded', values: values instanceof Array ? values : [values] }),
};

interface Unimplemented {
  key: 'unimplemented';
}

export interface Expanded {
  key: 'expanded';
  values: string[];
}

interface WorldCoords {
  key: 'world-coords';
  x: number;
  y: number;  
}
