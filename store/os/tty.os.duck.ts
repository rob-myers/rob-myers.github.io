import { createOsThunk, OsThunkAct } from '@model/os/os.redux.model';
import { OsAct } from '@model/os/os.model';
import { TtyINode } from '@store/inode/tty.inode';
import { osSignalForegroundThunk, osIncrementTtyIdAct } from './session.os.duck';
import { osMountFileAct, osGetOfdThunk } from './file.os.duck';
import { DirectoryINode } from '@store/inode/directory.inode';
import { INodeType } from '@store/inode/base-inode';
import { HistoryINode } from '@store/inode/history.inode';

export type Thunk = (
  | ClearTtyThunk
  | CreateTtyThunk
  | IsATtyThunk
  | PromptThunk
);

/**
 * Clear terminal.
 */
export const osClearTtyThunk = createOsThunk<OsAct, ClearTtyThunk>(
  OsAct.OS_CLEAR_TTY_THUNK,
  ({ state: { os } }, { processKey }) => {
    const { sessionKey } = os.proc[processKey];
    const { ttyINode } = os.session[sessionKey];
    if (ttyINode) {
      // ttyINode.queueCommands({ key: 'clear' });
      ttyINode.clear();
    }
  },
);

interface ClearTtyThunk extends OsThunkAct<OsAct, { processKey: string }, void> {
  type: OsAct.OS_CLEAR_TTY_THUNK;
}

/**
 * Create tty and also {sessionKey} for login session.
 */
export const osCreateTtyThunk = createOsThunk<OsAct, CreateTtyThunk>(
  OsAct.OS_CREATE_TTY_THUNK,
  ({ dispatch, state: { os }, worker } ) => {

    const { nextTtyId } = os.aux;
    const canonicalFilename = `tty-${nextTtyId}`;
    const canonicalPath = `/dev/${canonicalFilename}`;
    // const sessionKey = `${userKey}@${canonicalFilename}`;
    const sessionKey = canonicalFilename;
    const userKey = 'user'; // TODO

    // Expects history at /home/{userKey}/.history
    const historyINode = ((os.root.to.home as DirectoryINode)
      .to[userKey] as DirectoryINode).to['.history'] as HistoryINode;

    // Create tty device
    const iNode = new TtyINode({
      userKey,
      groupKey: userKey,
      canonicalPath,
      historyINode,
      sendSignal: (signal) => dispatch(osSignalForegroundThunk({
        sessionKey,
        signal,
      })),
      setPrompt: (prompt) => worker.postMessage({
        key: 'set-xterm-prompt',
        sessionKey,
        prompt,
      }),
      clearXterm: () => worker.postMessage({
        key: 'clear-xterm',
        sessionKey,
      }),
      writeToXterm: (lines, messageUid) => worker.postMessage({
        key: 'write-to-xterm',
        sessionKey,
        messageUid,
        lines,
      }),
    });

    // Mount tty device inside /dev
    const parent = os.root.to.dev as DirectoryINode;
    dispatch(osMountFileAct({ iNode, parent, filename: canonicalFilename }));
    dispatch(osIncrementTtyIdAct({}));

    return { canonicalPath, iNode, sessionKey };
  },
);

interface CreateTtyThunk extends OsThunkAct<OsAct,
{ userKey: string  },
{ canonicalPath: string; iNode: TtyINode; sessionKey: string }
> {
  type: OsAct.OS_CREATE_TTY_THUNK;
}

/**
 * Does the file descriptor point to a terminal device?
 */
export const osIsATtyThunk = createOsThunk<OsAct, IsATtyThunk>(
  OsAct.OS_IS_A_TTY_THUNK,
  ({ dispatch }, { processKey, fd }) => {
    const { iNode } = dispatch(osGetOfdThunk({ processKey, fd }));
    return iNode.type === INodeType.tty;
  },
);
interface IsATtyThunk extends OsThunkAct<OsAct, { processKey: string; fd: number }, boolean> {
  type: OsAct.OS_IS_A_TTY_THUNK;
}

/**
 * If file is a tty then set its prompt.
 * Returns true iff was a tty.
 */
export const osPromptThunk = createOsThunk<OsAct, PromptThunk>(
  OsAct.OS_PROMPT_THUNK,
  ({ dispatch }, { processKey, fd, text }) => {
    const { iNode } = dispatch(osGetOfdThunk({ processKey, fd }));
    if (iNode.type === INodeType.tty) {
      iNode.setXtermPrompt(text);
      return true;
    }
    return false;
  },
);
export interface PromptThunk extends OsThunkAct<OsAct,
{ processKey: string; fd: number; text: string },
boolean
> {
  type: OsAct.OS_PROMPT_THUNK;
}