import { BaseINode, INodeType } from './base-inode';
import { range } from '@model/generic.model';
import { RedactInReduxDevTools } from '@model/redux.model';

export class RandomINode extends BaseINode implements RedactInReduxDevTools {

  public readonly devToolsRedaction = RandomINode.name;
  public readonly readBlocked = false;
  public readonly type = INodeType.random;
  public readonly writeBlocked = false;

  /**
   * Read {maxLines} random integers in [0, 1000).
   */
  public read(buffer: string[], maxLines: number, _offset: number) {
    range(maxLines).forEach((_) =>
      buffer.push(`${Math.trunc(Math.random() * 1000)}`)
    );
    return maxLines;
  }

  public async write(buffer: string[], _offset: number) {
    return buffer.splice(0).length;// Immediate write.
  }

}
