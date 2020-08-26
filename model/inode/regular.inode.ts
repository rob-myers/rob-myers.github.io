import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { BinaryType } from '@model/shell/binary.model';

export class RegularINode extends BaseINode {

  /** Does this file represent a binary? */
  public binary: boolean;
  public readonly readBlocked = false;
  public readonly type = INodeType.regular;
  public readonly writeBlocked = false;

  constructor(
    public def: RegularINodeDef,
    public data: string[] = [],
  ) {
    super(def);
    this.binary = !!def.binaryType;
  }

  /**
   * Read from regular file:
   * - `maxLines` must be positive.
   * - `offset` must be non-negative.
   */
  public read(buffer: string[], maxLines: number, offset: number): number {
    if (this.binary && offset === 0) {
      buffer.push(`this is the binary '${this.def.binaryType}'`);
      return 0;
    }
    // We'll read `maxLines` lines from `offset` to `offset + maxLines - 1`
    const maxLineNumber = Math.min(offset + maxLines, this.data.length);
    const readLines = this.data.slice(offset, maxLineNumber);
    readLines.forEach(line => buffer.push(line));

    if (maxLineNumber === this.data.length) {
      return 0; // EOF iff no lines left to read
    }
    // Non-zero because 0 < offset < maxLineNumber < data.length
    return readLines.length;
  }

  /**
   * Write, expecting lines to have no \r or \n.
   */
  public async write(buffer: string[], offset: number) {
    if (this.binary) {
      return buffer.length = 0;
    }
    const numLines = buffer.length;
    buffer.forEach((line, i) => this.data[offset + i] = line);
    // Empty the array, since everything written.
    buffer.length = 0;
    return numLines;
  }

}

interface RegularINodeDef extends BaseINodeDef {
  binaryType?: BinaryType;
}
