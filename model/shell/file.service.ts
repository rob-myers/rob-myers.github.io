import { firstAvailableInteger } from '@model/generic.model';
import useStore, { Process } from '@store/shell.store';
import { FsFile, ShellFile } from "./file.model";
import { ShellStream } from './shell.stream';

export class FileService {

  /**
   * Create a `ShellFile` wrapped to be mounted at `absPath`.
   */
  createFsFile<R, W>(
    absPath: string,
    /** We should read from this stream */
    readable: ShellStream<R>,
    /** We should write to this stream */
    writable: ShellStream<W>,
  ): FsFile {
    return new FsFile(absPath, new ShellFile(readable, writable));
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

  makeWire(absPath: string) {
    const stream = new ShellStream();
    return this.createFsFile(absPath, stream, stream);
  }

  saveFile(file: FsFile) {
    this.getFs()[file.key] = file;
  }

  unlinkFile(absPath: string) {
    delete this.getFs()[absPath];
  }
}

export const fileService = new FileService;
