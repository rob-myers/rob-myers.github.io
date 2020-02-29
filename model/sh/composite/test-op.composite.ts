/* eslint-disable @typescript-eslint/camelcase */
import globRex from 'globrex';
import { BaseTermDef } from '../base-term';
import { CompositeType, ExpandComposite } from '../../os/term.model';
import { ExprOpDef } from './arithm-op.composite';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@os-service/term.service';
import { isUnaryTest, UnaryTestType, isExtraBinaryTest, BinaryTestExtraType, isBasicBinaryTest, BinaryTestType } from '../test.model';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osResolvePathThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';
import { testNever } from '@model/generic.model';
import { osIsATtyThunk } from '@store/os/tty.os.duck';
/**
 * test operation
 */
export class TestOpComposite extends BaseCompositeTerm<CompositeType.test_op> {
  public value!: boolean;

  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: TestOpCompositeDef) {
    super(def);
  }

  /**
   * See http://mywiki.wooledge.org/BashGuide/TestsAndConditionals.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    let exitCode = -1; // Unspecified.

    if (this.def.cs.length === 1) {
      /**
       * Unary operations.
       */
      if (!isUnaryTest(this.def.symbol)) {
        yield this.exit(1, `${this.def.symbol}: unary operator expected`);
        return;
      }

      const [child] = this.def.cs;
      yield* this.runChild({ child, dispatch, processKey });

      switch (this.def.symbol) {
        // File related.
        case UnaryTestType['-e']:
        case UnaryTestType['-f']:
        case UnaryTestType['-d']:
        case UnaryTestType['-h']:
        case UnaryTestType['-p']:
        case UnaryTestType['-r']:
        case UnaryTestType['-w']:
        case UnaryTestType['-x']:
        case UnaryTestType['-O']:
        case UnaryTestType['-G']: {
          try {
            const { iNode } = dispatch(osResolvePathThunk({ processKey, path: child.value as string }));
            this.value = true;

            switch (this.def.symbol) {
              case UnaryTestType['-e']: {// Does file exist?
                this.value = true;
                break;
              }
              case UnaryTestType['-f']: {// Does regular file exist?
                this.value = iNode.type === INodeType.regular;
                break;
              }
              case UnaryTestType['-d']: {// Does directory exist?
                this.value = iNode.type === INodeType.directory;
                break;
              }
              case UnaryTestType['-h']: {// TODO Does symbolic link exist?
                // this.value = resolvePath.result.iNode.type === INodeType.sym;
                this.value = false;
                break;
              }
              case UnaryTestType['-p']: {// Does fifo exist?
                this.value = iNode.type === INodeType.fifo;
                break;
              }
              case UnaryTestType['-r']: {// Is file readable by you?
                this.value = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-w']: {// Is file writable by you?
                this.value = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-x']: {// Is file executable by you?
                this.value = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-O']: {// Is file effectively owned by you?
                this.value = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-G']: {// Is file effectively owned by your group?
                this.value = true;// TODO permissions.
                break;
              }
              default: throw testNever(this.def.symbol);
            }
          } catch (e) {
            this.value = false;// File does not exist.
            break; 
          }

          break;
        }
        case UnaryTestType['-t']: {// Does file descriptor point to a tty?
          const fd = parseInt(child.value as string);

          if (!Number.isInteger(fd))  {
            this.value = false;
          } else {
            this.value = dispatch(osIsATtyThunk({ processKey, fd }));
          }
          break;
        }
        case UnaryTestType['-z']: {// Does string have length 0?
          this.value = (child as ExpandComposite).value.length === 0;
          break;
        }
        case UnaryTestType['-n']: {// Does string have non-zero length?
          this.value = (child as ExpandComposite).value.length > 0;
          break;
        }
        case UnaryTestType['!']: {// Invert child.
          this.value = !(child as TestOpComposite).value;
          break;
        }
        default: throw testNever(this.def.symbol);
      }
    } else if (isExtraBinaryTest(this.def.symbol)) {
      /**
       * - Lazy binary operations '&&' and '=='
       * - Other extras i.e. '==' and '=~'.
       */
      const [left, right] = this.def.cs;

      switch (this.def.symbol) {
        case BinaryTestExtraType['&&']: {// Is `left` and `right` true (lazily)?
          yield* this.runChild({ child: left, dispatch, processKey });
          if (!(left as TestOpComposite).value) {
            this.value = false;
            break;
          }
          yield* this.runChild({ child: right, dispatch, processKey });
          this.value = (right as TestOpComposite).value;
          break;
        }
        case BinaryTestExtraType['||']: {// Is `left` or `right` true (lazily)?
          yield* this.runChild({ child: left, dispatch, processKey });
          if ((left as TestOpComposite).value) {
            this.value = true;
            break;
          }
          yield* this.runChild({ child: right, dispatch, processKey });
          this.value = (right as TestOpComposite).value;
          break;
        }
        case BinaryTestExtraType['==']: {// Does `left` match the glob `right`?
          const pattern = (right as ExpandComposite).value;
          const { regex } = globRex(pattern, { extended: true });
          this.value = regex.test((left as ExpandComposite).value);
          break;
        }
        case BinaryTestExtraType['=~']: {// Does `left` match the regex `right`?
          // NOTE Use js regex syntax.
          const regex = new RegExp((right as ExpandComposite).value);
          this.value = regex.test((left as ExpandComposite).value);
          break;
        }
        default: throw testNever(this.def.symbol);
      }
    } else if (isBasicBinaryTest(this.def.symbol)) {
      /**
       * Standard binary operations.
       */
      const [left, right] = this.def.cs;

      yield* this.runChild({ child: left, dispatch, processKey });
      yield* this.runChild({ child: right, dispatch, processKey });

      switch (this.def.symbol) {
        case BinaryTestType['-nt']: // Is file `left` newer than file `right`?
        case BinaryTestType['-ot']: // Is file `left` older than file `right`?
        case BinaryTestType['-ef']: {// Is file `left` the same as `right`, modulo links?
          try {
            const { iNode: first } = dispatch(osResolvePathThunk({ processKey, path: (left as ExpandComposite).value }));
            const { iNode: second } = dispatch(osResolvePathThunk({ processKey, path: (right as ExpandComposite).value }));

            switch (this.def.symbol) {
              case BinaryTestType['-nt']: {
                this.value = second.btime <= first.btime;
                break;
              }
              case BinaryTestType['-ot']: {
                this.value = first.btime <= second.btime;
                break;
              }
              case BinaryTestType['-ef']: {
                this.value = first === second;
                break;
              }
              default: throw testNever(this.def.symbol);
            }
          } catch (e) {
            this.value = false;
            break;// At least one file n'exist pas.
          }


          break;
        }
        case BinaryTestType['=']:// Does `left` match the glob `right`?
        case BinaryTestType['!=']: {// Does `left` fail to match the glob `right`?
          const pattern = (right as ExpandComposite).value;
          const { regex } = globRex(pattern, { extended: true });
          const doesMatch = regex.test((left as ExpandComposite).value);

          this.value = this.def.symbol === '!=' ? !doesMatch : doesMatch;
          break;
        }
        case BinaryTestType['<']: {// Is `left` lexicographically less than `right`?
          this.value = (left as ExpandComposite).value < (right as ExpandComposite).value;
          break;
        }
        case BinaryTestType['>']: {// Is `left` lexicographically more than `right`?
          this.value = (left as ExpandComposite).value > (right as ExpandComposite).value;
          break;
        }
        case BinaryTestType['-eq']: {// Does `left` represent same integer as `right`?
          // e.g. Number('0x0f') = 15, Number(-0) = 0
          this.value = Number(left.value) === Number(right.value);
          break;
        }
        case BinaryTestType['-ne']: {// Does `left` not represent same integer as `right`?
          this.value = Number(left.value) !== Number(right.value);
          break;
        }
        case BinaryTestType['-lt']: {// Does `left` represent integer less than `right`?
          this.value = Number(left.value) < Number(right.value);
          break;
        }
        case BinaryTestType['-gt']: {// Does `left` represent integer greater than `right`?
          this.value = Number(left.value) > Number(right.value);
          break;
        }
        case BinaryTestType['-le']: {// Does `left` represent integer less than or equal to `right`?
          this.value = Number(left.value) <= Number(right.value);
          break;
        }
        case BinaryTestType['-ge']: {// Does `left` represent integer greater than or equal to `right`?
          this.value = Number(left.value) >= Number(right.value);
          break;
        }
        default: throw testNever(this.def.symbol);
      }
    } else {
      yield this.exit(1, `${this.def.symbol}: unexpected arithmetic operator`);
    }

    if (exitCode === -1) {
      exitCode = this.value ? 0 : 1;
    }
    this.exitCode = exitCode;
  }
}

interface TestOpCompositeDef extends BaseTermDef<CompositeType.test_op>, ExprOpDef<TestOpComposite | ExpandComposite> {}
