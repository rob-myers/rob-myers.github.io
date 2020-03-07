import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@os-service/term.service';

export class ExtGlobExpand extends BaseExpandComposite<ExpandType.extendedGlob> {

  public get children() {
    return [];
  }

  constructor(public def: ExtGlobExpandDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}

interface ExtGlobExpandDef extends BaseExpandCompositeDef<ExpandType.extendedGlob>, ExtGlobDef {}

interface ExtGlobDef {
  glob: string;
}