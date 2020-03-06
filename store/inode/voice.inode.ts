import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { VoiceCommandSpeech } from '@model/xterm/voice.xterm';

export class VoiceINode extends BaseINode {

  public readonly readBlocked = false;
  public readonly type = INodeType.voice;

  constructor(public readonly def: VoiceINodeDef) {
    super(def);
  }

  public awakenWriters() {
    let resolve: undefined | (() => boolean);
    while ((resolve = this.writeResolvers.shift()) && !resolve());
  }

  public async getVoices(): Promise<string[]> {
    return await this.def.getVoices();
  }

  public cancelSpeech(processKey: string) {
    this.def.cancelVoiceCommands(processKey);
  }

  /** Support plain text or json command */
  private parseCommand(line: string): VoiceCommandSpeech {
    try {
      const command = JSON.parse(line) as VoiceCommandSpeech;
      if (
        typeof command === 'object'
        && command.key === 'speech'
        && typeof command.text === 'string'
      ) {
        return command;
      }
    } catch (e) {/** NOOP */}

    // Send raw line
    return { key: 'speech', text: line, processKey: null };
  }

  /** Nothing to read so behaves like /dev/null. */
  public read(_buffer: string[], _maxSize: number, _offset: number): number {
    return 0;
  }

  /**
   * Writing takes time because speaking does.
   * Currently write every line before returning. (TODO one-at-a-time ?)
   * Supports plain text (e.g. echo foo >/dev/voice).
   * Supports JSON format (e.g. say -v 'Alex' "welcome y'all" )
   */
  public async write(buffer: string[], _offset: number) {
    for (const line of buffer) {
      const command = this.parseCommand(line);
      await this.def.sendVoiceCommand(command);
    }

    const numLines = buffer.length;
    buffer.length = 0;
    return numLines;
  }
  
  /**
   * Although Web Speech API doesn't support simultaneous voices,
   * we can at least queue the speech.
   */
  public get writeBlocked() {
    return false;
  }
}
interface VoiceINodeDef extends BaseINodeDef {
  cancelVoiceCommands: (processKey: string) => void;
  getVoices: () => Promise<string[]>;
  sendVoiceCommand: (command: VoiceCommandSpeech) => Promise<void>;
}
