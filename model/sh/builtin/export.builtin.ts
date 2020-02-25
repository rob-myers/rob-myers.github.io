import { BuiltinSpecialType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@service/term.service';

export class ExportBuiltin extends BaseDeclareComposite<BuiltinSpecialType.export> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }

}
