import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { INode } from '@model/shell/file.model';
import globRex from 'globrex';

export class DirectoryINode extends BaseINode {
  
  public readonly type = INodeType.directory;

  public readonly to: {
    [filename: string]: INode;
    // '.': DirectoryINode;
    // '..': DirectoryINode;
  };

  public dot: () => DirectoryINode;
  public dotDot: () => DirectoryINode;

  public readonly readBlocked = false;
  public readonly writeBlocked = false;
  
  constructor(
    public def: BaseINodeDef,
    parent: null | DirectoryINode,
  ) {
    super(def);
    this.to = {};
    this.dot = () => this;
    this.dotDot = () => parent || this;
  }

  /**
   * Add file to this directory.
   */
  public addChild(filename: string, iNode: INode) {
    this.to[filename] = iNode;
    iNode.numLinks++;
  }

  public createSubdir(): DirectoryINode {
    return new DirectoryINode(this.def, this);
  }

  /**
   * Fundamental expansion of filepaths containing glob symbols
   * \* (star), ? (question mark) or [] (square brackets).
   */
  public expandFilepath(glob: string): string[] {
    return this.expandFilepathParts(glob.split('/'));
  }

  private expandFilepathParts(parts: string[]): string[] {
    if (!parts.length) {
      return [];
    }

    const first = parts.shift() as string;
    if (first === '.') {
      return this.expandFilepathParts(parts);
    } else if (first === '..') {
      return this.dotDot().expandFilepathParts(parts);
    } else if (first === '') {
      // This inode should be the root of the filesystem
      return this.expandFilepathParts(parts).map(x => `/${x}`);
    }

    // Start with filenames in this directory.
    let matches = Object.keys(this.to);
    try {
      // npm module 'globrex' converts glob expression to js RegExp.
      const { regex } = globRex(first , { extended: true });
      matches = matches.filter((x) => regex.test(x));
    } catch (e) {// Error thrown e.g. if {first} is [ or [ ].
      console.error(e);
    }

    if (!parts.length) {// Base case.
      return matches;
    }

    return matches
      .filter((x) => this.to[x].type === INodeType.directory)
      .flatMap((dirname) => (this.to[dirname] as DirectoryINode)
        .expandFilepathParts(parts)
        .map((x) => `${dirname}/${x}`)
      );
  }
  
  public read(): number {
    throw Error(`${DirectoryINode.prototype.read.name} not implemented`);
  }

  /**
   * Remove file from this directory.
   */
  public removeChild(filename: string) {
    const iNode = this.to[filename];
    if (iNode) {
      delete this.to[filename];
      iNode.numLinks--;
    }
  }

  public async write(): Promise<number> {
    throw Error(`${DirectoryINode.prototype.write.name} not implemented`);
  }

}