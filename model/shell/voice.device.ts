/**
 * There is only one instance of this class because
 * there is only one voice device i.e. /dev/voice. Also,
 * the Web Speech API doesn't permit simultaneous voices.
 */
class VoiceDevice {

  private commandBuffer: VoiceCommand[];
  private currentCommand: null | VoiceCommand;
  private defaultVoice!: SpeechSynthesisVoice;
  private synth!: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[];

  constructor() {
    this.commandBuffer = [];
    this.currentCommand = null;
    this.voices = [];
  }
  
  initialise() {
    this.synth = window.speechSynthesis;
    setTimeout(() => {
      this.voices = this.synth.getVoices();
      // console.log({ voices: this.voices });
      this.defaultVoice = this.voices
        .find(({ default: isDefault }) => isDefault) || this.voices[0];
    }, 500);
  }

  addVoiceCommand(text: string, resolve: () => void, voice?: string) {
    const cmd = { text, voice, resolve };
    this.queueCommands(cmd);
    return () => this.cancelVoiceCommand(cmd);
  }

  private cancelVoiceCommand(cmd: VoiceCommand) {
    this.commandBuffer = this.commandBuffer
      .filter((other) => other !== cmd);
    if (this.currentCommand === cmd) {
      this.stopSpeaking();
    }
  }

  getAllVoices() {
    return this.voices.map(({ name }) => name);
  }

  private queueCommands(...cmds: VoiceCommand[]) {
    this.commandBuffer.push(...cmds);
    if (!this.synth.speaking && this.commandBuffer.length) {
      window.setTimeout(this.runCommands, 10);
    }
  }

  private runCommands = async () => {
    if (this.synth.speaking) {
      return; // In case something else just started
    } else if (!(this.currentCommand = this.commandBuffer.shift() || null)) {
      return; // No commands left
    }

    await this.speak(this.currentCommand);
    this.currentCommand.resolve();
    this.currentCommand = null;
    this.queueCommands();
  }

  private async speak(cmd: VoiceCommand) {
    const { text, voice } = cmd;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // 1 seemed too fast
    utterance.voice = this.voices
      .find(({ name }) => name === voice) || this.defaultVoice;

    await new Promise<any>((resolve, _) => {
      utterance.onend = () => setTimeout(resolve, 100);
      utterance.onerror = (errorEvent) => {
        console.error(errorEvent);
        console.error(`utterance '${text}' by '${voice}' failed`);
        resolve();
      };
      this.synth.speak(utterance);
    });

  }

  private stopSpeaking() {
    this.synth.cancel();
  }
}

interface VoiceCommand {
  text: string;
  voice?: string;
  resolve: () => void;
}

export const voiceDevice = new VoiceDevice;
