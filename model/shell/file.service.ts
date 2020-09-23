import { firstAvailableInteger } from '@model/generic.model';
import useStore, { Process } from '@store/shell.store';
import { FsFile, ShellFile } from "./file.model";
import { ShellStream } from './shell.stream';

export class FileService {

  /**
   * An `FsFile` is a `ShellFile` wrapped together a `key`,
   * i.e. the absolute path at which it will be mounted.
   */
  private createFsFile<R, W>(
    absPath: string,
    /** We should read from this stream */
    readable: ShellStream<R>,
    /** We should write to this stream */
    writable: ShellStream<W>,
    /** Is this file a tty? */
    tty = false,
  ): FsFile {
    return new FsFile(
      absPath, 
      new ShellFile(readable, writable, tty),
    );
  }

  getFile(absPath: string): FsFile | null {
    return this.getFs()[absPath] || null;
  }

  private getFs() {
    return useStore.getState().fs;
  }

  /** If fd unspecified provide the minimal unassigned one. */
  getNextFd(fdToOpen: Process['fdToOpen'], fd: number | undefined): number {
    return fd === undefined
      ? firstAvailableInteger(Object.keys(fdToOpen).map(Number))
      : fd;
  }

  makeDevice(absPath: string) {
    return this.createFsFile(absPath, new ShellStream, new ShellStream);
  }
  
  makeTty(absPath: string) {
    return this.createFsFile(absPath, new ShellStream, new ShellStream, true);
  }

  makeWire(absPath: string) {
    const stream = new ShellStream;
    return this.createFsFile(absPath, stream, stream);
  }

  saveFile(file: FsFile) {
    this.getFs()[file.key] = file;
  }

  unlinkFile(absPath: string) {
    delete this.getFs()[absPath];
  }

  validatePath(absPath: string) {
    const parts = absPath.split('/');
    return parts.length === 3
      && !parts[0] // starts with /
      && allowedDirs.includes(parts[1])
      && parts[2]
      && !/\s/.test(parts[2]);
  }
}

const allowedDirs = ['root', 'dev', 'tmp'];

export const fileService = new FileService;
