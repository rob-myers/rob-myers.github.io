/* eslint-disable @typescript-eslint/no-use-before-define */
import { dirname, basename, join } from 'path';
import * as shortId from 'shortid';

import { OsAct } from '@model/os/os.model';
import { updateLookup, addToLookup, SyncAct, SyncActDef, } from '@model/redux.model';
import { createOsAct, OsThunkAct, createOsThunk } from '@model/os/os.redux.model';
import { State } from '@store/os.duck';
import { osExpandVarThunk, osAssignVarThunk } from './declare.os.duck';
import { INode, OpenFileRequest, OpenFileDescription } from '@model/os/file.model';
import { DirectoryINode } from '@store/inode/directory.inode';
import { RegularINode } from '@store/inode/regular.inode';
import { INodeType } from '@store/inode/base-inode';
import { closeFd, firstAvailableInteger } from '@service/filesystem.service';
import { osGetProcessThunk } from './process.os.duck';
import { validateRegexString, TermError } from '@service/term.util';
import { testNever, range } from '@model/generic.model';
import { FifoINode } from '@store/inode/fifo.inode';

export type Action = (
  // | ClearBufferAct
  | CloseFileDescriptorAct
  | DupFileDescriptorAct
  | IncrementOpenAct
  | MountFileAct
  | OffsetOpenAct
  | RegisterOpenFileAct
  | SetFileDescriptorAct
  // | UnmountFileAct
);

/**
 * Close file descriptor {fd} in process {processKey}, warning if n'exist pas.
 * Note that {fd} could still be open in an earlier code-block
 */
export const osCloseFdAct = createOsAct<OsAct, CloseFileDescriptorAct>(
  OsAct.OS_CLOSE_FD,
);
export interface CloseFileDescriptorAct extends SyncAct<OsAct, { processKey: string; fd: number }> {
  type: OsAct.OS_CLOSE_FD;
}
export const osCloseFdDef: SyncActDef<OsAct, CloseFileDescriptorAct, State> = ({ processKey, fd }, state) => {
  const { proc: { [processKey]: process } } = state;
  const { fdToOpenKey, nestedRedirs: [redirs] } = process;
  const nextOfd = redirs[fd]
    ? closeFd({ fromFd: fdToOpenKey, fd, ofd: state.ofd, warnNonExist: true })
    : state.ofd;

  return {
    ...state,
    ofd: nextOfd,
    proc: updateLookup(processKey, state.proc, ({ fdToOpenKey, nestedRedirs }) => {
      // Remove from fd-to-openKey mapping.
      const nextFromFd = { ...fdToOpenKey };
      delete nextFromFd[fd];
      // Remove from current nested redirection scope, in case was added there.
      const nextRedirs = { ...redirs };
      delete nextRedirs[fd];
      return {
        fdToOpenKey: nextFromFd,
        nestedRedirs: [nextRedirs, ...nestedRedirs.slice(1)],
      };
    }),
  };
};

/**
 * Duplicate file descriptor {srcFd} at {dstFd} in {processKey}.
 * If {srcFd} points to {ofd}, make {dstFd} point to the same one.
 * Close {dstFd} if opened in current redirection scope.
 */
export const osDupFileDescriptorAct = createOsAct<OsAct, DupFileDescriptorAct>(
  OsAct.OS_DUP_FD,
);
export interface DupFileDescriptorAct extends SyncAct<OsAct, {
  processKey: string;
  srcFd: number;
  dstFd: number;
}> {
  type: OsAct.OS_DUP_FD;
}
export const osDupFileDescriptorDef: SyncActDef<OsAct, DupFileDescriptorAct, State> = ({ processKey, srcFd, dstFd }, state) => {
  const { proc: { [processKey]: process } } = state;
  const { fdToOpenKey: { [srcFd]: openKey }, nestedRedirs: [redirs] } = process;
  /**
   * Close dstFd if opened in current redir scope.
   */
  const nextOfd = redirs[dstFd]
    ? closeFd({ fromFd: process.fdToOpenKey, fd: dstFd, ofd: state.ofd })
    : state.ofd;

  const nextRedirs = { ...redirs, [dstFd]: openKey };

  return { ...state,
    ofd: updateLookup(openKey, nextOfd, ({ numLinks }) => ({ numLinks: numLinks + 1 })),
    proc: updateLookup(processKey, state.proc,
      ({ fdToOpenKey, nestedRedirs }) => ({
        fdToOpenKey: { ...fdToOpenKey, [dstFd]: openKey },
        nestedRedirs: [nextRedirs, ...nestedRedirs.slice(1)],
      })),
  };
};

/**
 * Increment numLinks in the open file description {openKey}.
 */
export const osIncrementOpenAct = createOsAct<OsAct, IncrementOpenAct>(
  OsAct.OS_INCREMENT_OPEN,
);
export interface IncrementOpenAct extends SyncAct<OsAct, { openKey: string }> {
  type: OsAct.OS_INCREMENT_OPEN;
}
export const osIncrementOpenDef: SyncActDef<OsAct, IncrementOpenAct, State> = ({ openKey }, state) => ({
  ...state,
  ofd: updateLookup(openKey, state.ofd, ({ numLinks }) => ({ numLinks: numLinks + 1 })),
});

/**
 * Mount a file onto filesystem.
 */
interface MountFileAct extends SyncAct<OsAct, { filename: string; iNode: INode; parent: DirectoryINode }> {
  type: OsAct.OS_MOUNT_FILE;
}
export const osMountFileAct = createOsAct<OsAct, MountFileAct>(
  OsAct.OS_MOUNT_FILE,
);
export const osMountFileDef: SyncActDef<OsAct, MountFileAct, State> =
({ parent, filename, iNode }, state) => {
  parent.addChild(filename, iNode);// Mutation.
  return { ...state };
};

/**
 * Offset open-file-description.
 * Used when reading/writing regular files.
 */
export const osOffsetOpenAct = createOsAct<OsAct, OffsetOpenAct>(
  OsAct.OS_OFFSET_OPEN,
);
export interface OffsetOpenAct extends SyncAct<OsAct, {
  openKey: string;
  delta: number;
}> {
  type: OsAct.OS_OFFSET_OPEN;
}
export const osOffsetOpenDef: SyncActDef<OsAct, OffsetOpenAct, State> = (payload, state) => {
  const { openKey, delta } = payload;
  return {
    ...state,
    ofd: updateLookup(openKey, state.ofd, ({ offset }) => ({
      offset: offset + delta,
    })),
  };
};

/**
 * Add open-file-description to state.
 */
export const osRegisterOpenFileAct = createOsAct<OsAct, RegisterOpenFileAct>(
  OsAct.OS_REGISTER_OPEN_FILE,
);
export interface RegisterOpenFileAct extends SyncAct<OsAct, { ofd: OpenFileDescription }> {
  type: OsAct.OS_REGISTER_OPEN_FILE;
}
export const osRegisterOpenFileDef: SyncActDef<OsAct, RegisterOpenFileAct, State> = ({ ofd }, state) => ({
  ...state,
  ofd: addToLookup({ ...ofd }, state.ofd),
});

/**
 * Point file descriptor {fd} at {ofd} in {processKey}.
 */
export const osSetFileDescriptorAct = createOsAct<OsAct, SetFileDescriptorAct>(OsAct.OS_SET_FD);
export interface SetFileDescriptorAct extends SyncAct<OsAct, {
  processKey: string;
  fd: number;
  ofd: OpenFileDescription;
}> {
  type: OsAct.OS_SET_FD;
}
export const osSetFileDescriptorDef: SyncActDef<OsAct, SetFileDescriptorAct, State> = ({ fd, processKey, ofd }, state) => {
  const { proc: { [processKey]: process  } } = state;
  const { fdToOpenKey, nestedRedirs: [redirs] } = process;
  /**
   * Close if opened in current redirection scope.
   */
  const nextOfd = redirs[fd]
    ? closeFd({ fromFd: fdToOpenKey, fd, ofd: state.ofd })
    : state.ofd;
  const nextRedirs = { ...redirs, [fd]: ofd.key };

  return { ...state,
    proc: updateLookup(processKey, state.proc,
      ({ fdToOpenKey, nestedRedirs }) => ({
        fdToOpenKey: { ...fdToOpenKey, [fd]: ofd.key },
        nestedRedirs: [nextRedirs, ...nestedRedirs.slice(1)],
      })),
    ofd: updateLookup(ofd.key, nextOfd,
      ({ numLinks }) => ({ numLinks: numLinks + 1 }),
    ),
  };
};

export type Thunk = (
  | AbsPathThunk
  | AbsToINodeThunk
  | ExpandFilepathThunk
  | GoHomeThunk
  | MakeFifoThunk
  | OpenFileThunk
  | RealPathThunk
  | ReadThunk
  | ResolvePathThunk
  | RemoveDirThunk
  | UnlinkFileThunk
  | UpdatePwdThunk
  | WriteThunk
);

/**
 * Path to absolute path, without resolving inner .'s or ..'s.
 */
export const osAbsPathThunk = createOsThunk<OsAct, AbsPathThunk>(
  OsAct.OS_ABS_PATH_THUNK,
  ( { state: { os: { user, proc }}, dispatch, service },
    { processKey, path },
  ) => {
    const { userKey } = proc[processKey];
    const { homeDir } = user[userKey];
    const cwd = dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));
    return service.filesystem.absPath(path, { homeDir, cwd });
  },
);
interface AbsPathThunk extends OsThunkAct<OsAct, { path: string; processKey: string }, string> {
  type: OsAct.OS_ABS_PATH_THUNK;
}

export const osAbsToINodeThunk = createOsThunk<OsAct, AbsToINodeThunk>(
  OsAct.OS_ABS_TO_INODE,
  ({ state: { os: { root }}, service: { filesystem } }, { absPath }) => {
    return filesystem.absPathToINode(absPath, root);
  }
);
interface AbsToINodeThunk extends OsThunkAct<OsAct, { absPath: string }, INode> {
  type: OsAct.OS_ABS_TO_INODE;
}

/**
 * Returns a non-empty array of expansions, or null if no expansions found.
 */
export const osExpandFilepathThunk = createOsThunk<OsAct, ExpandFilepathThunk>(
  OsAct.OS_EXPAND_FILEPATH_THUNK,
  ({ dispatch }, { processKey, pattern }) => {

    if (!/\*|\?|\[/.test(pattern)) {// Not a filepath glob.
      return null;
    } else if (!validateRegexString(pattern, 'Unterminated character class')) {
      return null;// Ignore e.g. /^[ $/.
    }

    /** Path to directory node we'll start from. */
    const absPath = pattern.startsWith('/')
      ? '/'
      : dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));

    // TODO Handle invalid PWD.
    const dirINode = dispatch(osAbsToINodeThunk({ absPath })) as DirectoryINode;
    const matches = dirINode.expandFilepath(pattern);
    return matches.length ? matches : null;
  },
);

interface ExpandFilepathThunk extends OsThunkAct<OsAct, { processKey: string; pattern: string }, null | string[]> {
  type: OsAct.OS_EXPAND_FILEPATH_THUNK;
}

/**
 * Get open file description at {fd} in {processKey}.
 */
export const osGetOfdThunk = createOsThunk<OsAct, GetOpenFileDescriptionThunk>(
  OsAct.OS_GET_OFD_THUNK,
  ({ state: { os: { proc, ofd }}}, { processKey, fd }) => {
    const { fdToOpenKey: { [fd]: openKey }} = proc[processKey];
    return ofd[openKey];
  },
);
interface GetOpenFileDescriptionThunk extends OsThunkAct<OsAct, { processKey: string; fd: number }, OpenFileDescription> {
  type: OsAct.OS_GET_OFD_THUNK;
}

/**
 * Go to directory ${HOME}.
 */
export const osGoHomeThunk = createOsThunk<OsAct, GoHomeThunk>(
  OsAct.OS_ABS_PATH_THUNK,
  ({ dispatch }, { processKey }) => {
    const homePath = dispatch(osExpandVarThunk({ processKey, varName: 'HOME' }));
    dispatch(osAssignVarThunk({ processKey, varName: 'PWD', act: { key: 'default', value: homePath } }));
  },
);
interface GoHomeThunk extends OsThunkAct<OsAct, { processKey: string }, void> {
  type: OsAct.OS_GO_HOME_THUNK;
}

/**
 * Make a directory, possibly recursively.
 */
export const osMkDirThunk = createOsThunk<OsAct, MakeDirThunk>(
  OsAct.OS_MAKE_DIR_THUNK,
  ({ state: { os: { root: rootDir }}, dispatch },
    { path, processKey, makeSuper = false }) => {

    const absPath = dispatch(osAbsPathThunk({ path, processKey }));
    const [,...parts] = absPath.split('/');
    // Empty <=> {absPath} ends with '/' <=> {absPath} is '/'.
    const lastPart = parts.pop(); 

    let iNode = rootDir as DirectoryINode;
    for (const part of parts) {
      if (!part || part === '.') {
        continue; // Ignore repeated '/'s and self-loops via '.'.
      } else if (part === '..') {
        iNode = iNode.dotDot();
      } else if (!iNode.to[part]) {// Non-existent.
        if (makeSuper) {
          const childINode = iNode.createSubdir();
          dispatch(osMountFileAct({ filename: part, iNode: childINode, parent: iNode }));
          iNode = childINode;
        } else {// Parent path doesn't exist and not ensured.
          throw new TermError(`${path}: no such file or directory`, 1);
        }
      } else if (iNode.to[part].type === INodeType.directory) {
        iNode = iNode.to[part] as DirectoryINode;
      } else {// Ancestral part is not a directory.
        throw new TermError(`${part}: not a directory`, 1);
      }
    }

    if (lastPart) {// {absPath} is not '/'.
      const finalINode = iNode.to[lastPart];
      if (!finalINode) {// Make the directory.
        const childINode = iNode.createSubdir();
        dispatch(osMountFileAct({ filename: lastPart, iNode: childINode, parent: iNode }));
        return iNode;
      } else if (makeSuper) {
        if (finalINode.type === INodeType.directory) {
          return finalINode;// Exists, but a directory so ok.
        } // Exists but not a directory.
        throw new TermError(`${lastPart}: file exists`, 1);
      } else {// File or directory already exists.
        throw new TermError(`${lastPart}: file exists`, 1);
      }
    } else if (!makeSuper) {// {absPath} is '/', so certainly exists.
      throw new TermError(`${path}': is a directory`, 1);
    }

    return iNode;
  },
);
interface MakeDirThunk extends OsThunkAct<OsAct, { path: string; processKey: string; makeSuper?: boolean }, DirectoryINode> {
  type: OsAct.OS_MAKE_DIR_THUNK;
}

/**
 * Make fifo at {path}, resolving relative to {processKey}.
 */
export const osMakeFifoThunk = createOsThunk<OsAct, MakeFifoThunk>(
  OsAct.OS_MAKE_FIFO_THUNK,
  /**
   * Pipe capacity already set by transpiler.
   */
  ({ dispatch, state: { os } }, { processKey, path, capacity = 100 }) => {
    const absPath = dispatch(osRealPathThunk({ processKey, path }));
    try {
      dispatch(osAbsToINodeThunk({ absPath }));
      // File exists, so throw error.
      throw new TermError(`mkfifo: ${path}: File exists`, 1);
    } catch (e) {
      // File doesn't exist, so create and mount fifo.
      const parentDir = dispatch(osAbsToINodeThunk({ absPath: dirname(absPath) })) as DirectoryINode;
      const { userKey } = os.proc[processKey];
      const fifoINode = new FifoINode({
        capacity,
        groupKey: userKey,
        userKey,
      });
      dispatch(osMountFileAct({ filename: basename(absPath), iNode: fifoINode, parent: parentDir }));
    }
  },
);
interface MakeFifoThunk extends OsThunkAct<OsAct, { processKey: string; path: string; capacity?: number }, void> {
  type: OsAct.OS_MAKE_FIFO_THUNK;
}

/**
 * Open file in {processKey}.
 * We also return the respective INode.
 */
export const osOpenFileThunk = createOsThunk<OsAct, OpenFileThunk>(
  OsAct.OS_OPEN_FILE_THUNK,
  ( { state: { os: { proc, root }}, dispatch, service: { filesystem } },
    { processKey, request },
  ) => {
    const { path, mode, opts, fd: fdOrUndefined } = request;
    const { userKey, fdToOpenKey } = proc[processKey];
    /**
     * Ensure path to file exists, the file need not.
     */
    const absPath = dispatch(osRealPathThunk({ path, processKey }));
    /**
     * Catch error if file n'exist pas, in case we are creating it.
     */
    let iNode: INode;
    try {
      iNode = filesystem.absPathToINode(absPath, root);
    } catch (e) {
      if ((mode === 'RDONLY') || (opts && opts.doNotCreate)) {
        // Only opening to read, or don't want to create.
        throw Error(`${path}: no such file or directory`);
      }
      /**
       * Create and mount regular file (parent exists via resolution above).
       */
      iNode = new RegularINode({ userKey, groupKey: userKey });
      const parent = dispatch(osAbsToINodeThunk({ absPath: dirname(absPath) })) as DirectoryINode;
      dispatch(osMountFileAct({ filename: basename(absPath), iNode, parent }));
    }

    if (iNode.type === INodeType.directory) {
      throw Error(`${path}: is a directory`);// Cannot open directory.
    } else if ((iNode.type === INodeType.regular) && opts && opts.truncateReg) {
      iNode.data.length = 0;// Truncate regular file.
    }
    /**
     * Create and register open file description.
     */
    const ofd = filesystem.createOfd(iNode, request);
    dispatch(osRegisterOpenFileAct({ ofd }));
    /**
     * Connect to process via file descriptor.
     */
    const nextFd = filesystem.getNextFd(fdToOpenKey, fdOrUndefined);
    if (nextFd in fdToOpenKey) {// Close if open.
      dispatch(osCloseFdAct({ processKey, fd: nextFd }));
    }
    dispatch(osSetFileDescriptorAct({ processKey, fd: nextFd, ofd }));
    
    // Finally, fifos additionally register when writing.
    if (iNode.type === INodeType.fifo && mode !== 'RDONLY') {
      iNode.writeEndKeys.push(ofd.key);
    }

    return { openKey: ofd.key, fd: nextFd, iNode };
  },
);
interface OpenFileThunk extends OsThunkAct<OsAct,
  { processKey: string; request: OpenFileRequest },
  { openKey: string; fd: number; iNode: INode }
> {
  type: OsAct.OS_OPEN_FILE_THUNK;
}

/**
 * Open temp file at next unused fd, not less than 10.
 */
export const osOpenTempThunk = createOsThunk<OsAct, OpenTempThunk>(
  OsAct.OS_OPEN_TEMP_THUNK,
  ({ dispatch, state: { os } }, { processKey }) => {
    const { fdToOpenKey } = os.proc[processKey];
    const fd = firstAvailableInteger(range(0, 10).concat(Object.keys(fdToOpenKey).map(Number)));
    const tempPath = `/tmp/${shortId.generate()}.tmp`;
    dispatch(osOpenFileThunk({ processKey, request: { fd, mode: 'RDWR', path: tempPath } }));
    return { fd, tempPath };
  },
);
interface OpenTempThunk extends OsThunkAct<OsAct, { processKey: string }, { tempPath: string; fd: number }> {
  type: OsAct.OS_OPEN_TEMP_THUNK;
}

/**
 * Read from {fd} in {processKey}.
 */
export const osReadThunk = createOsThunk<OsAct, ReadThunk>(
  OsAct.OS_READ_THUNK,
  ({ dispatch, state: { os } }, { processKey, fd, maxLines, buffer: otherBuffer }) => {

    const { iNode, offset, key: openKey } = dispatch(osGetOfdThunk({ processKey, fd }));
    const buffer = otherBuffer || os.proc[processKey].buffer;
    const prevLength = buffer.length;

    if (!iNode.readBlocked) {
      /** 0 iff EOF, otherwise the number of lines read. */
      const readReturn = iNode.read(buffer, maxLines, offset);

      if (buffer.length > prevLength) {
        /**
         * INode specific behaviour on read positive number of lines.
         * One can read nothing via empty pipe, or regular file with offset beyond EOF.
         */
        if (iNode.type === INodeType.regular) {
          dispatch(osOffsetOpenAct({ openKey, delta: buffer.length - prevLength }));
        } else if (iNode.type === INodeType.fifo) {
          iNode.awakenWriters();
        }
      }

      if (readReturn) {// Not EOF.
        if (readReturn < maxLines) {
          // Haven't read {maxLines}, will block below.
        } else {// Have read desired lines without reaching EOF.
          return { eof: false, toPromise: null };
        }
      } else {// Have read lines and seen EOF.
        // console.log({ buffer: buffer.slice(), prevLength });

        return {// Only report EOF if nothing read (read again for EOF).
          eof: buffer.length === prevLength,
          toPromise: null,
        };
      }
    }
    /**
     * Either read was immediately blocked, or
     * or read something but less than {maxLines} without seeing EOF.
     */
    return {
      eof: false,
      toPromise: () => new Promise<void>((resolvePromise, _) =>
        iNode.readResolvers.push(() => {
          // This should resume the process {processKey}.
          resolvePromise();
          // Return true iff process hasn't terminated, nor exec'd.
          return dispatch(osGetProcessThunk({ processKey })) !== null;
        })),
    };
  },
);

export interface ReadThunk extends OsThunkAct<OsAct,
  { processKey: string; fd: number; maxLines: number; buffer?: string[] },
  { eof: boolean; toPromise: IoToPromise }
> {
  type: OsAct.OS_READ_THUNK;
}

export type IoToPromise = null | (() => Promise<void>);

/**
 * Resolve real path, where final path-component need not exist.
 */
export const osRealPathThunk = createOsThunk<OsAct, RealPathThunk>(
  OsAct.OS_REAL_PATH_THUNK,
  ( { state: { os: { root, proc, user }}, dispatch, service: { filesystem } },
    { processKey, path },
  ) => {
    const { userKey } = proc[processKey];
    const { homeDir } = user[userKey];
    const cwd = dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));
    return filesystem.realPath(path, root, { cwd, homeDir });
  },
);
interface RealPathThunk extends OsThunkAct<OsAct, { path: string; processKey: string }, string> {
  type: OsAct.OS_REAL_PATH_THUNK;
}

/**
 * Remove an empty directory.
 */
export const osRemoveDirThunk = createOsThunk<OsAct, RemoveDirThunk>(
  OsAct.OS_REMOVE_DIR_THUNK,
  ({ dispatch }, { path, processKey }) => {
    const { iNode, absPath } = dispatch(osResolvePathThunk({ processKey, path }));

    if (iNode.type !== INodeType.directory) {
      throw new TermError(`${path}: not a directory`, 1);
    } else if (Object.keys(iNode.to).length > 2) {
      throw new TermError(`${path}: directory not empty`, 1);
    } else if (absPath === '/') {
      throw new TermError(`${path}: cannot remove root`, 1);
    }

    iNode.numLinks--;
    iNode.dotDot().removeChild(basename(absPath));
  },
);
interface RemoveDirThunk extends OsThunkAct<OsAct, { processKey: string; path: string }, void> {
  type: OsAct.OS_REMOVE_DIR_THUNK;
}

/**
 * In the context of {processKey} resolve {path}, yielding an {INode} and its {absPath}.
 * Can check files directly inside PATH directories (default false).
 * Throw an error if n'exist pas.
 */
export const osResolvePathThunk = createOsThunk<OsAct, ResolvePathThunk>(
  OsAct.OS_RESOLVE_PATH_THUNK,
  ({ dispatch }, { processKey, path, PATH = false }) => {
    try {
      const absPath = dispatch(osRealPathThunk({ processKey, path }));
      return { absPath, iNode: dispatch(osAbsToINodeThunk({ absPath })) };
    } catch (e) {
      if (PATH) {
        try {// Look for {path} directly in each absolute path in PATH.
          for (const dirPath of dispatch(osExpandVarThunk({ processKey, varName: 'PATH' })).split(':')) {
            const dirNode = dispatch(osAbsToINodeThunk({ absPath: dirPath }));
            if (dirNode.type === INodeType.directory && dirNode.to[path]) {
              return { absPath: join(dirPath, path), iNode: dirNode.to[path] };
            }
          }
        } catch (e) {
          // NOOP
        }
      }
    }
    throw new TermError(`${path}: no such file or directory`, 1);
  },
);
interface ResolvePathThunk extends OsThunkAct<OsAct,
  { processKey: string; path: string; PATH?: boolean },
  { iNode: INode; absPath: string }
> {
  type: OsAct.OS_RESOLVE_PATH_THUNK;
}

/**
 * Unlink file.
 * Can unmount immediately.
 * Open file descriptions may retain a reference though.
 * Throw error if directory -- use {removeDirThunk} instead.
 */
export const osUnlinkFileThunk = createOsThunk<OsAct, UnlinkFileThunk>(
  OsAct.OS_UNLINK_FILE_THUNK,
  ({ dispatch }, { path, processKey }) => {
    const absPath = dispatch(osRealPathThunk({ processKey, path }));
    const iNode = dispatch(osAbsToINodeThunk({ absPath }));
    if (iNode.type === INodeType.directory) {
      throw new TermError(`${path}: is a directory`, 1);
    }
    // Know Parent exists and is a directory.
    const parent = dispatch(osAbsToINodeThunk({ absPath: dirname(absPath) })) as DirectoryINode;
    iNode.numLinks--;
    // dispatch(osUnmountFileAct({ parent, filename: basename(absPath) }))
    parent.removeChild(basename(absPath));
  },
);
interface UnlinkFileThunk extends OsThunkAct<OsAct, { path: string; processKey: string }, void> {
  type: OsAct.OS_UNLINK_FILE_THUNK;
}

/**
 * store: OLDPWD=PWD; PWD={nextPwd}.
 * swap: [OLDPWD, PWD] := [PWD, OLDPWD]
 */
export const osUpdatePwdThunk = createOsThunk<OsAct, UpdatePwdThunk>(
  OsAct.OS_UPDATE_PWD_THUNK,
  ({ dispatch }, { processKey, act }) => {
    switch (act.key) {
      case 'store': {
        const OLDPWD = dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));
        dispatch(osAssignVarThunk({ processKey, varName: 'OLDPWD', act: { key: 'default', value: OLDPWD }}));
        dispatch(osAssignVarThunk({ processKey, varName: 'PWD', act: { key: 'default', value: act.nextPWD }}));
        break;
      }
      case 'swap': {
        const PWD = dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));
        const OLDPWD = dispatch(osExpandVarThunk({ processKey, varName: 'OLDPWD' }));
        dispatch(osAssignVarThunk({ processKey, varName: 'OLDPWD', act: { key: 'default', value: PWD }}));
        dispatch(osAssignVarThunk({ processKey, varName: 'PWD', act: { key: 'default', value: OLDPWD }}));
        break;
      }
      default: throw testNever(act);
    }
  },
);
interface UpdatePwdThunk extends OsThunkAct<OsAct, {
  processKey: string;
  act: (
    | { key: 'swap' }
    | { key: 'store'; nextPWD: string }
  );
}, void> {
  type: OsAct.OS_UPDATE_PWD_THUNK;
}

/**
 * Attempt to write data, where {toPromise} truthy iff blocking.
 */
export const osWriteThunk = createOsThunk<OsAct, WriteThunk>(
  OsAct.OS_WRITE_THUNK,
  async ({ dispatch, state: { os } }, args) => {
    const { processKey, fd } = args;
    const { iNode, offset, append, key: openKey } = dispatch(osGetOfdThunk({ processKey, fd }));
    const buffer = args.lines || os.proc[processKey].buffer;
    
    if (!buffer.length) {
      return { toPromise: null };
    }

    if (!iNode.writeBlocked) {
      const writeOffset = append ? (iNode as RegularINode).data.length : offset;
      
      // Write as much as possible, and at least 1 line.
      const numLinesWritten = await iNode.write(buffer, writeOffset);

      if (iNode.type === INodeType.fifo) {
        // Something written, so something to read.
        iNode.awakenReaders();
      } else if (iNode.type === INodeType.voice) {
        // Everything said, so next can speak.
        iNode.awakenWriters();
      }
      
      dispatch(osOffsetOpenAct({ openKey, delta: (writeOffset - offset) + numLinesWritten }));
      if (buffer.length === 0) {// All writing done.
        return { toPromise: null };
      }
    }
    return {// Blocked, with something or nothing written.
      toPromise: () => new Promise<void>((resolve) =>
        iNode.writeResolvers.push(() => {
          resolve();
          return dispatch(osGetProcessThunk({ processKey })) !== null;
        })
      ),
    };
  },
);
interface WriteThunk extends OsThunkAct<
  OsAct.OS_WRITE_THUNK,
  { processKey: string; fd: number; lines?: string[] },
  Promise<{ toPromise: IoToPromise }>
> {
  type: OsAct.OS_WRITE_THUNK;
}
