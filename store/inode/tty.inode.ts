import { ProcessSignal } from '@model/os/process.model';
import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { HistoryINode } from './history.inode';

/**
 * tty running in interactive mode.
 * - can read user-input from it.
 * - writing to it produces output on the display.
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
  public setXtermPrompt(prompt: string) {
    this.def.setPrompt(prompt);
  }

  /**
   * {this.def.sendSignal} will re-exec the controlling
   * process with interactive bash, cancelling previous
   * subscription and subscribing to a new one.
   * But 1st we remove the old subscription's read resolver.
   */
  public sendSigInt() {
    this.readResolvers.length = 0;
    this.def.sendSignal(ProcessSignal.INT);
  }

  public setColumns(cols: number) {
    this.cols = cols;
  }
  
  /** Handle lines written by processes. */
  public async write(buffer: string[], _offset: number): Promise<number> {
    const lines = buffer.slice();
    
    await new Promise<void>((resolve) => {
      const messageUid = `write-${this.writeCount++}`;
      this.def.writeToXterm(lines, messageUid);
      // Resolved after ack from xterm i.e. lines received
      this.resolveLookup[messageUid] = resolve;
    });

    buffer.length = 0;
    return lines.length;
  }

}

export interface TtyINodeDef extends BaseINodeDef {
  /**
   * The canonical path in filesystem e.g. /dev/tty-1.
   */
  canonicalPath: string;
  /**
   * Tty has history.
   */
  historyINode: HistoryINode;
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
   * Send lines to xterm
   */
  writeToXterm: (lines: string[], messageUid: string) => void;
}
