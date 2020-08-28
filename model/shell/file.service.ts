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

  readOfd(ofd: OpenFileDescription, maxLines: number, buffer: string[]) {
    const { iNode, offset } = ofd;
    const prevLength = buffer.length;

    if (!iNode.readBlocked) {
      // `0` iff EOF, otherwise it is the number of lines read
      const readReturn = iNode.read(buffer, maxLines, offset);

      if (buffer.length > prevLength) { // At least one line was read
        // Adjust offset for regular/history inodes
        ofd.offset += buffer.length - prevLength;

        if (iNode.type === INodeType.fifo) {
          /**
           * Provide data from pipe as soon as possible,
           * also informing any pending writers.
           */
          iNode.awakenWriters();
          return { eof: false, wait: false };
        } else if (iNode.type === INodeType.tty) {
          return { eof: false, wait: false };
        }
      }

      if (readReturn) {// Not EOF
        if (readReturn < maxLines) {
          // Haven't read `maxLines`, will block below.
        } else {// Have read desired lines without reaching EOF.
          return { eof: false, wait: false };
        }
      } else {// Have read lines and seen EOF.
        // console.log({ buffer: buffer.slice(), prevLength });
        return {
          /**
           * Only report EOF if nothing read (read again for EOF).
           * One can read nothing via e.g. empty pipe, or
           * regular file (or history) with offset beyond EOF.
           */
          eof: buffer.length === prevLength,
          wait: false,
        };
      }
    }
    /**
     * Either read was immediately blocked, or we read 
     * something but fewer than `maxLines` without seeing EOF.
     */
    return {
      eof: false,
      wait: true,
    };
  }

  store(inode: INode, path: string) {
    // TODO resolve inode and attach
  }

}
