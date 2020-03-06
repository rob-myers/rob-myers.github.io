import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { BuiltinOtherType } from '../builtin.model';


export class HistoryBuiltin extends BaseBuiltinComposite<BuiltinOtherType.history> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(_dispatch: OsDispatchOverload, _processKey: string): AsyncIterableIterator<ObservedType> {
    // TODO 
  }

}
