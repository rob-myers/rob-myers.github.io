import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osGoHomeThunk, osRealPathThunk, osAbsToINodeThunk, osUpdatePwdThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';

export class CdBuiltin extends BaseBuiltinComposite<BuiltinOtherType.cd> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { args } = this.def;

    if (args.length === 0) {
      dispatch(osGoHomeThunk({ processKey }));
      yield this.exit();
    }
    
    if (args.length === 1) {
      if (args[0] === '-') {
        /**
         * Swap PWD and OLDPWD.
         */
        dispatch(osUpdatePwdThunk({ processKey, act: { key: 'swap' }}));
        yield this.exit();
      }
      
      const absPath = dispatch(osRealPathThunk({ processKey, path: args[0] }));
      const iNode = dispatch(osAbsToINodeThunk({ absPath }));
      if (iNode.type !== INodeType.directory) {
        yield this.exit(1, 'not a directory');
      }
      /**
       * Set OLDPWD := PWD, and PWD := absPath.
       */
      dispatch(osUpdatePwdThunk({ processKey, act: { key: 'store', nextPWD: absPath }}));

    } else {
      yield this.exit(1, 'too many arguments');
    }
  }

}
