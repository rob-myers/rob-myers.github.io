import { LevelWorkerContext } from '@model/level/level.worker.model';

const ctxt: LevelWorkerContext = self as any;

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ levelWorkerReceived: msg });

});
