import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../os/term.model';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * time
 */
export class TimeComposite extends BaseCompositeTerm<CompositeType.time> {

  public get children() {
    return this.def.timed ? [this.def.timed] : [];
  }

  constructor(public def: TimeCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    // Microseconds since epoch
    const before = Date.now();
    if (this.def.timed) {
      yield* this.runChild({ child: this.def.timed, dispatch, processKey });
    }
    const delta = Date.now() - before;
    const output = `real\t${delta}µs`;
    yield this.write(['', output], 1);
  }
}

type TimeCompositeDef = BaseTermDef<CompositeType.time> & TimeDef<Term>;

interface TimeDef<T> {
  timed: T | null;
  posix: boolean;
}
