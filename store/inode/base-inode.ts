import generateUid from 'shortid';

export enum INodeType {
  regular= 'regular',
  directory= 'directory',
  fifo= 'fifo',
  null= 'null',
  random= 'random',
  tty= 'tty',
  voice= 'voice',
}

export interface BaseINodeDef {
  groupKey: string;
  userKey: string;
}

export abstract class BaseINode {

  public abstract readonly type: INodeType;
  /**
   * Auto-generated unique id.
   */
  public inodeKey: string;
  /**
   * Number of links in the filesystem.
   */
  public numLinks: number;
  /**
   * Last accessed time.
   */
  public atime = new Date;
  /**
   * Birth time (?).
   */
  public btime = new Date;
  /**
   * Last time the contents were modified.
   */
  public mtime = new Date;
  /**
   * Last time the contents or permissions were modified.
   * NOTE permissions are not implemented.
   */
  public ctime = new Date;
  /**
   * Is reading of this INode blocked?
   */
  public abstract get readBlocked(): boolean;
  /**
   * Resolvers of blocked processes waiting to read.
   * Returns true iff respective process has not terminated.
   * The latter is used by the tty inode.
   */
  public readResolvers: (() => boolean)[];
  /**
   * Is writing of this INode blocked?
   */
  public abstract get writeBlocked(): boolean;
  /**
   * Resolvers of blocked processes waiting to write.
   * Returns true iff respective process has not termianted.
   * The latter is used by the voice inode.
   */
  public writeResolvers: (() => boolean)[];

  constructor(public def: BaseINodeDef) {
    this.inodeKey = `${generateUid()}`;
    this.numLinks = 1;
    this.readResolvers = [];
    this.writeResolvers = [];
  }

  /**
   * Returns number of lines read.
   */
  public abstract read(
    buffer: string[],
    /** Max number of lines to read into {buffer}. */
    maxLines: number,
    offset: number,
  ): number;

  /**
   * Resolves to number of lines written.
   * All written lines must be removed from {buffer}.
   * Asynchronous because writes can take time e.g. speech.
   */
  public abstract async write(
    buffer: string[],
    offset: number,
  ): Promise<number>;

}
