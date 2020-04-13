import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osOpenFileThunk, osGetOfdThunk } from '@store/os/file.os.duck';
import { VoiceCommandSpeech } from '@model/xterm/voice.xterm';
import { INodeType } from '@store/inode/base-inode';
import { osSetSignalHandlerAct } from '@store/os/process.os.duck';
import { SigEnum } from '@model/os/process.model';

export class SayBinary extends BaseBinaryComposite<
  BinaryExecType.say,
  { string: 'v'[]; boolean: never[] }
> {

  public specOpts() {
    return { string: ['v'] as 'v'[], boolean: [] };
  }

  public async *semantics(
    dispatch: OsDispatchOverload,
    processKey: string,
  ): AsyncIterableIterator<ObservedType> {
    const voiceFd = 10;
    dispatch(osOpenFileThunk({ processKey, request: { fd: voiceFd, mode: 'WRONLY', path: '/dev/voice' } }));
    const { iNode } = dispatch(osGetOfdThunk({ processKey, fd: voiceFd }));
    if (iNode.type !== INodeType.voice) {
      yield this.exit(1, 'expected voice device at /dev/voice');
      return;
    }

    if (this.opts.v === '?') {// List available voices.
      yield this.write(await iNode.getVoices());
      yield this.exit();
    }

    dispatch(osSetSignalHandlerAct({ processKey, handler: {
      [SigEnum.SIGINT]: { cleanup: () => iNode.cancelSpeech(processKey), do: 'terminate' },
    }}));

    if (!this.operands.length) {// Say lines from stdin
      const buffer = [] as string[];
      // Reading one at a time allows us to cancel each line (TODO better way?)
      while (yield this.read(1, 0, buffer)) {
        yield this.write(buffer.map((line) => this.toCommand(line, processKey)), voiceFd);
        buffer.length = 0;
      }
    } else {// Say operands
      yield this.write(this.toCommand(this.operands.join(' '), processKey), voiceFd);
    }

    yield this.exit();
  }

  private toCommand(line: string, processKey: string): string {
    const command: VoiceCommandSpeech = { key: 'speech', voice: this.opts.v, text: line, processKey };
    return JSON.stringify(command);
  }

}
