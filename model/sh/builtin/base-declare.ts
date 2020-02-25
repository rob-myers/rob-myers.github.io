import { DeclareBuiltinType, CompositeType, ExpandComposite, Term } from '@model/term.model';
import { BaseCompositeTerm } from '../composite/base-composite';
import { DeclareOpt, isDeclareOpt, ProcVarPredicate, getVarPredicates, printVar } from '@service/process-var.service';
import { BaseTermDef } from '../base-term';
import { AssignComposite } from '../composite/assign.composite';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { keys } from '@model/generic.model';
import { ProcessVar, NamedFunction } from '@model/process.model';

/**
 * base declare
 * We do not extend BuiltinComposite because our notion of 'args' is richer.
 */
export abstract class BaseDeclareComposite<ExactKey extends DeclareBuiltinType> extends BaseCompositeTerm<CompositeType.declare> {

  /** Instead of declareKey, to unify with other builtins. */
  public builtinKey: ExactKey;

  public varNames!: string[];
  public isOptSet!: Partial<Record<DeclareOpt, boolean>>;
  public specifiedPreds!: DeclareOpt[];

  public get children() {
    return ([] as Term[]).concat(
      this.def.assigns,
      this.def.options,
    );
  }

  constructor(public def: BaseDeclareBuiltinDef<ExactKey>) {
    super(def);
    this.builtinKey = def.builtinKey;
  }


  /**
   * Compute all options. These might include {others},
   * whose expanded value may be a parameter name or an option.
   */
  protected async *computeOpts(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    for (const word of this.def.options) {
      yield* this.runChild({ child: word, dispatch, processKey });
    }
    for (const word of this.def.others) {
      yield* this.runChild({ child: word, dispatch, processKey });
    }

    this.varNames = this.def.assigns.map(({ def: { varName } }) => varName)
      .concat(this.def.others.filter(({ value }) => !/^[-+]/.test(value))
        .map(({ value }) => value));

    /** Pre-options e.g. `['-a', '-ab', '+c']` but may be unsupported. */
    const preOpts = ([] as string[]).concat(
      this.def.options.map(({ value }) => value),
      this.def.others.filter(({ value }) => /^[-+]/.test(value)).map(({ value }) => value),
    );
    /**
     * Compute valid declare options, where -/+ are true/false resp.
     * Format e.g. [['a', true], ['a', true], ['b', true], ['c', false]`.
     * We don't support -n (nameref), -t (trace).
     */
    const optBoolPairs = preOpts.reduce<[DeclareOpt, boolean][]>(
      (agg, item) => agg.concat(Array.from(item.slice(1))
        .filter(isDeclareOpt)// Ignore unknown options.
        .map((pred) => [pred, item[0] === '-'] as [DeclareOpt, boolean])
      ), [],
    );
    /**
     * Compute whether option will be set or not.
     * e.g. declare -x +x foo will remove readonly property if exists.
     */
    this.isOptSet = {} as Partial<Record<DeclareOpt, boolean>>;
    optBoolPairs.forEach(([opt, isSet]) => this.isOptSet[opt] = isSet);

    // List of specified options (e.g. 'a' represents '-a').
    this.specifiedPreds = keys(this.isOptSet)
      .filter((key) => this.isOptSet[key] && (key in ProcVarPredicate));
  }

  /**
   * Cannot specify negative properties e.g. declare -p +x
   * does not print non-exported variables.
   */
  protected restrictVars(
    vars: ProcessVar[],
    { matchAll = false, matches = [], varNames = [] }: {
      matches?: DeclareOpt[];
      matchAll?: boolean;
      varNames?: string[];
    },
  ) {
    // Ignore positional parameters and unset ones.
    return vars
      .filter((v) => v.key !== 'positional' && v.key !== 'unset')
      .filter((v) => matchAll
        ? matches.every((opt) => getVarPredicates(v)
          .includes(opt as ProcVarPredicate))
        : (!matches.length || matches.some((opt) =>
          getVarPredicates(v).includes(opt as ProcVarPredicate))))
      .filter(({ varName }) => !varNames.length || varNames.includes(varName))
      .sort((v1, v2) => v1.varName < v2.varName ? -1 : 1);
  }

  /**
   * Cannot specify negative properties e.g.
   * {declare -f +x} does not print non-exported functions.
   */
  protected printFuncs(
    namedFuncs: NamedFunction[],
    /** Requirements. */
    { exported: reqExported = false, kind, varNames = [] }: {
      exported?: boolean;
      kind: 'header' | 'full';
      varNames?: string[];
    },
  ): string[] {
    // Restrict to exported functions if required.
    const filtered = namedFuncs
      .filter(({ exported }) => !reqExported || exported)
      .filter(({ key }) => !varNames.length || varNames.includes(key));

    if (kind === 'header') {
      return filtered.map(({ key: funcName, exported, readonly }) =>
        `declare -f${exported ? 'x' : ''}${readonly ? 'r' : ''} ${funcName}`);
    }
    /**
     * Function bodies and definitions.
     */
    return filtered.reduce<string[]>((buffer, func) => [
      ...buffer,
      // Function header.
      `${func.key} ()`,
      // Source code may not be tracked during internal testing.
      ...(func.src ? func.src.split('\n') : ['{', '# source code not found', '}'])
    ], []);
  }

  protected printVars = (vars: ProcessVar[]) =>
    vars.map((v) =>
      `declare -${
        getVarPredicates(v).join('') || '-'
      } ${
        v.value === null ? v.varName : `${v.varName}="${printVar(v)}"`
      }`
    );
}

interface BaseDeclareBuiltinDef<
  ExactKey extends DeclareBuiltinType
> extends BaseTermDef<CompositeType.declare>, DeclareDef<ExactKey, AssignComposite, ExpandComposite> {}

/**
 * {options} and {others} induce args.
 */
interface DeclareDef<ExactKey, AssignType, WordType> {
  builtinKey: ExactKey;
  /**
   * TODO Type as DeclareBuiltinType.
   */
  variant: 'declare' | 'local' | 'export' | 'readonly' | 'typeset' | 'nameref';
  assigns: AssignType[];
  options: WordType[];
  /** PATCH. */
  others: WordType[];
}