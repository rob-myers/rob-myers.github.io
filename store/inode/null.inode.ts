import { BaseINode, INodeType } from './base-inode';
import { RedactInReduxDevTools } from '@model/redux.model';

export class NullINode extends BaseINode implements RedactInReduxDevTools {

  public readonly devToolsRedaction = NullINode.name;  
  public readonly readBlocked = false;
  public readonly type = INodeType.null;
  public readonly writeBlocked = false;
  
  public read(_buffer: string[], _maxSize: number, _offset: number): number {
    return 0;// Immediate EOF.
  }

  public async write(buffer: string[], _offset: number) {
    return buffer.splice(0).length;// Immediate write.
  }

}
