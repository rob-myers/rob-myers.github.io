import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { ExpandComposite } from '@model/os/term.model';
import { ExpandType, isExpansionSpecial } from '../expand.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

export class DoubleQuoteExpand extends BaseExpandComposite<ExpandType.doubleQuote> {

  public get children() {
    return this.def.cs;
  }

  constructor(public def: DoubleQuoteExpandDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const output = [] as string[];

    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey });

      if (isExpansionSpecial(child)) {
        // Only $@ and ${x[@]} are special.
        const { values } = child;
        output.push(`${output.pop() || ''}${values[0] || ''}`, ...values.slice(1));
      } else {
        // Concatencate to last element of {output}.
        output.push(`${output.pop() || ''}${child.value || ''}`);
      }
    }

    this.values = output;
  }

}

interface DoubleQuoteExpandDef extends BaseExpandCompositeDef<ExpandType.doubleQuote>, DoubleQuoteDef<ExpandComposite> {}

export interface DoubleQuoteDef<T> {
  cs: T[];
  locale: boolean;
}
