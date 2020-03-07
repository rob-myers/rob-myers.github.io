import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@os-service/term.service';
import { interpretEscapeSequences } from '@os-service/term.util';

export class SingleQuoteExpand extends BaseExpandComposite<ExpandType.singleQuote> {

  public get children() {
    return [];
  }

  constructor(public def: SingleQuoteExpandDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    this.value = this.def.interpret
      ? interpretEscapeSequences(this.def.value)
      : this.def.value;
  }
}

interface SingleQuoteExpandDef extends BaseExpandCompositeDef<ExpandType.singleQuote>, SingleQuoteDef {}

export interface SingleQuoteDef {
  value: string;
  interpret: boolean;
}
