import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { RedactInReduxDevTools } from '@model/redux.model';

export class HistoryINode extends BaseINode implements RedactInReduxDevTools {

  public readonly devToolsRedaction = HistoryINode.name;  
  public readonly readBlocked = false;
  public readonly type = INodeType.history;
  public readonly writeBlocked = false;
  
  constructor(
    public def: BaseINodeDef,
    /** Source code entered interactively, most recent last. */
    public history = [] as string[],
  ) {
    super(def);
  }

  public getLine(lineIndex: number) {
    return this.history[lineIndex] || '';
  }

  public read(buffer: string[], maxLines: number, offset: number): number {
    const maxLineNumber = offset + maxLines;
    const readLines = this.history.slice(offset, maxLineNumber);
    buffer.push(...readLines);
    const numLinesLeft = Math.max(0, this.history.length - maxLineNumber);
    return numLinesLeft ? readLines.length : 0;
  }

  public storeSrcLine(srcLine: string) {
    if (srcLine) {
      this.history.push(srcLine);
      while (this.history.length > 500) this.history.shift();
      console.log({ srcLine });
    }
  }

  public async write(buffer: string[], _offset: number) {
    return buffer.splice(0).length; // Sink
  }

}
