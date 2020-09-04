import globRex from 'globrex';
import { firstAvailableInteger } from '@model/generic.model';
import useStore, { Process } from '@store/shell.store';
import { varService } from './var.service';
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
    return new FsFile(
      absPath,
      new ShellFile(readable, writable),
    );
  }

  /**
   * Fundamental expansion of filepaths containing glob symbols
   * \* (star), ? (question mark) or [] (square brackets).
   */
  expandFilepath(dirPath: string, glob: string) {
    const dirParts = dirPath.split('/');
    dirPath.endsWith('/') && dirParts.pop();
    return this.expandFilepathParts(dirParts, glob.split('/'));
  }

  private expandFilepathParts(dirParts: string[], parts: string[]): string[] {
    if (!parts.length) {
      return [];
    }

    const first = parts.shift() as string;
    if (first === '.') {
      return this.expandFilepathParts(dirParts, parts);
    } else if (first === '..') {
      dirParts.pop();
      return this.expandFilepathParts(dirParts, parts);
    } else if (first === '') {// We're at the root of the filesystem
      return this.expandFilepathParts([], parts).map(x => `/${x}`);
    }

    const currentDir = `/${dirParts.join('/')}/`
    // Start with filenames of directories in 'current directory'
    let matches = Object.keys(this.getFs()).map(absPath => {
        if (absPath.startsWith(currentDir)) {
          const rest = absPath.slice(currentDir.length).split('/');
          return rest.length > 1 ? rest[0] : undefined;
        }
      }).filter(Boolean) as string[];

    try {// npm module 'globrex' converts glob expression to js RegExp
      const { regex } = globRex(first , { extended: true });
      matches = matches.filter((x) => regex.test(x));
    } catch (e) {// Error thrown e.g. if `first` is [ or [ ]
      console.error(e);
    }

    if (!parts.length) {// Base case
      return matches;
    }

    return matches.flatMap((dirName) =>
      this.expandFilepathParts(dirParts.concat(dirName), parts)
        .map((x) => `${dirName}/${x}`));
  }

  getFile(absPath: string): FsFile | null {
    return this.getFs()[absPath] || null;
  }

  private getFs() {
    return useStore.getState().fs;
  }

  /** If fd unspecified provide the minimal unassigned one. */
  getNextFd(
    fdToOpen: Process['fdToOpen'],
    requestedFd: number | undefined,
  ): number {
    return requestedFd === undefined
      ? firstAvailableInteger(Object.keys(fdToOpen).map(Number))
      : requestedFd;
  }

  hasDir(absDirPath: string) {
    const prefix = absDirPath.endsWith('/') ? absDirPath : `${absDirPath}/`;
    return Object.keys(this.getFs()).some(absPath => absPath.startsWith(prefix));
  }

  hasParentDir(absPath: string) {
    const dirPath = absPath.split('/').slice(0, -1).join('/');
    return this.hasDir(dirPath);
  }

  makeWire(absPath: string) {
    const stream = new ShellStream();
    this.createFsFile(absPath, stream, stream);
  }

  /**
   * Resolve a mounted file.
   */
  resolveFile(pid: number, path: string): FsFile | null {
    if (!path.trim()) {// Only whitespace
      return null;
    }
    const absPath = this.resolvePath(pid, path);
    return this.getFs()[absPath] || null;
  }

  resolvePath(pid: number, path: string): string {
    const cwd = varService.expandVar(pid, 'PWD');
    const rootedPath = this.rootedPath(path, cwd);
    const absPath = rootedPath.split('/').reduce((agg, part) => {
      if (!part || part === '.') {
        return agg;
      } else if (part === '..') {
        agg.pop();
      } else {
        agg.push(part);
      }
      return agg;
    }, ['']).join('/');
    return absPath;
  }

  /**
   * Convert path to rooted path by:
   * - rewriting leading ~ to /root
   * - rewriting leading ./ to ${cwd}/
   * - if no / prefix add prefix ${cwd}/
   *
   * We do not resolve inner .'s or ..'s.
   */
  rootedPath(
    /** A relative path */
    path: string,
    /** Absolute path to process's current working directory */
    cwd: string,
  ) {
    if (path.startsWith('/')) {
      return path;
    } else if (path.startsWith('~')) {
      // Leading ~ to user's home directory.
      return `/root${path.slice(1)}`;
    } else if (path.startsWith('./')) {
      // Leading ./ to process's current working directory.
      return `${cwd}${path.slice(1)}`;
    }// Non-leading / to process's current working directory.
    return `${cwd}/${path}`;
  }

  saveFile(file: FsFile) {
    this.getFs()[file.key] = file;
  }

  unlinkFile(absPath: string) {
    delete this.getFs()[absPath];
  }
}

export const fileService = new FileService;
