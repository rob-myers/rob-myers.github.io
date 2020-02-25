import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@service/term.service';

export class EchoBuiltin extends BaseBuiltinComposite<BuiltinOtherType.echo> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    yield this.write(this.def.args.join(' ').split('\n'));
  }

}
