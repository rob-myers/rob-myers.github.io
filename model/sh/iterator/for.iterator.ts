import { BaseIteratorTerm, BaseIteratorTermDef } from './base-iterator';
import { IteratorType, ExpandComposite, Term } from '@model/os/term.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { ExpandType } from '../expand.model';
import { normalizeWhitespace } from '@service/term.util';
import { osAssignVarThunk } from '@store/os/declare.os.duck';

/**
 * for {paramName} in {items}; do {body}; done
 */
export class ForIterator extends BaseIteratorTerm<IteratorType.for> {

  public get children(): Term[] {
    const { items, body } = this.def;
    return [ ...items, body];
  }

  constructor(public def: ForIteratorDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { items, body, paramName } = this.def;
    let stop = false;

    for (const item of items) {
      // Expand word.
      yield* this.runChild({ child: item, dispatch, processKey });

      const values = (item.def.expandKey === ExpandType.parameter
        || item.def.expandKey === ExpandType.command
      ) ? normalizeWhitespace(item.value) : item.values;

      // Iterate over words in expansion.
      for (const word of values) {
        dispatch(osAssignVarThunk({ processKey, varName: paramName, act: { key: 'default', value: word } }));
        yield* this.runChild({ child: body, dispatch, processKey });
  
        if (this.breakDepth || this.returnCode !== null || this.continueDepth && this.continueDepth > 1) {
          this.propagateBreakers();
          stop = true;
          break;
        } else if (this.continueDepth === 1) {
          this.continueDepth = 0;// No need to continue.
        }
      }
      if (stop) {
        break;
      }
    }
    yield this.exit();
  }
}

interface ForIteratorDef extends BaseIteratorTermDef<IteratorType.for>, ForDef<ExpandComposite> {}

export interface ForDef<WordType> {
  items: WordType[];
  paramName: string;
}
