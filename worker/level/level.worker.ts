import { LevelWorker, LevelWorkerContext } from '@model/level/level.worker.model';
import { store } from './create-store';
import { LevelDispatchOverload } from '@model/level/level.redux.model';

const ctxt: LevelWorkerContext = self as any;
const _dispatch = store.dispatch as LevelDispatchOverload;

ctxt.postMessage({ key: 'level-worker-ready' });

export default {} as Worker & { new (): LevelWorker };
