import { ProcessSignal } from '@model/os/process.model';
import { BaseINode, INodeType, BaseINodeDef } from './base-inode';

/**
 * tty running in interactive mode.
 * - can read user-input from it.
 * - writing to it produces output on the display, otherwise a sink.
 */
export class TtyINode extends BaseINode {
  
  /** Lines received from a TtyXterm. */
  public inputs: { line: string; resolve: () => void }[];
  /** Identifier without checking typeof. */
  public readonly type = INodeType.tty;
  /** We always permit writes to command buffer. */
  public readonly writeBlocked = false;
  /** Track unresolved writes. */
  public resolveLookup: Record<string, () => void> = {};
  /** Should be updated via messages from xterm. */
  public cols = 80;
  /** Provides uid for messages */
  private writeCount = 0;

  constructor (public def: TtyINodeDef) {
    super(def);
    this.inputs = [];
  }
  
  /** Resume 1st pending reader which hasn't terminated. */
  public awakenFirstPendingReader() {
    let resolve: undefined | (() => boolean);
    while ((resolve = this.readResolvers.shift()) && !resolve());
  }

  public clear() {
    this.def.clearXterm();
  }

  /** Reads exactly one line i.e. last one entered by user. */
  public read(buffer: string[], _maxLines: number, _offset: number): number {
    const input = this.inputs.shift();
    if (input) {
      buffer.push(input.line);
      input.resolve(); // Inform original xterm
    } else {
      buffer.push('');
    }
    return 1;
  }

  /** Reading is blocked iff no input lines are pending. */
  public get readBlocked() {
    return !this.inputs.length;
  }

  /** Set prompt by sending to xterm. */
  public receivePrompt(prompt: string) {
    this.def.setPrompt(prompt);
  }

  /**
   * {this.def.sendSignal} will re-exec the controlling
   * process with interactive bash, cancelling previous
   * subscription and subscribing to a new one.
   * But 1st we remove the old subscription's read resolver.
   */
  public sendSigTerm() {
    this.readResolvers.length = 0;
    this.def.sendSignal(ProcessSignal.TERM);
  }

  public setColumns(cols: number) {
    this.cols = cols;
  }
  
  /** Handle lines written by processes. */
  public async write(buffer: string[], _offset: number): Promise<number> {
    const commands = buffer.map((line) =>
      ({ key: 'line' as 'line', line }));
    
    await new Promise<void>((resolve) => {
      const messageUid = `write-${this.writeCount++}`;
      this.def.sendCommands(commands, messageUid);
      this.resolveLookup[messageUid] = resolve;
    });

    buffer.length = 0;
    return commands.length;
  }

}

export interface TtyINodeDef extends BaseINodeDef {
  /**
   * The canonical path in filesystem e.g. /dev/tty-1.
   */
  canonicalPath: string;
  /**
   * Dispatch signal to foreground process group of parent session.
   */
  sendSignal: (signal: ProcessSignal) => void;
  /**
   * Send prompt to xterm.
   */
  setPrompt: (prompt: string) => void;
  /**
   * Clear xterm.
   */
  clearXterm: () => void;
  /**
   * Send commands to xterm.
   */
  sendCommands: (
    commands: Exclude<TtyOutputCommand, { key: 'resolve' }>[],
    messageUid: string,
  ) => void;
}

export type TtyOutputCommand = (
  | { key: 'line'; line: string }
  | { key: 'clear' }
  | { key: 'newline' }
  | { key: 'prompt'; text: string }
  | { key: 'resolve'; resolve: () => void }
);
