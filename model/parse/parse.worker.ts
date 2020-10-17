import { parseService } from "@model/shell/parse.service";
import { ParseWorkerContext, ParseWorker } from "./parse.msg";

/**
 * This shell-parsing webworker is NOT BEING USED.
 * We can use it if we decide to remove parsing from the main thread.
 */

const ctxt: ParseWorkerContext = self as any;

ctxt.addEventListener('message', async ({ data: msg }) => {
  // console.log({ parseWorkerReceived: msg });

  switch (msg.key) {
    case 'ping-worker': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    case 'req-parse-buffer': {
      ctxt.postMessage({
        key: 'parse-buffer-result',
        msgId: msg.msgId,
        result: parseService.tryParseBuffer(msg.buffer),
      });
      break;
    }
  }
});

export default {} as Worker & { new (): ParseWorker };
