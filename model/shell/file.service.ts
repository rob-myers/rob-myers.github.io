import { DirectoryINode, NullINode, RegularINode } from '@model/inode';
import { INode, OpenFileDescription, CreateOfdOpts } from '@model/shell/file.model';
import { INodeType } from '@model/inode/base-inode';

export default class FileService {
  /** This is /dev */
  dev: DirectoryINode;
  /** This is /root */
  home: DirectoryINode;
  /** This is /tmp */
  tmp: DirectoryINode;
  /** This is /dev/null */
  null: NullINode;

  constructor(public root: DirectoryINode) {
    this.dev = new DirectoryINode(root.def, root);
    root.addChild('dev', this.dev);
    this.tmp = new DirectoryINode(root.def, root);
    root.addChild('tmp', this.tmp);
    this.home = new DirectoryINode(root.def, root);
    root.addChild('root', this.home);
    
    this.null = new NullINode(root.def);
    this.dev.addChild('null', this.null);
  }

  createOfd(key: string, iNode: INode, opts: CreateOfdOpts): OpenFileDescription {
    const append = iNode.type === INodeType.regular && opts.append || false;
    return {
      key,
      iNode, // Direct reference.
      mode: opts.mode,
      append, // Only regular files can be appended to
      // When appending we'll offset before each write.
      offset: append ? (iNode as RegularINode).data.length : 0,
      numLinks: 0,
    };
  }

  store(inode: INode, path: string) {
    // TODO resolve inode and attach
  }

}
