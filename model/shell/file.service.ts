import useStore, { State as ShellState } from '@store/shell.store';
import { ShError } from './transpile.service';
import globRex from 'globrex';

export class FileService {
  private set!: ShellState['api']['set'];

  initialise() {
    this.set = useStore.getState().api.set;
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

  getFs() {
    return useStore.getState().fs;
  }
}

export const fileService = new FileService;
