import * as XTerm from 'xterm';
import { createOsThunk, OsThunkAct } from '@model/os/os.redux.model';
import { OsAct } from '@model/os/os.model';
import { TtyINode } from '@store/inode/tty.inode';
import { RedactInReduxDevTools } from '@model/redux.model';
import { ProcessSignal } from '@model/os/process.model';
import { osSignalForegroundThunk, osIncrementTtyIdAct } from './session.os.duck';
import { osMountFileAct, osGetOfdThunk } from './file.os.duck';
import { DirectoryINode } from '@store/inode/directory.inode';
import { INodeType } from '@store/inode/base-inode';

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
      ttyINode.queueCommands({ key: 'clear' });
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
  ({ dispatch, state: { os }}, { xterm }) => {

    const { nextTtyId } = os.aux;
    const canonicalFilename = `tty-${nextTtyId}`;
    const canonicalPath = `/dev/${canonicalFilename}`;
    // const sessionKey = `${userKey}@${canonicalFilename}`;
    const sessionKey = canonicalFilename;
    // console.log({ nextTtyId, canonicalPath, sessionKey }); 

    /**
     * Create tty device.
     */
    const iNode = new TtyINode({
      userKey: 'ged', // TODO
      groupKey: 'ged', // TODO
      xterm,
      linesPerUpdate: 100,
      refreshMs: 20,
      canonicalPath,
      sendSignal: (signal: ProcessSignal) => dispatch(osSignalForegroundThunk({ sessionKey, signal })),
    });

    /**
     * Mount tty device inside /dev.
     */
    const parent = os.root.to.dev as DirectoryINode;
    dispatch(osMountFileAct({ iNode, parent, filename: canonicalFilename }));
    dispatch(osIncrementTtyIdAct({}));

    return { canonicalPath, iNode, sessionKey };
  },
);

interface CreateTtyThunk extends OsThunkAct<OsAct,
  { userKey: string; xterm: XTerm.Terminal & RedactInReduxDevTools },
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
      iNode.receivePrompt(text);
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