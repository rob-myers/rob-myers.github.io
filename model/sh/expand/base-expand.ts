import { BaseCompositeTerm } from '../composite/base-composite';
import { CompositeType } from '@model/term.model';
import { BaseTermDef } from '../base-term';
import { ProcessVar } from '@model/process.model';
import { ExpandType } from '../expand.model';

export abstract class BaseExpandComposite<ExactKey extends ExpandType> extends BaseCompositeTerm<CompositeType.expand> {

  public expandKey: ExactKey;
  /**
   * get: useful when only one value, or
   * when multiple values should be joined.
   */
  public get value(): string {
    return this.values.join(' ');
  }
  /**
   * set: useful when there is only one value.
   */
  public set value(x: string) {
    this.values = [x];
  }
  /**
   * Array needed, e.g. $@ can produce multiple fields.
   */
  public values: string[];

  constructor(public def: BaseExpandCompositeDef<ExactKey>) {
    super(def);
    this.values = [];
    this.expandKey = def.expandKey;
  }

  public onEnter() {
    super.onEnter();
    this.values = [];
  }

  protected getVarKeys(value: undefined | ProcessVar['value']): string[] {
    if (value && typeof value === 'object') {
      return Object.keys(value);
    }
    return [];
  }

  protected getVarValues(
    index: string | null,
    value: undefined | ProcessVar['value']
  ): string[] {
    if (value == null) {
      // undefined ~ never set, null: declared but not set, or unset.
      return [];
    } else if (Array.isArray(value)) {
      // Must remove empties e.g. crashes getopts.
      return index === '@' || index === '*'
        ? (value as any[]).filter((x) => x !== undefined).map(String)
        : [String(value[index ? parseInt(index) : 0])];
    } else if (typeof value === 'object') {
      return index === '@' || index === '*'
        ? Object.values(value as Record<string, string | number>).map(String)
        : [String(value[index || 0])];
    }
    return [String(value)];
  }

}

export interface BaseExpandCompositeDef<ExactKey extends ExpandType> extends BaseTermDef<CompositeType.expand>, BaseExpandDef<ExactKey> {}

interface BaseExpandDef<ExactKey extends ExpandType> {
  expandKey: ExactKey;
}
