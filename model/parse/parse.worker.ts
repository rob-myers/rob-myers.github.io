import { ParseWorkerContext, ParseWorker } from "./parse.msg";

const ctxt: ParseWorkerContext = self as any;

/**
 * TODO move parse.service into parse.worker.
 */

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ parseWorkerReceived: msg });

  switch (msg.key) {
    case 'ping-worker': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
  }
});

export default {} as Worker & { new (): ParseWorker };
