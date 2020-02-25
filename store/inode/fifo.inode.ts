import { BaseINode, INodeType, BaseINodeDef } from './base-inode';

export class FifoINode extends BaseINode {

  public readonly data: string[];
  public readonly type = INodeType.fifo;
  /**
   * Keys of open file descriptions writing to pipe.
   */
  public writeEndKeys = [] as string[];

  constructor(public def: FifoINodeDef) {
    super(def);
    this.data = [];
    this.writeEndKeys = [];
  }

  /**
   * We'll need to awaken readers on write.
   */
  public awakenReaders() {
    let count = this.readResolvers.length;
    while (count--) {
      (this.readResolvers.shift() as () => boolean)();
    }
  }
  /**
   * We'll need to awaken writers on read.
   */
  public awakenWriters() {
    let count = this.writeResolvers.length;
    while (count--) {
      (this.writeResolvers.shift() as () => boolean)();
    }
  }

  public read(buffer: string[], maxLines: number, _offset: number): number {
    // Remove the first {maxLines} lines from {this.data}.
    const readLines = this.data.splice(0, maxLines);
    // buffer.push(...readLines); // RangeError: Maximum call stack size exceeded
    for (const line of readLines) buffer.push(line);
    
    if (!this.data.length && !this.writeEndKeys.length) {
      return 0;// No data left and nothing can write, so EOF.
    }
    /**
     * {readLines.length} is non-zero:
     * - {read} is only invoked when {readBlocked} false.
     * - Thus {this.data} initially non-empty, or no writers.
     * - If {this.data} initially empty, would still be empty
     *   for above 'if', hence wouldn't get here.
     * - Thus {this.data} must be non-empty here,
     *   so {readLines} non-empty because {maxLines} positive.
     */
    return readLines.length;
  }
  /**
   * Reading is blocked iff there is no data
   * and something is attached to the write-end.
   */
  public get readBlocked() {
    return !this.data.length && !!this.writeEndKeys.length;
  }

  public removeWriter(openKey: string) {
    this.writeEndKeys = this.writeEndKeys.filter((key) => key !== openKey);   
    // If no more writers, awaken readers.
    if (!this.writeEndKeys.length) {
      this.awakenReaders();
    }
  }

  /**
   * Write lines up to capacity, and always at least 1.
   */
  public async write(buffer: string[], _offset: number) {
    const numLinesLeft = this.def.capacity - this.data.length;
    const writeLines = buffer.splice(0, numLinesLeft);
    // this.data.push(...writeLines); // RangeError: Maximum call stack size exceeded
    for (const line of writeLines) this.data.push(line);
    return writeLines.length;
  }

  public get writeBlocked() {
    return this.data.length === this.def.capacity;
  }

}

export interface FifoINodeDef extends BaseINodeDef {
  /** Maximum number of lines. */
  capacity: number;
}
