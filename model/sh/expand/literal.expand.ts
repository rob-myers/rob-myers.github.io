import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@os-service/term.service';
import { CompositeType } from '@model/os/term.model';
const braceExpansion = require('brace-expansion') as (input: string) => string[];

export class LiteralExpand extends BaseExpandComposite<ExpandType.literal> {

  public get children() {
    return [];
  }

  constructor(public def: LiteralExpandDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * Remove at most one '\\\n'; can arise interactively in quotes,
     * see https://github.com/mvdan/sh/issues/321.
    */
    const value = this.def.value.replace(/\\\n/, '');

    if (this.parent) {// Literal must have parent.
      if (this.parent.key === CompositeType.expand && this.parent.def.expandKey === ExpandType.doubleQuote) {
      /**
       * Double quotes: escape only ", \, $, `, no brace-expansion.
       */
        this.value = value.replace(/\\(["\\$`])/g, '$1');
      } else if (this.parent.key === CompositeType.test_op) {
      /**
       * [[ ... ]]: Escape everything, no brace-expansion.
       */
        this.value = value.replace(/\\(.|$)/g, '$1');
      } else if (this.parent.key === CompositeType.redirect) {
      /**
       * Redirection (e.g. here-doc): escape everything, no brace-expansion.
       */
        this.value = value.replace(/\\(.|$)/g, '$1');
      } else {
      /**
       * Otherwise: escape everything, apply brace-expansion.
       */
        this.values = braceExpansion(value.replace(/\\(.|$)/g, '$1'));
      }
    }
  }
}

interface LiteralExpandDef extends BaseExpandCompositeDef<ExpandType.literal>, LiteralDef {}

interface LiteralDef {
  value: string;
}