import { BinaryExecType } from '@model/sh/binary.model';
import { Term } from '@model/os/term.model';
import { BaseBinaryComposite } from './base-binary';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osSetSignalHandlerAct, osIsSessionLeaderThunk, osSetProcessGroupAct, osStoreExitCodeAct } from '@store/os/process.os.duck';
import { osSetZeroethParamAct } from '@store/os/declare.os.duck';
import { osSetSessionForegroundAct } from '@store/os/session.os.duck';
import { ObservedType } from '@service/term.service';
import { osPromptThunk } from '@store/os/tty.os.duck';
import { osParseBufferThunk, osTranspileShThunk, osDistributeSrcThunk } from '@store/os/parse.os.duck';

/**
 * _TODO_ support non-interactive.
 */

export class BashBinary extends BaseBinaryComposite<BinaryExecType.bash> {

  public get children() {
    return this.mounted ? [this.mounted] : [];
  }
  /**
   * Determined by {this.args} and stdin.
   */
  public interactive = false;
  /**
   * Both interactive and noninteractive bash mount a term.
   */
  public mounted: null | Term = null;

  public onEnter() {
    super.onEnter();
    this.interactive = true; // TODO
    this.mounted = null;
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    /**
     * bash handles Ctrl+C by resetting itself.
     */
    dispatch(osSetSignalHandlerAct({ processKey, handler: { TERM: 'reset' }}));
    /**
     * $0 is '-bash' iff process is session leader.
     */
    const isLeader = dispatch(osIsSessionLeaderThunk({ processKey }));
    dispatch(osSetZeroethParamAct({ processKey, $0: isLeader ? '-bash' : 'bash' }));
    dispatch(osSetProcessGroupAct({ processKey, processGroupKey: processKey }));
    dispatch(osSetSessionForegroundAct({ processKey, processGroupKey: processKey }));

    while (true) {
      /**
       * Interactive command loop.
       */
      const srcBuffer = [] as string[];
      dispatch(osPromptThunk({ processKey, fd: 1, text: '\x1b[96m$ \x1b[0m' }));

      while (true) {
        /**
         * Interactive partial-parse loop.
         * We start by reading exactly one line.
         */
        const buffer = [] as string[];
        while ((yield this.read(1, 0, buffer)) && !buffer.length);
        
        srcBuffer.push(...buffer);
        const result = dispatch(osParseBufferThunk({ processKey, buffer: srcBuffer }));

        if (result.key === 'failed') {
          /**
           * Write to stderr, store exit-code and continue.
           */
          yield this.warn(result.error.replace(/^Error: runtime error: src\.sh:/, ''));
          dispatch(osStoreExitCodeAct({ processKey, exitCode: 1 }));
          break;
        } else if (result.key === 'complete') {
          /**
           * Transpile, distributing source code to specific subterms.
           */
          const term = dispatch(osTranspileShThunk({ parsed: result.parsed }));
          dispatch(osDistributeSrcThunk({ term, src: srcBuffer.join('\n') }));
          /**
           * Mount and run.
           */
          this.mounted = term;
          this.adoptChildren();
          yield* this.runChild({ child: term, dispatch, processKey });

          // yield* term.semantics(dispatch, processKey);
          break;
        } else {
          /**
           * Code in buffer is incomplete, so prompt for more input.
           */
          dispatch(osPromptThunk({ processKey, fd: 1, text: '> ' }));
        }
      }
    }
  }

}
