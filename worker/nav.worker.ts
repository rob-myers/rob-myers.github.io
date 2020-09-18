import { NavWorker, NavWorkerContext } from '@model/worker/nav.model';

const ctxt: NavWorkerContext = self as any;

(function() {
  ctxt.addEventListener('message', async ({ data: msg }) => {
    console.log({ navWorkerReceived: msg });
    /**
     * TODO
     */
  });
})();

export default {} as Worker & { new (): NavWorker };
