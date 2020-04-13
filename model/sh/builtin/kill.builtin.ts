import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';
import { sigIntsOpts, sigKeysOpts } from '@model/os/process.model';


export class KillBuiltin extends BaseBuiltinComposite<
  BuiltinOtherType.kill,
  { string: never[]; boolean: ('l')[] }
> {

  public specOpts() {
    return {
      string: [],
      boolean: ['l', ...sigIntsOpts, ...sigKeysOpts] as 'l'[],
    };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    if (this.opts.l) {
      yield this.write(this.signalsText());
      yield this.exit();
    }


  }

  private signalsText() {
    return [
      '1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP',
      '6) SIGABRT	 7) SIGEMT	 8) SIGFPE	 9) SIGKILL	10) SIGBUS',
      '11) SIGSEGV	12) SIGSYS	13) SIGPIPE	14) SIGALRM	15) SIGTERM',
      '16) SIGURG	17) SIGSTOP	18) SIGTSTP	19) SIGCONT	20) SIGCHLD',
      '21) SIGTTIN	22) SIGTTOU	23) SIGIO	24) SIGXCPU	25) SIGXFSZ',
      '26) SIGVTALRM	27) SIGPROF	28) SIGWINCH	29) SIGINFO	30) SIGUSR1',
      '31) SIGUSR2',
    ];
  }

}
