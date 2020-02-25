import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@service/term.service';
import { last, testNever } from '@model/generic.model';
import { isUnaryTest, UnaryTestType, isBasicBinaryTest, BinaryTestType } from '../test.model';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osResolvePathThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';
import { osIsATtyThunk } from '@store/os/tty.os.duck';

/**
 * Supports atomic test, possibly negated once.
 * Do NOT support:
 * - binary operator -a
 * - binary operator -o
 * - brackets ( - ).
 */
export class TestBuiltin extends BaseBuiltinComposite<
  BuiltinOtherType.test | BuiltinOtherType.squareBracket
> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    let result: boolean | null = null;

    const negated = this.def.args[0] === '!';
    const args = negated ? this.def.args.slice(1) : this.def.args.slice();

    /**
     * Handle syntax: [ {test} ]
     */
    if (this.builtinKey === BuiltinOtherType.squareBracket) {
      if (last(args) !== ']') {
        yield this.exit(1, 'missing `]\'');
      } else {
        args.pop();
      }
    }

    if (args.length === 0) {
      /**
       * No args => false.
       */
      result = false;
    } else if (args.length === 1) {
      /**
       * Single arg => true iff arg non-empty.
       */
      result = args[0].length > 0;
    } else if (args.length === 2) {
      const [opt, unaryArg] = args;

      if (!isUnaryTest(opt)) {
        yield this.exit(1, `${opt}: unary operator expected`);
        return;
      }

      switch (opt) {
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
            const { iNode } =dispatch(osResolvePathThunk({ processKey, path: unaryArg }));

            switch (opt) {
              case UnaryTestType['-e']: {// Does file exist?
                result = true;
                break;
              }
              case UnaryTestType['-f']: {// Does regular file exist?
                result = iNode.type === INodeType.regular;
                break;
              }
              case UnaryTestType['-d']: {// Does directory exist?
                result = iNode.type === INodeType.directory;
                break;
              }
              case UnaryTestType['-h']: {// Does symbolic link exist?
                result = false; // TODO implement links?
                break;
              }
              case UnaryTestType['-p']: {// Does fifo exist?
                result = iNode.type === INodeType.fifo;
                break;
              }
              case UnaryTestType['-r']: {// Is file readable by you?
                result = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-w']: {// Is file writable by you?
                result = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-x']: {// Is file executable by you?
                result = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-O']: {// Is file effectively owned by you?
                result = true;// TODO permissions.
                break;
              }
              case UnaryTestType['-G']: {// Is file effectively owned by your group?
                result = true;// TODO permissions.
                break;
              }
              default: throw testNever(opt);
            }
          } catch (e) {
            // File does not exist.
            result = false;
          }
          break;
        }
        case UnaryTestType['-t']: {
          // Does file descriptor point to a tty?
          const fd = parseInt(unaryArg);

          if (!Number.isInteger(fd))  {
            result = false;
          } else {
            result = dispatch(osIsATtyThunk({ processKey, fd }));
          }
          break;
        }
        case UnaryTestType['-z']: {// Does string have length 0?
          result = unaryArg.length === 0;
          break;
        }
        case UnaryTestType['-n']: {// Does string have non-zero length?
          result = unaryArg.length > 0;
          break;
        }
        case UnaryTestType['!']: {
          // Original input e.g. `! ! foo`.
          yield this.exit(1, 'too many arguments');
          break;
        }
        default: throw testNever(opt);
      }
    } else if (args.length === 3) {
      const [left, opt, right] = args;

      if (!isBasicBinaryTest(opt)) {
        yield this.exit(1, `${opt}: binary operator expected`);
        return;
      }

      switch (opt) {
        case BinaryTestType['-nt']:
        case BinaryTestType['-ot']:
        case BinaryTestType['-ef']: {

          try {
            const { iNode: first } = dispatch(osResolvePathThunk({ processKey, path: left }));
            const { iNode: second } = dispatch(osResolvePathThunk({ processKey, path: right }));

            switch (opt) {
              case BinaryTestType['-nt']: {
                result = second.btime <= first.btime;
                break;
              }
              case BinaryTestType['-ot']: {
                result = first.btime <= second.btime;
                break;
              }
              case BinaryTestType['-ef']: {// TODO
                // result = first.resolveLinks() === second.resolveLinks();
                result = false;
                break;
              }
              default: throw testNever(opt);
            }
          } catch (e) {
            result = false;
            break;// At least one file n'exist pas.
          }

          break;
        }
        case BinaryTestType['=']:
        case BinaryTestType['!=']: {
          result = opt === '=' ? left === right : left !== right;
          break;
        }
        case BinaryTestType['<']:
        case BinaryTestType['>']: {
          result = opt === '<' ? left < right : left > right;
          break;
        }
        case BinaryTestType['-eq']: {// Does `left` represent same integer as `right`?
          // e.g. Number('0x0f') = 15, Number(-0) = 0
          result = Number(left) === Number(right);
          break;
        }
        case BinaryTestType['-ne']: {// Does `left` not represent same integer as `right`?
          result = Number(left) !== Number(right);
          break;
        }
        case BinaryTestType['-lt']: {// Does `left` represent integer less than `right`?
          result = Number(left) < Number(right);
          break;
        }
        case BinaryTestType['-gt']: {// Does `left` represent integer greater than `right`?
          result = Number(left) > Number(right);
          break;
        }
        case BinaryTestType['-le']: {// Does `left` represent integer less than or equal to `right`?
          result = Number(left) <= Number(right);
          break;
        }
        case BinaryTestType['-ge']: {// Does `left` represent integer greater than or equal to `right`?
          result = Number(left) >= Number(right);
          break;
        }
        default: throw testNever(opt);
      }
    } else {
      yield this.exit(2, 'too many arguments');
      return;
    }

    if (negated) {
      result = !result;
    }
    yield this.exit(result ? 0 : 1);
  }

}
