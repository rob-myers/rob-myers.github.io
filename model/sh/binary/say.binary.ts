import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { osOpenFileThunk } from '@store/os/file.os.duck';
import { VoiceINodeCommand } from '@store/inode/voice.inode';

export class SayBinary extends BaseBinaryComposite<
  BinaryExecType.say,
  { string: 'v'[]; boolean: never[] }
> {

  public specOpts() {
    return { string: ['v'] as 'v'[], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    if (this.opts.v === '?') {
      /**
       * List available voices.
       */
      const voices = window.speechSynthesis.getVoices().map(({ name, lang }) => `${name} (${lang})`);
      yield this.write(voices);
      yield this.exit();
    }

    /**
     * Speak via device /dev/voice, based on {window.speechSynthesis}.
     */
    dispatch(osOpenFileThunk({ processKey, request: { fd: 1, mode: 'WRONLY', path: '/dev/voice' } }));

    if (!this.operands.length) {// 
      /**
       * Say lines from stdin.
       */
      const buffer = [] as string[];
      while (yield this.read(10, 0, buffer)) {
        yield this.write(buffer.map((line) => this.toCommand(line)));
        buffer.length = 0;
      }
    } else { 
      /**
       * Say operands.
       */
      yield this.write(this.toCommand(this.operands.join(' ')));
    }

  }

  private toCommand(line: string): string {
    const command: VoiceINodeCommand =  { voice: this.opts.v, text: line };
    return JSON.stringify(command);
  }

}
