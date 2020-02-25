import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { osLookupVarThunk, osRemoveFunctionThunk, osUnsetVarThunk } from '@store/os/declare.os.duck';

export class UnsetBuiltin extends BaseBuiltinComposite<
  BuiltinSpecialType.unset,
  { string: never[]; boolean: ('f' | 'v')[] }
> {

  public specOpts() {
    return { string: [], boolean: ['f', 'v'] as ('f' | 'v')[] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    for (const varOrFuncName of this.operands) {
      if (this.opts.f) {
        try {
          dispatch(osRemoveFunctionThunk({ processKey, funcName: varOrFuncName }));
        } catch (e) {
          yield this.exit(1, `${varOrFuncName}: cannot unset: readonly function`);
        }
      } else if (this.opts.v) {
        dispatch(osUnsetVarThunk({ processKey, varName: varOrFuncName }));
        // Unset variable if exists and not already unset.
      } else if (dispatch(osLookupVarThunk({ processKey, varName: varOrFuncName })) != null) {
        dispatch(osUnsetVarThunk({ processKey, varName: varOrFuncName }));
      } else {
        try {
          dispatch(osRemoveFunctionThunk({ processKey, funcName: varOrFuncName }));
        } catch (e) {
          yield this.exit(1, `${varOrFuncName}: cannot unset: readonly function`);
        }
      }
    }
  }

}
