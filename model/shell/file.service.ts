import * as INode from '@model/inode';
import { INode as INodeType } from '@model/shell/file.model';

export default class FileService {
  /** This is /dev */
  dev: INode.DirectoryINode;
  /** This is /root */
  home: INode.DirectoryINode;
  /** This is /tmp */
  tmp: INode.DirectoryINode;

  constructor(public root: INode.DirectoryINode) {
    this.dev = new INode.DirectoryINode(root.def, root);
    root.addChild('dev', this.dev);
    this.tmp = new INode.DirectoryINode(root.def, root);
    root.addChild('tmp', this.tmp);
    this.home = new INode.DirectoryINode(root.def, root);
    root.addChild('root', this.home);
  }

  store(inode: INodeType, path: string) {
    // TODO resolve inode and attach
  }

}
