import { LevelWorker } from '@model/level/level.worker.model';
import { listenForRequests } from './handle-requests';

listenForRequests();

export default {} as Worker & { new (): LevelWorker };
