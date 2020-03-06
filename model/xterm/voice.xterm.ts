import { Redacted, redact } from '@model/redux.model';
import { Message, MessageFromOsWorker } from '@model/os/os.worker.model';
import { BaseOsBridge, BaseOsBridgeDef } from './base-os-bridge';

/**
 * There is only one instance of this class for all xterms,
 * because the Web Speech API doesn't permit simultaneous voices.
 */
export class VoiceXterm extends BaseOsBridge<VoiceXtermDef> {
  private commandBuffer: VoiceCommand[];
  private currentCommand: null | VoiceCommand;
  private defaultVoice!: SpeechSynthesisVoice;
  private synth: Redacted<SpeechSynthesis>;
  private voices: Redacted<SpeechSynthesisVoice>[];

  constructor(protected def: VoiceXtermDef) {
    super(def);
    this.commandBuffer = [];
    this.currentCommand = null;
    this.synth = redact(window.speechSynthesis);
    this.voices = [];
    this.setup();
  }

  private setup() {
    setTimeout(() => {
      this.voices = this.synth.getVoices().map(v => redact(v));
      // console.log({ voices: this.voices });
      this.defaultVoice = this.voices
        .find(({ name }) => name === this.def.defaultVoice)
          || this.voices.find(({ default: isDefault }) => isDefault)
          || this.voices[0];
    }, 500);
  }

  protected onWorkerMessage = ({ data: msg }: Message<MessageFromOsWorker>) => {
    // console.log({ at: 'VoiceXterm', receivedFromOsWorker: msg });

    switch (msg.key) {
      case 'send-voice-cmd': {
        this.queueCommands(
          msg.command,
          { key: 'resolve',
            processKey: msg.command.processKey,
            resolve: () => this.def.osWorker.postMessage({
              key: 'said-voice-cmd',
              uid: msg.uid,
            })},
        );
        break;
      }
      case 'cancel-voice-cmds': {
        this.commandBuffer = this.commandBuffer
          .filter(({ processKey }) => processKey !== msg.processKey);
        if (this.currentCommand?.processKey === msg.processKey) {
          this.stopSpeaking();
        }
        break;
      }
      case 'get-all-voices': {
        console.log('sending', this.voices.map(({ name }) => name));
        this.def.osWorker.postMessage({
          key: 'send-all-voices',
          voices: this.voices.map(({ name }) => name),
        });
        break;
      }
    }
  }

  private queueCommands(...newCommands: VoiceCommand[]) {
    this.commandBuffer.push(...newCommands);
    if (!this.synth.speaking && this.commandBuffer.length) {
      window.setTimeout(this.runCommands, 10);
    }
  }

  private runCommands = async () => {
    if (!(this.currentCommand = this.commandBuffer.shift() || null)) {
      return;
    }

    switch (this.currentCommand.key) {
      case 'speech': {
        await this.speak(this.currentCommand);
        break;
      }
      case 'resolve': {
        this.currentCommand.resolve();
        break;
      }
    }
    this.currentCommand = null;
    this.queueCommands();
  }

  private async speak(command: VoiceCommandSpeech) {
    const { text, voice } = command;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voices.find(({ name }) => name === voice) || this.defaultVoice;

    await new Promise<any>((resolve, _) => {
      utterance.onend = () => setTimeout(resolve, 100);
      utterance.onerror = (errorEvent) => {
        console.error(`Utterance '${text}' by '${voice}' failed.`);
        console.error(errorEvent);
        resolve();
      };
      this.synth.speak(utterance);
    });

  }

  private stopSpeaking() {
    this.synth.cancel();
  }
}

export interface VoiceCommandSpeech {
  key: 'speech';
  /**
   * Command `say` will provide `processKey` so
   * can cancel voice if process killed.
   */
  processKey: null | string;
  text: string;
  voice?: string;
}

interface VoiceCommandResolve {
  key: 'resolve';
  processKey: null | string;
  resolve: () => void;
}

type VoiceCommand = (
  | VoiceCommandSpeech
  | VoiceCommandResolve
);

interface VoiceXtermDef extends BaseOsBridgeDef {
  defaultVoice?: string;
}
