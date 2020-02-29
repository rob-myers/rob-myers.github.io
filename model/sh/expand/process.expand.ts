import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { CompositeChildren } from '../composite/base-composite';
import { Term } from '@model/os/term.model';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@os-service/term.service';

export class ProcessExpand extends BaseExpandComposite<ExpandType.process> {

  constructor(public def: ProcessExpandDef) {
    super(def);
  }

  public get children() {
    return this.def.cs;
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}

interface ProcessExpandDef extends BaseExpandCompositeDef<ExpandType.process>, BaseProcessDef<Term> {}

interface BaseProcessDef<T> extends CompositeChildren<T> {
  dir: '<' | '>';
}
