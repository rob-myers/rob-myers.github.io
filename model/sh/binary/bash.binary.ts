import { BaseBinaryComposite } from './base-binary';
import { BinaryExecType } from '@model/sh/binary.model';
import { Term } from '@model/os/term.model';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osSetSignalHandlerAct, osIsSessionLeaderThunk, osSetProcessGroupAct, osStoreExitCodeAct, osGetProcessThunk, osTerminateProcessThunk } from '@store/os/process.os.duck';
import { osSetZeroethParamAct, osAssignVarThunk } from '@store/os/declare.os.duck';
import { osSetSessionForegroundAct, osEndSessionThunk } from '@store/os/session.os.duck';
import { ObservedType } from '@os-service/term.service';
import { osPromptThunk } from '@store/os/tty.os.duck';
import { osParseBufferThunk, osTranspileShThunk, osDistributeSrcThunk, osGetHistoricalSrc } from '@store/os/parse.os.duck';
import { osResolvePathThunk } from '@store/os/file.os.duck';
import { HistoryINode } from '@store/inode/history.inode';
import { SigEnum } from '@model/os/process.model';

/**
 * TODO support non-interactive (see repo for 'step')
 * - only interactive if stdin a tty
 * - noniteractive if have non-empty operand (filepath)
 */

export class BashBinary extends BaseBinaryComposite<BinaryExecType.bash> {

  public get children() {
    return this.mounted ? [this.mounted] : [];
  }

  /** Determined by {this.args} and stdin. */
  public interactive = true;
  /** Both interactive and noninteractive bash mount a term. */
  public mounted: null | Term = null;

  public onEnter() {
    super.onEnter();
    this.interactive = true;
    this.mounted = null;
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    dispatch(osSetSignalHandlerAct({ processKey, handler: {
      // handle SIGINT by resetting itself
      [SigEnum.SIGINT]: { cleanup: null, do: 'reset' },
      // handle SIGTERM by ending session or self
      [SigEnum.SIGTERM]: { cleanup: () => {
        if (dispatch(osIsSessionLeaderThunk({ processKey }))) {
          const { sessionKey } = dispatch(osGetProcessThunk({ processKey }));
          dispatch(osEndSessionThunk({ sessionKey }));
        } else {
          dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 }));
        }
      }, do: 'ignore' },
    }}));

    // $0 is '-bash' iff process is session leader
    const isLeader = dispatch(osIsSessionLeaderThunk({ processKey }));
    dispatch(osSetZeroethParamAct({ processKey, $0: isLeader ? '-bash' : 'bash' }));
    dispatch(osSetProcessGroupAct({ processKey, processGroupKey: processKey }));
    dispatch(osSetSessionForegroundAct({ processKey, processGroupKey: processKey }));

    // Expects history at /dev/{userKey}/.history
    const { userKey, pid } = dispatch(osGetProcessThunk({ processKey }));
    const historyPath = `/home/${userKey}/.history`;
    const { iNode: historyINode } = dispatch(osResolvePathThunk({ processKey, path: historyPath }));

    // We set BASHPID here and also in subshells
    dispatch(osAssignVarThunk({ processKey, varName: 'BASHPID',
      exported: true, readonly: true, force: true, integer: true,
      act: { key: 'default', value: pid.toString() },
    }));

    while (true) {// Interactive command loop
      const srcBuffer = [] as string[];
      // Control chars in prompt currently unsupported (TtyXterm)
      dispatch(osPromptThunk({ processKey, fd: 1, text: '$ ' }));

      while (true) {// Interactive parse loop
        const buffer = [] as string[]; // Read exactly one line
        while ((yield this.read(1, 0, buffer)) && !buffer.length);
        
        srcBuffer.push(buffer[0]);
        const result = dispatch(osParseBufferThunk({ processKey, buffer: srcBuffer }));

        if (result.key === 'failed') {
          // Write to stderr, store exit-code, goto command loop
          yield this.warn(result.error.replace(/^Error: runtime error: src\.sh:/, ''));
          dispatch(osStoreExitCodeAct({ processKey, exitCode: 1 }));
          break;
        } else if (result.key === 'complete') {
          // Transpile, distributing source code to specific subterms
          const term = dispatch(osTranspileShThunk({ parsed: result.parsed }));
          dispatch(osDistributeSrcThunk({ term, src: srcBuffer.join('\n') }));

          // store in .history device
          const singleLineSrc = dispatch(osGetHistoricalSrc({ term }));
          (historyINode as HistoryINode).storeSrcLine(singleLineSrc);

          // Mount and run.
          this.mounted = term;
          this.adoptChildren();
          yield* this.runChild({ child: term, dispatch, processKey });

          break;
        } else {// Code in srcBuffer incomplete, so prompt for more input.
          dispatch(osPromptThunk({ processKey, fd: 1, text: '> ' }));
        }
      }
    }
  }

}
