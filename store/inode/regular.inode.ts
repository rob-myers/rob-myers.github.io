import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { BinaryType } from '@model/sh/binary.model';

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
   * Read from regular file.
   * {maxLines} must be positive.
   * {offset} must be non-negative.
   */
  public read(buffer: string[], maxLines: number, offset: number): number {
    if (this.binary && offset === 0) {
      buffer.push(`this is the binary '${this.def.binaryType}'`);
      return 0;
    }
    /**
     * We'll try to read {maxLines} lines,
     * from {offset + 0} to {offset + maxLines - 1}
     */
    const maxLineNumber = offset + maxLines;
    const readLines = this.data.slice(offset, maxLineNumber);
    buffer.push(...readLines);

    // EOF iff have read final line iff {numLinesLeft} is zero.
    const numLinesLeft = Math.max(0, this.data.length - maxLineNumber);
    if (!numLinesLeft) {
      return 0;
    }

    // Non-zero because 0 < {offset} < {maxLineNumber} < {data.length}.
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
