import * as INode from '@model/inode';
import { INode as INodeType } from '@model/shell/file.model';

export default class FileService {
  dev: INode.DirectoryINode;
  tmp: INode.DirectoryINode;

  constructor(public root: INode.DirectoryINode) {
    this.dev = new INode.DirectoryINode(root.def, root);
    root.addChild('dev', this.dev);
    this.tmp = new INode.DirectoryINode(root.def, root);
    root.addChild('tmp', this.tmp);
  }

  store(inode: INodeType, path: string) {
    // TODO resolve path inode and attach
  }

}
