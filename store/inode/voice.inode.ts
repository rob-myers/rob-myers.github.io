import { BaseINode, INodeType, BaseINodeDef } from './base-inode';

interface VoiceINodeDef extends BaseINodeDef {
  defaultVoice?: string;
}

export class VoiceINode extends BaseINode {

  public command: null | VoiceINodeCommand;
  public defaultVoice!: SpeechSynthesisVoice;
  public readBlocked = false;
  public synth: SpeechSynthesis;
  public readonly type = INodeType.voice;
  public voices!: SpeechSynthesisVoice[];

  constructor(public def: VoiceINodeDef) {
    super(def);
    this.command = null;
    this.synth = window.speechSynthesis;

    // https://stackoverflow.com/a/52005323/2917822
    setTimeout(() => {
      this.voices = this.synth.getVoices();
      // console.log({ voices: this.voices });
      this.defaultVoice = this.voices
        .find(({ name }) => name === this.def.defaultVoice)
          || this.voices.find(({ default: isDefault }) => isDefault)
          || this.voices[0];
    }, 100);
  }

  public awakenWriters() {
    let resolve: undefined | (() => boolean);
    while ((resolve = this.writeResolvers.shift()) && !resolve()) {
      // NOOP
    }
  }

  /**
   * Nothing to read. Behaves like /dev/null.
   */
  public read(_buffer: string[], _maxSize: number, _offset: number): number {
    return 0;
  }
  
  /**
   * Only one voice at a time.
   * In fact, Web Speech API doesn't support simultaneous voices.
   */
  public get writeBlocked() {
    return this.command !== null;
  }

  /**
   * Writing takes a long time, due to speech.
   * Moreover we write every line before returning.
   */
  public async write(buffer: string[], _offset: number) {
    for (const line of buffer) {
      this.command = this.parseCommand(line);
      await this.speak(this.command);
    }

    const numLines = buffer.length;
    buffer.length = 0;
    this.command = null;

    return numLines;
  }

  private async speak(command: VoiceINodeCommand) {
    const { text, voice } = command;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voices.find(({ name }) => name === voice) || this.defaultVoice;

    await new Promise<any>((resolve, _) => {
      utterance.onend = () => setTimeout(() => resolve(), 100);
      utterance.onerror = (errorEvent) => {
        console.error(`Utterance '${text}' by '${voice}' failed.`);
        console.error(errorEvent);
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  private parseCommand(line: string): VoiceINodeCommand {
    try {
      const command = JSON.parse(line) as VoiceINodeCommand;
      if (typeof command === 'object' && typeof command.text === 'string') {
        return command;
      }
    } catch (e) {
      // NOOP
    }

    return { text: line };
  }

}

export interface VoiceINodeCommand {
  voice?: string;
  text: string;
}
