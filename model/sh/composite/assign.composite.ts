import { testNever } from '@model/generic.model';
import { BaseAssignOpts, osAssignVarThunk } from '@store/os/declare.os.duck';
import { BaseCompositeTerm } from './base-composite';
import { CompositeType, ExpandComposite } from '@model/term.model';
import { ArrayComposite } from './array.composite';
import { ArithmOpComposite } from './arithm-op.composite';
import { BaseTermDef } from '../base-term';
import { OsDispatchOverload } from '@model/os.redux.model';
import { ObservedType } from '@service/term.service';

/**
 * assignment
 */
export class AssignComposite extends BaseCompositeTerm<CompositeType.assign> {

  public declOpts: Partial<BaseAssignOpts>;

  constructor(public def: AssignCompositeDef) {
    super(def);
    this.declOpts = {};
  }

  public get children() {
    const { def } = this;
    switch (def.subKey) {
      case 'array': return [def.array];
      case 'item': return def.value ? [def.index, def.value] : [def.index];
      case 'var': return def.value ? [def.value] : [];
      default: throw testNever(def);
    }
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { varName } = this.def;

    switch (this.def.subKey) {
      case 'array': {
        yield* this.assignArray(dispatch, processKey);
        break;
      }
      case 'item': { 
        /**
         * Run index.
         */
        yield* this.runChild({ child: this.def.index, dispatch, processKey });
        const index = String(this.def.index.value);
        /**
         * Run optional value.
         */
        if (this.def.value) {
          yield* this.runChild({ child: this.def.value, dispatch, processKey });
        }
        /**
         * Unsure if naked is possible here.
         * If {x[i]=} then no def.value so use ''.
         */
        const value = this.def.naked
          ? undefined
          : this.def.value ? this.def.value.value : '';

        dispatch(osAssignVarThunk({ processKey, ...this.declOpts, varName, act: { key: 'item', index, value }}));
        break;
      }
      case 'var': {
        /**
         * {x=foo}, and also {declare -a x} and {declare -a x=foo}
         */
        if (this.def.value) {
          yield* this.runChild({ child: this.def.value, dispatch, processKey });
        }
        /**
         * Naked iff e.g. {declare -i x}.
         * Use undefined so don't overwrite.
         */
        const value = this.def.naked
          ? undefined
          : this.def.value ? this.def.value.value : '';

        if (this.declOpts.array) {// declare -a x
          dispatch(osAssignVarThunk({ processKey, ...this.declOpts, varName, act: { key: 'array', value: value == null ? [] : [value] } }));
        } else if (this.declOpts.associative) {// declare -A x
          dispatch(osAssignVarThunk({ processKey, ...this.declOpts, varName, act: { key: 'map', value: value == null ? {} : { 0: value } } }));
        } else {// x=foo or x+=foo
          dispatch(osAssignVarThunk({
            processKey,
            ...this.declOpts,
            varName,
            act: { key: 'default', value, append: this.def.append },
          }));
        }
        break;
      }
      default: throw testNever(this.def);
    }
  }

  private async *assignArray(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (this.def.subKey === 'array') {

      yield* this.runChild({ child: this.def.array, dispatch, processKey });
      const { pairs } = this.def.array.def;

      if (this.declOpts.associative) {
        /**
         * Associative array via {declare -A}.
         * We also forward {this.associative} flag via {baseAssignOpts}.
         */
        // Even if integer-valued.
        const value = {} as Record<string, string>;
        for (const { key, value: v } of pairs) {
          if (!key) {
            yield this.warn(`${this.def.varName}: ${v.value}: must use subscript when assigning associative array`);
          } else {
            value[key.value] = v.value;
          }
        }
        dispatch(osAssignVarThunk({ processKey, ...this.declOpts, varName: this.def.varName, act: { key: 'map', value } }));
      } else {
        /**
         * Vanilla array.
         */
        const values = [] as string[];// Even if integer-valued.
        let index = 0;
        pairs.map(({ key, value: { value }}) => {
          index = key && (
            (key.key === CompositeType.expand && (parseInt(key.value) || 0))
            || (key.key === CompositeType.arithm_op && (key.value || 0))
          ) || index;
          values[index] = value;
          index++;
        });
        dispatch(osAssignVarThunk({ processKey, ...this.declOpts, varName: this.def.varName, act: { key: 'array', value: values } }));
      }
    }
  }
}

type AssignCompositeDef = (
  & BaseTermDef<CompositeType.assign>
  & AssignDef<ArrayComposite, ArithmOpComposite | ExpandComposite, ExpandComposite>
);
type AssignDef<ArrayType, OpType, WordType> = BaseAssignDef & (
  // x=(foo bar) or x=([foo]=bar)
  | { subKey: 'array'; array: ArrayType }
  // x[i]=y or x[i]= or x[i]+=
  | { subKey: 'item'; append: boolean; index: OpType; value: null | WordType }
  // x=y or x= or x+=
  | AssignDefVar<WordType>
);
export interface AssignDefVar<WordType> {
  subKey: 'var';
  append: boolean;
  value: null | WordType;
}
interface BaseAssignDef {
  varName: string;
  naked: boolean;
}