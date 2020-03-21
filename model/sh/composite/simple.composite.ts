import { BaseTermDef } from '../base-term';
import { CompositeType, Term, ExpandComposite, SpecialBuiltin, OtherBuiltin } from '../../os/term.model';
import { AssignComposite, AssignDefVar } from './assign.composite';
import { RedirectComposite } from './redirect.composite';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { ExpandType } from '../expand.model';
import { normalizeWhitespace, launchedInteractively, TermError } from '@os-service/term.util';
import { osExpandFilepathThunk, osResolvePathThunk } from '@store/os/file.os.duck';
import { osPushRedirectScopeAct, osPopRedirectScopeAct, osGetFunctionThunk, osPushVarScopeAct, osPopVarScopeAct } from '@store/os/declare.os.duck';
import { osCloneTerm, osCreateBuiltinThunk, osCreateBinaryThunk, osGetHistoricalSrc } from '@store/os/parse.os.duck';
import { isBuiltinSpecialCommand, isBuiltinOtherCommand, BuiltinSpecialType, BuiltinOtherType, isDeclareBuiltinType, BuiltinType } from '@model/sh/builtin.model';
import { BinaryType } from '@model/sh/binary.model';
import { INodeType } from '@store/inode/base-inode';
import { SpawnChildDef, osSpawnChildThunk, osGetProcessThunk } from '@store/os/process.os.duck';

/**
 * simple command
 */
export class SimpleComposite extends BaseCompositeTerm<CompositeType.simple> {
  /**
   * The expanded args defining the command to run.
   */
  public args!: string[];

  public get children(): Term[] {
    const { def, method } = this;
    return ([] as Term[]).concat(
      def.words,
      def.assigns,
      def.redirects,
      method && (
        (method.key === 'invoke-function' && method.mounted)
        || (method.key === 'run-builtin' && method.builtin)
      ) || []);
  }

  public method: null | (
    | { key: 'invoke-function'; mounted: Term; funcName: string }
    /** A simple command can run a builtin in the current process. */
    | { key: 'run-builtin'; builtin: SpecialBuiltin | OtherBuiltin }
    /** A simple command can launch a 'binary' in a new process. */
    | { key: 'launch-binary'; launchedKey: string; filepath: string }
    /** A simple command can launch a shell script in a new process. */
    | { key: 'launch-script'; launchedKey: string; filepath: string }
  ) = null;

  constructor(public def: SimpleCompositeDef) {
    super(def);
  }

  public onEnter() {
    super.onEnter();
    this.args = [];
    this.method = null;
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    // Perform shell expansion.
    yield* this.computeArgs(dispatch, processKey);
    
    if (!this.args[0]) {
      yield* this.assignsOnly(dispatch, processKey);
    }

    yield* this.tryInvokeFunction(dispatch, processKey);
    yield* this.tryRunBuiltin(dispatch, processKey);
    yield* this.tryLaunch(dispatch, processKey);
  }

  private async *computeArgs(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const word of this.def.words) {
      /**
       * Apply Brace, Arithmetic, Parameter and Command Expansion.
       */
      yield* this.runChild({ child: word, dispatch, processKey });

      if (word.exitCode) {// Exit term if an expansion failed.
        yield this.exit(word.exitCode);
      } else if (word.def.expandKey === ExpandType.singleQuote) {
        // No filename expansion for '' and $''.
        this.args.push(word.value);
        continue;
      }
      /**
       * Normalize command and parameter expansion,
       * e.g. ' foo \nbar ' -> ['foo', 'bar']
       */
      const fileArgs = word.def.expandKey === ExpandType.parameter || word.expandKey === ExpandType.command
        ? normalizeWhitespace(word.value)
        : word.values;
      /**
       * Filename expansion.
       */
      for (const pattern of fileArgs) {
        if (/\*|\?|\[/.test(pattern)) {
          // Could be a glob.
          console.log('Applying filename expansion to:', JSON.stringify(pattern));// DEBUG
          const result = dispatch(osExpandFilepathThunk({ processKey, pattern }));
          console.log({ result });// DEBUG
          this.args.push(...(result || [pattern]));
        } else {
          this.args.push(pattern);
        }
      }
    }
  }

  /**
   * No command, so apply assignments in current process.
   */
  private async *assignsOnly(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    let assignExitCode = 0;

    for (const assign of this.def.assigns) {
      yield* this.runChild({ child: assign, dispatch, processKey });
      // Don't fail on bad assign, but remember.
      this.exitCode && (assignExitCode = this.exitCode);
    }

    // Apply redirections in new temporary redirection scope.
    if (this.def.redirects.length) {
      dispatch(osPushRedirectScopeAct({ processKey }));
      for (const redirect of this.def.redirects) {
        yield* this.runChild({ child: redirect, dispatch, processKey });

        if (this.exitCode) {// ?
          dispatch(osPopRedirectScopeAct({ processKey }));
          yield this.exit(this.exitCode || 0);
        }
      }
      dispatch(osPopRedirectScopeAct({ processKey }));
    }

    yield this.exit(assignExitCode);
  }

  private async *tryInvokeFunction(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const foundFunc = dispatch(osGetFunctionThunk({ processKey, functionName: this.args[0] }));

    if (foundFunc) {
      // Clone and mount function code.
      const mounted = dispatch(osCloneTerm({ term: foundFunc.term }));
      this.method = { key: 'invoke-function', mounted, funcName: foundFunc.key };
      this.adoptChildren();
  
      /**
       * Invoke function with redirects in new redirection scope.
       * - Additional args after function name become +ve positionals.
       * - Precomputed assignments propagated for local export. (?)
       * - Local var scope ensured, afterwards popped til 1st positionals. (?)
       */
      yield* this.runChild({ child: mounted, dispatch, processKey }, {
        freshRedirs: this.def.redirects,
        posPositionals: this.args.slice(1),
        exportAssigns: this.def.assigns,
        codeStackItem: { key: 'function', funcName: foundFunc.key, src: foundFunc.src },
      });

      yield this.exit(this.exitCode || 0);
    }
  }

  /**
   * _TODO_ support running builtins in background?
   */
  private async *tryRunBuiltin(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const [command] = this.args;

    if (isBuiltinSpecialCommand(command) || isBuiltinOtherCommand(command)) {
      // this.log('Running builtin', { builtinKey, args });
      const args = this.args.slice(1);
      
      // Normalize commands to {BuiltinType}.
      let builtinKey: BuiltinType;
      if (command === ':') {
        builtinKey = BuiltinSpecialType.colon;
      } else if (command === '.') {
        builtinKey = BuiltinSpecialType.period;
      } else if (command === '[') {
        builtinKey = BuiltinOtherType.squareBracket;
      } else {
        builtinKey = command;
      }
  
      // Safety and clarity.
      if (isDeclareBuiltinType(builtinKey)) {
        console.error('Declare-based builtins not implemented in {SimpleComposite}');
        yield this.exit(2);
        return; // Unreachable, but for typescript.
      } else if (builtinKey === BuiltinOtherType.let) {
        console.error('Builtin \'let\' not implemented in {SimpleComposite}');
        yield this.exit(2);
      }
  
      try {
        // Mount term.
        const builtin = dispatch(osCreateBuiltinThunk({ builtinKey, args }));
        this.method = { key: 'run-builtin', builtin };
        this.adoptChildren();
    
        // Only '.' and 'source' need {this.def.assigns}.
        if (builtin.builtinKey === BuiltinSpecialType.period || builtin.builtinKey === BuiltinOtherType.source) {
          builtin.assigns = this.def.assigns;
        }
    
        // Only 'exec' doesn't evaluate redirects now.
        if (builtin.builtinKey === BuiltinSpecialType.exec) {
          builtin.redirects = this.def.redirects;
          yield* this.runChild({ child: builtin, dispatch, processKey });
        } else {
          yield* this.runChild({ child: builtin, dispatch, processKey}, { freshRedirs: this.def.redirects });
        }
        yield this.exit(builtin.exitCode || 0);
      } catch (e) {
        yield this.exit(1, `builtin \`${builtinKey}' not implemented yet`);
      }
    } 
  }

  /**
   * Try to launch binary or script in new process.
   */
  private async *tryLaunch(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    try {
      // Try to resolve path locally or via PATH
      const { iNode } = dispatch(osResolvePathThunk({ processKey, path: this.args[0], PATH: true }));

      if (iNode.type === INodeType.regular) {
        if (iNode.binary) {
          yield* this.launch(iNode.def.binaryType as BinaryType, dispatch, processKey);
        } else if (/^~|(\.?\/)/.test(this.args[0])) {
          /**
           * Only try to run script if path has prefix '~', './' or '/'.
           * Run script by launching builtin `source` in new process.
           */
          yield* this.launch(BuiltinOtherType.source, dispatch, processKey);
        } else {
          /**
           * Regular file like 'foo' won't be executed even if script.
           * Would've worked if it was a function.
           */
          yield this.exit(1, `${this.args[0]}: command not found`);
        }
      }
    } catch (e) {
      if (e instanceof TermError) {
        console.log({ termError: e });
        if (e.internalCode === 'P_EXIST') {
          /**
           * We forbid spawning multiple processes from same subterm,
           * e.g. `while true; do sleep 1 & done` fails after 1st iteration.
           * This is for system stability and can be bypassed via `eval`,
           * e.g. `while true; do eval "{ sleep 1; } &"; done`.
           */
          yield this.exit(1, 'at most one process permitted per subterm');
        } else if (e.internalCode === 'F_NO_EXIST') {
          // Rewrite errors due to failure to resolve iNode
          yield this.exit(1, `${this.args[0]}: command not found`);
        }
      }
      throw e;
    }
  }

  private async *launch(binaryKey: BinaryType | BuiltinOtherType.source, dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    // Key of process we'll launch.
    const launchedKey = `${binaryKey}.${this.termId}.${processKey}`;
    
    if (binaryKey === BuiltinOtherType.source) {
      this.method = { key: 'launch-script', launchedKey, filepath: this.args[0] };
      this.args.unshift(BuiltinOtherType.source);
    } else {
      this.method = { key: 'launch-binary', launchedKey, filepath: this.args[0] };
    }

    if (this.def.redirects.length) {
      /**
       * Apply redirections in current process.
       * They'll be inherited by the spawned process.
       */
      dispatch(osPushRedirectScopeAct({ processKey }));
      for (const redirect of this.def.redirects) {
        yield* this.runChild({ child: redirect, dispatch, processKey });
        if (redirect.exitCode) {// Exit if redirect fails.
          dispatch(osPopRedirectScopeAct({ processKey }));
          yield this.exit(redirect.exitCode);
        }
      }
    }

    if (this.def.assigns.length) {
      /**
       * Apply assignments here as locals.
       */
      dispatch(osPushVarScopeAct({ processKey }));
      for (const assign of this.def.assigns) {
        assign.declOpts = { local: true };
        yield* this.runChild({ child: assign, dispatch, processKey });
      }
      dispatch(osPopVarScopeAct({ processKey }));
    }
    /**
     * Use assignment values to deduce exported variables.
     * Ignore x[i]=. Moreover, array assignment can't happen.
     */
    const exportVars: SpawnChildDef['exportVars'] = this.def.assigns
      .filter(({ def }) => def.subKey === 'var')
      .map(({ def }) => {
        const { value } = def as AssignDefVar<ExpandComposite>;
        return {
          varName: def.varName,
          varValue: value ? value.value : '',
        };
      });

    const term = binaryKey === BuiltinOtherType.source
      ? dispatch(osCreateBuiltinThunk({ builtinKey: binaryKey, args: this.args.slice(1) }))
      : dispatch(osCreateBinaryThunk({ binaryKey, args: this.args.slice(1) }));

    // Manufacture source and source map.
    term.def.src = this.args.join(' ');
    const srcLength = term.def.src.length;
    term.def.sourceMap = {
      from: { col: 1, offset: 0, row: 1 },
      to: { col: srcLength + 1, offset: srcLength, row: 1 },
      extra: [],
    };

    /**
     * Spawn child process.
     */
    const { toPromise } = dispatch(osSpawnChildThunk({
      processKey,
      childProcessKey: launchedKey,
      background: this.def.background,
      term,
      /**
       * Cannot use {this.def.redirects} here.
       * They may refer to non-exported variables in the current process.
       */
      redirects: [],
      /**
       * If launched interactively:
       * - create new process group, regardless of whether runs in background.
       * - if not background, it'll be set as foreground process group.
       */
      specPgKey: launchedInteractively(this) ? launchedKey : undefined,
      /**
       * Arguments after command become +ve positional params in spawned process.
       */
      posPositionals: this.args.slice(1),
      /**
       * Evaluated assignments will be exported in new process.
       */
      exportVars,
      /**
       * Store launched command for `ps`, recalling that this.arg[0] is filepath.
       */
      command: this.args
        .concat(this.def.redirects.map(r => dispatch(osGetHistoricalSrc({ term: r }))))
        .join(' '),
    }));

    // Mustn't pop scope if it was changed by an exec
    const redirs = dispatch(osGetProcessThunk({ processKey })).nestedRedirs[0];
    if (toPromise) {// Wait for child process to terminate
      await toPromise(); // We resume after even if exec'd this process
    }
    const { nestedRedirs } = dispatch(osGetProcessThunk({ processKey }));

    if (this.def.redirects.length && (redirs === nestedRedirs[0])) {
      // Forget redirections intended for child process only
      dispatch(osPopRedirectScopeAct({ processKey }));
    }

    yield this.exit(this.def.background ? 0 : dispatch(osGetProcessThunk({ processKey })).lastExitCode || 0);
  }

}

interface SimpleCompositeDef extends BaseTermDef<CompositeType.simple>, SimpleCommandDef<AssignComposite, ExpandComposite, RedirectComposite> {}

interface SimpleCommandDef<AssignType, WordType, RedirType> {
  assigns: AssignType[];
  redirects: RedirType[];
  words: WordType[];
  /** Run in background? */
  background: boolean;
  /** Binary-negate return code? */
  negated: boolean;
}
