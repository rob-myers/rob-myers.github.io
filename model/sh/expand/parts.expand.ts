import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { CompositeChildren } from '../composite/base-composite';
import { ExpandComposite } from '@model/os/term.model';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { last } from '@model/generic.model';
import { normalizeWhitespace } from '@service/term.util';

export class PartsExpand extends BaseExpandComposite<ExpandType.parts> {
  
  public get children() {
    return this.def.cs;
  }

  constructor(public def: PartsExpandDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    /**
     * Compute each part.
     * Joining the parts together will be non-trivial.
     */
    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey });
    }
    /*
      * Is the last value computed via a parameter/command-expansion,
      * and if so does it have trailing whitespace?
      */
    let lastTrailing = false;
    const values = this.values;// Reference.

    for (const { def: { expandKey: partKey }, value } of this.def.cs) {
      if (partKey === ExpandType.parameter || partKey === ExpandType.command) {
        const vs = normalizeWhitespace(value, false);// Do not trim.
        // console.log({ value, vs });
        if (!vs.length) {
          continue;
        } else if (!values.length || lastTrailing || /^\s/.test(vs[0])) {
          // Freely add, although trim 1st and last.
          values.push(...vs.map((x) => x.trim()));
        } else {
          // Either {last(vs)} a trailing quote, or it has no trailing space.
          // Since vs[0] has no leading space we must join words.
          values.push(values.pop() + vs[0].trim());
          values.push(...vs.slice(1).map((x) => x.trim()));
        }
        // Check last element (pre-trim).
        lastTrailing = /\s$/.test(last(vs) as string);
      } else if (!values.length || lastTrailing) {// Freely add.
        values.push(value);
        lastTrailing = false;
      } else {// Must join.
        values.push(values.pop() + value);
        lastTrailing = false;
      }
    }
  }
}

interface PartsExpandDef extends BaseExpandCompositeDef<ExpandType.parts>, CompositeChildren<ExpandComposite> {}
