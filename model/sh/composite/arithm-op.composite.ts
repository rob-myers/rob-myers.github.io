/* eslint-disable @typescript-eslint/camelcase */
import { BaseTermDef } from '../base-term';
import { CompositeType, ExpandComposite } from '@model/term.model';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@service/term.service';
import { osAssignVarThunk } from '@store/os/declare.os.duck';
import { OsDispatchOverload } from '@model/os.redux.model';
import { testNever } from '@model/generic.model';

/**
 * arithmetic operation
 */
export class ArithmOpComposite extends BaseCompositeTerm<CompositeType.arithm_op> {

  public get children() {
    return this.def.cs.slice();
  }

  public value!: number;

  constructor(public def: ArithmOpCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { def, def: { cs } } = this;
    let exitCode = -1; // Final value in [0, 255].
    const base = { dispatch, processKey };

    if (cs.length === 2 && def.symbol === '?') {
      /**
       * Ternary i.e. {x ? y : z}.
       */
      const [left, other] = this.def.cs;
      yield* this.runArithmExpr({ child: left, ...base });
      const right = (other as ArithmOpComposite).def.cs[this.value ? 0 : 1] as ArithmOpComposite | ExpandComposite;
      yield* this.runArithmExpr({ child: right, ...base });

    } else if (def.cs.length === 1) {
      /**
       * Unary.
       */
      const [child] = def.cs;
      yield* this.runArithmExpr({ child, ...base });
      const x = this.value;// Set by this.runSubExpr.

      switch (def.symbol) {
        case '!': this.value = x ? 0 : 1; break;
        case '~': this.value = ~x; break;
        case '-': this.value = -x; break;
        case '+': this.value = x; break;
        case '++':
        case '--':
        {
          switch (def.symbol) {
            case '++': this.value = x + 1; break;
            case '--': this.value = x - 1; break;
            default: throw testNever(def.symbol);
          }
          dispatch(osAssignVarThunk({
            processKey,
            integer: true,
            varName: (child as ExpandComposite).value,
            act: { key: 'default', value: String(this.value) },
          }));
          /**
           * If unary operator is:
           * postfix: then exit 1 <=> error or prev value zero.
           * prefix: then exit 1 <=> error or next value zero.
           */
          exitCode = def.postfix
            ? (Number.isInteger(x) && x) ? 0 : 1
            : (Number.isInteger(this.value) && this.value) ? 0 : 1;
          break;
        }
        default: {
          yield this.exit(2, `${def.symbol}: unsupported unary arithmetic symbol`);
          return;
        }
      }
    } else {
      /**
       * Binary.
       */
      const [left, right] = def.cs;
      yield* this.runArithmExpr({ child: left, ...base });
      const x = this.value;
      yield* this.runArithmExpr({ child: right, ...base });
      const y = this.value;

      switch (def.symbol) {
        case '<': this.value = (x < y) ? 1 : 0; break;
        case '<=': this.value = (x <= y) ? 1 : 0; break;
        case '>': this.value = (x > y) ? 1 : 0; break;
        case '>=': this.value = (x >= y) ? 1 : 0; break;
        case '*': this.value = x * y; break;
        case '**': this.value = Math.pow(x, y); break;
        case '==': this.value = (x === y) ? 1 : 0; break;
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
        case '&=':
        case '|=':
        case '^=':
        case '<<=':
        case '>>=':
        {
          switch (def.symbol) {
            case '+=': this.value = x + y; break;
            case '-=': this.value = x - y; break;
            case '*=': this.value = x * y; break;
            case '/=': this.value = x / y; break;
            case '%=': this.value = x % y; break;
            case '&=': this.value = x & y; break;
            case '|=': this.value = x | y; break;
            case '^=': this.value = x ^ y; break;
            case '<<=': this.value = x << y; break;
            case '>>=': this.value = x >> y; break;
            default: throw testNever(def.symbol);
          }
          // Update variable.
          dispatch(osAssignVarThunk({
            processKey,
            integer: true,
            varName: (left as ExpandComposite).value,
            act: { key: 'default', value: String(this.value) },
          }));
          break;
        }
        case '+': this.value = x + y; break;
        case '-': this.value = x - y; break;
        // Ternary '?' handled earlier.
        // Also arises in test expressions.
        case '=': {// Assign.
          this.value = y;
          dispatch(osAssignVarThunk({
            processKey,
            integer: true,
            varName: (left as ExpandComposite).value,
            act: { key: 'default', value: String(this.value) },
          }));
          // true <=> assigned value non-zero.
          // exitCode = Number.isInteger(this.value) && this.value ? 0 : 1;
          break;
        }
        case '%': this.value = x % y; break;
        case '^': this.value = x ^ y; break;
        case ',': this.value = y; break;
        case '/': this.value = Math.floor(x / y); break;
        /**
         * TODO
         */
        default: {
          yield this.exit(2, `${def.symbol}: unrecognised binary arithmetic symbol`);
          return;
        }
      }
    }

    if (exitCode === -1) {
      exitCode = this.value ? 0 : 1;
    }
    yield this.exit(exitCode);

  }
}

interface ArithmOpCompositeDef extends BaseTermDef<CompositeType.arithm_op>, ExprOpDef<ArithmOpComposite | ExpandComposite> {}

export interface ExprOpDef<Child> {
  /** Unary or binary. */
  cs: [Child] | [Child, Child];
  /** Operation symbol e.g. '&&'. */
  symbol: string;
  /** If unary, can be postfix or prefix. */
  postfix: boolean;
}