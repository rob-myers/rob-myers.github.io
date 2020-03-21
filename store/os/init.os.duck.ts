/* eslint-disable @typescript-eslint/no-use-before-define */
import { generate } from 'shortid';
import { SyncAct, SyncActDef } from '@model/redux.model';
import { createOsThunk, OsThunkAct, createOsAct } from '@model/os/os.redux.model';
import { OsAct, topLevelDirs } from '@model/os/os.model';
import { State } from './os.duck';
import { UnregisteredProcess } from '@model/os/process.model';
import { osRegisterSessionAct as osRegisterSessionAct } from './session.os.duck';
import { osRegisterProcessAct, osStartProcessThunk } from './process.os.duck';
import { osCreateUserThunk } from './user.os.duck';
import { osOpenFileThunk, osDupFileDescriptorAct } from './file.os.duck';
import { redact } from '@model/redux.model';
import { binaryExecTypes } from '@model/sh/binary.model';
import { builtinBinaryTypes } from '@model/sh/builtin.model';
import { DirectoryINode } from '@store/inode/directory.inode';
import { NullINode } from '@store/inode/null.inode';
import { RandomINode } from '@store/inode/random.inode';
import { RegularINode } from '@store/inode/regular.inode';
import { VoiceINode } from '@store/inode/voice.inode';
import { VoiceCommandSpeech } from '@model/xterm/voice.xterm';
import { awaitParent } from '@model/os/os.worker.model';

export type Action = (
  | OsInitializedAct
  | OsStorePingAct
);

/**
 * Dispatched exactly once by {osInitializeThunk}.
 */
const osInitializedAct = createOsAct<OsAct, OsInitializedAct>(
  OsAct.OS_INITIALIZED,
);
interface OsInitializedAct extends SyncAct<OsAct, {}> {
  type: OsAct.OS_INITIALIZED;
}
export const osInitializedDef: SyncActDef<OsAct, OsInitializedAct, State> = (_, state) => ({
  ...state,
  aux: { ...state.aux, initialized: true },
});

export const osStorePingAct = createOsAct<OsAct, OsStorePingAct>(
  OsAct.OS_STORE_LAST_PING,
);
interface OsStorePingAct extends SyncAct<OsAct, { pingedAtMs: number }> {
  type: OsAct.OS_STORE_LAST_PING;
}
export const osStoreLastPingDef: SyncActDef<OsAct, OsStorePingAct, State> = ({ pingedAtMs }, state) => ({
  ...state,
  aux: { ...state.aux, lastPingMs: pingedAtMs },
});

export type Thunk = (
  | OsInitializeThunk
  | SpawnInitThunk
);

/**
 * Initialize the operating system.
 */
export const osInitializeThunk = createOsThunk<OsAct, OsInitializeThunk>(
  OsAct.OS_INITIALIZE_THUNK,
  ({ dispatch, state: { os: { root }}, worker }) => {
    // Create user 'root' in user-group 'root'.
    dispatch(osCreateUserThunk({ userKey: 'root', groupKeys: [] }));

    // Ensure top-level directories e.g. /root, /dev, /home, /tmp.
    for (const dirName of topLevelDirs.filter((dirname) => !root.to[dirname])) {
      root.addChild(dirName, root.createSubdir());
    }
    // Ensure special inodes /dev/null, /dev/random.
    const dev = root.to.dev as DirectoryINode;
    if (!dev.to.null) {
      dev.addChild('null', new NullINode({ ...dev.def }));
    }
    if (!dev.to.random) {
      dev.addChild('random', new RandomINode({ ...dev.def }));
    }
    if (!dev.to.voice) {
      dev.addChild('voice', new VoiceINode({
        ...dev.def,
        cancelVoiceCommands: (processKey: string) => {
          worker.postMessage({ key: 'cancel-voice-cmds', processKey });
        },
        getVoices: async () => {
          worker.postMessage({ key: 'get-all-voices' });
          const { voices } = await awaitParent('send-all-voices', worker);
          return voices;
        },
        sendVoiceCommand: async (command: VoiceCommandSpeech) => {
          const uid = generate();
          worker.postMessage({ key: 'send-voice-cmd', command, uid });
          await awaitParent('said-voice-cmd', worker, (msg) => msg.uid === uid);
        },
      }));
    }
    // Ensure README in /root
    (root.to['root'] as DirectoryINode).addChild(
      'README',
      new RegularINode(root.to['root'].def, [
        '',
        `${'\x1b[38;5;248;1m'}Javascript bash interpreter by Robert S. R. Myers${'\x1b[0m'}.`,
        `${'\x1b[33m'}site${'\x1b[0m'}: https://rob-myers.github.io`,
        `${'\x1b[33m'}mail${'\x1b[0m'}: me.robmyers@gmail.com`,
        `Built using the excellent shell parser ${'\x1b[38m'}https://github.com/mvdan/sh${'\x1b[0m'}`,
        '',
      ])
    );

    // Ensure binaries in /bin
    const bin = root.to.bin as DirectoryINode;
    [
      ...binaryExecTypes,
      // Some builtins have binaries.
      ...builtinBinaryTypes,
    ].sort().forEach((binaryType) =>
      bin.addChild(binaryType, new RegularINode({ ...bin.def, binaryType })));

    // Spawn the top-level process
    dispatch(osSpawnInitThunk({}));
    // Create user 'user' in user-group 'user'
    dispatch(osCreateUserThunk({ userKey: 'user', groupKeys: [] }));
    // Start init process
    dispatch(osStartProcessThunk({ processKey: 'init' }));
    // Inform listeners we are ready
    dispatch(osInitializedAct({}));
  },
);
interface OsInitializeThunk extends OsThunkAct<OsAct, {}, void> {
  type: OsAct.OS_INITIALIZE_THUNK;
}

/**
 * Spawn the top-level process 'init'.
 * All other processes are descended from forks of it.
 */
export const osSpawnInitThunk = createOsThunk<OsAct, SpawnInitThunk>(
  OsAct.OS_SPAWN_INIT_THUNK,
  ({ dispatch, service }, _) => {

    const userKey = 'root';
    const processKey = 'init';
    // The init process is never started, see TermService.compile.
    const term = service.transpileSh.transpile(service.parseSh.parse(''));
    const observable = service.term.compile({ term, dispatch, processKey });

    const unregisteredProcess: UnregisteredProcess = {
      parentKey: 'init',
      term: redact(term, 'Term'),
      observable: redact(observable, 'Observable'),
      subscription: null,
      nestedVars: [{
        USER: { key: 'string', varName: 'USER', value: 'root', exported: true, readonly: false, to: null },
        OLDPWD: { key: 'string', varName: 'OLDPWD', value: '/root', exported: true, readonly: false, to: null },
        PWD: { key: 'string', varName: 'PWD', value: '/root', exported: true, readonly: false, to: null },
        PATH: { key: 'string', varName: 'PATH', value: '/bin', exported: true, readonly: false, to: null },
      }],
      toFunc: {},
    };

    // init has session sans terminal.
    const sessionKey = 'root@init';
    dispatch(osRegisterSessionAct({
      uiKey: null,
      processKey,
      // init will be in process group 'init'.
      processGroupKey: processKey,
      sessionKey,
      ttyINode: null,
      ttyPath: null,
      userKey,
    }));

    // Register init with state.
    dispatch(osRegisterProcessAct({
      processKey,
      sessionKey,
      userKey,
      parentPgKey: null,
      unregisteredProcess,
      fdToOpenKey: {},
    }));

    // Open /dev/null at std{in,out,err}.
    const { fd } = dispatch(osOpenFileThunk({ processKey, request: { path: '/dev/null', mode: 'RDWR' }}));
    dispatch(osDupFileDescriptorAct({ processKey, srcFd: fd, dstFd: 1 }));
    dispatch(osDupFileDescriptorAct({ processKey, srcFd: fd, dstFd: 2 }));
  },
);
interface SpawnInitThunk extends OsThunkAct<OsAct, {}, void> {
  type: OsAct.OS_SPAWN_INIT_THUNK;
}
