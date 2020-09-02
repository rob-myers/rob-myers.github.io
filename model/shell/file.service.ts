import useStore, { State as ShellState, FsFile } from '@store/shell.store';
import { ShError } from './transpile.service';
import globRex from 'globrex';
import { varService } from './var.service';

export class FileService {
  private set!: ShellState['api']['set'];

  initialise() {
    this.set = useStore.getState().api.set;
  }

  /**
   * Convert path to rooted path by:
   * - rewriting ~ to /root
   * - rewriting ./ to ${cwd}/.
   * - if no prefix / then add prefix ${cwd}/.
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

  /**
   * Given absolute path `absPath` try to resolve `INode`,
   * throwing an error if not found.
   */
  absPathToINode(absPath: string) {
    const file = this.getFs()[absPath];
    if (file) {
      return file.stream;
    }
    throw new ShError(`${absPath}: no such file or directory`, 1, 'F_NO_EXIST');
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

  resolvePath(pid: number, path: string): FsFile | null {
    if (!path.trim()) {// Only whitespace
      return null;
    }
    
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
    }, [] as string[]).join('/');

    return this.getFs()[absPath] || null;
  }

  getFs() {
    return useStore.getState().fs;
  }
}

export const fileService = new FileService;
